import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { AppError } from '../middleware/error'
import Team from '../models/team'
import Setting from '../models/setting'
import { GitHubService } from '../services/github.service'
import type { Request, Response, NextFunction } from 'express'
import Course from '../models/course'

const router = Router()

// 处理普通聊天请求
router.post('/chat', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body
    
    if (!messages || !Array.isArray(messages)) {
      return next(new AppError('Messages array is required', 400))
    }
    
    // 获取AI设置
    const settings = await Setting.findOne()
    if (!settings || !settings.aiToken) {
      return next(new AppError('AI settings not configured', 500))
    }
    
    // 构建AI请求
    const aiResponse = await callAI(settings, messages)
    
    res.status(200).json({
      response: aiResponse
    })
  } catch (error: any) {
    next(new AppError(`AI chat failed: ${error.message}`, 500))
  }
})

// 分析团队协作
router.post('/analyze-team', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId, analysisType } = req.body
    
    if (!teamId) {
      return next(new AppError('Team ID is required', 400))
    }
    
    // 获取团队信息
    const team = await Team.findById(teamId)
      .populate({
        path: 'members.userId',
        model: 'User',  // 明确指定模型
        select: 'name email githubId'
      });

    if (!team) {
      return next(new AppError('Team not found', 404))
    }
    
    // 获取GitHub数据
    const repoUrl = team.repositoryUrl
    if (!repoUrl) {
      return next(new AppError('Team has no repository URL', 400))
    }
    
    // 解析仓库所有者和名称
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!repoMatch) {
      return next(new AppError('Invalid GitHub repository URL', 400))
    }
    
    const [, owner, repo] = repoMatch
    
    try {
      console.log(`Fetching GitHub data for ${owner}/${repo}`);
      
      // 获取提交历史 - 限制数量以避免数据过大
      const commits = await GitHubService.getRepositoryCommits(owner, repo.replace('.git', ''), 20);
      console.log(`Retrieved ${commits.length} commits`);
      
      // 获取PR历史 - 限制数量
      const pullRequests = await GitHubService.getRepositoryPullRequests(owner, repo.replace('.git', ''));
      console.log(`Retrieved ${pullRequests.length} pull requests`);
      
      // 获取问题历史 - 限制数量
      const issues = await GitHubService.getRepositoryIssues(owner, repo.replace('.git', ''), 'all');
      const limitedIssues = issues.slice(0, 5); // 只取前5个
      console.log(`Retrieved ${issues.length} issues`);
      
      // 构建团队成员映射
      const teamMembers = team.members.map(member => {
        // 使用类型断言来处理 ObjectId 问题
        const userId = member.userId as any;
        return {
          name: userId?.name || 'Unknown',
          email: userId?.email || '',
          githubId: userId?.githubId || '',
          role: member.role
        };
      });
      
      // 获取AI设置
      const settings = await Setting.findOne();
      if (!settings || !settings.aiToken) {
        return next(new AppError('AI settings not configured', 500));
      }
      
      // 构建简化的提示，减少数据量
      let prompt = '';
      
      if (analysisType === 'collaboration') {
        prompt = buildSimplifiedCollaborationPrompt(team.name, teamMembers, commits, pullRequests, limitedIssues);
      } else if (analysisType === 'code') {
        prompt = buildSimplifiedCodeAnalysisPrompt(team.name, teamMembers, commits);
      } else if (analysisType === 'progress') {
        prompt = buildSimplifiedProgressAnalysisPrompt(team.name, teamMembers, commits, limitedIssues);
      } else if (analysisType === 'learning') {
        prompt = buildLearningPatternsPrompt(team.name, teamMembers, commits, limitedIssues);
      }
      
      // 构建消息
      const messages = [
        {
          role: 'system',
          content: 'You are an expert software development team analyst. Provide concise insights about team collaboration patterns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];
      
      console.log('Calling AI API...');
      // 调用AI
      const aiResponse = await callAI(settings, messages);
      console.log('AI response received');
      
      // 检查是否使用模拟模式
      const useMock = req.query.mock === 'true' || !settings.aiToken;

      if (useMock) {
        console.log('Using mock AI response');
        return res.status(200).json({
          analysis: `# Team Collaboration Analysis for "${team.name}"

## Contribution Distribution
Team members have shown varying levels of contribution. Based on the commit history, there appears to be a balanced distribution of work.

## Collaboration Patterns
The team demonstrates good collaboration through code reviews and issue discussions. Communication seems effective.

## Suggestions for Improvement
1. Consider implementing more detailed commit messages
2. Establish clearer task assignments
3. Increase cross-review of pull requests

*This is a mock analysis for testing purposes.*`
        });
      }
      
      res.status(200).json({
        analysis: aiResponse
      });
    } catch (error: any) {
      console.error('GitHub or AI processing error:', error);
      return next(new AppError(`Error processing GitHub data: ${error.message}`, 500));
    }
  } catch (error: any) {
    console.error('Team analysis error:', error);
    next(new AppError(`Team analysis failed: ${error.message}`, 500));
  }
});

// 分析课程进度
router.post('/analyze-course', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, analysisType } = req.body
    
    if (!courseId) {
      return next(new AppError('Course ID is required', 400))
    }
    
    // 获取课程信息
    const course = await Course.findById(courseId)
    
    if (!course) {
      return next(new AppError('Course not found', 404))
    }
    
    // 获取该课程下的所有团队
    const teams = await Team.find({ course: courseId })
      .populate({
        path: 'members.userId',
        model: 'User',
        select: 'name email githubId'
      });
    
    if (teams.length === 0) {
      return next(new AppError('No teams found for this course', 404))
    }
    
    console.log(`Found ${teams.length} teams for course ${course.name}`);
    
    // 收集所有团队的 GitHub 数据
    const teamsData = await Promise.all(teams.map(async (team) => {
      try {
        // 获取GitHub数据
        const repoUrl = team.repositoryUrl
        if (!repoUrl) {
          return {
            teamName: team.name,
            error: 'No repository URL',
            commits: [],
            issues: []
          }
        }
        
        // 解析仓库所有者和名称
        const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!repoMatch) {
          return {
            teamName: team.name,
            error: 'Invalid GitHub repository URL',
            commits: [],
            issues: []
          }
        }
        
        const [, owner, repo] = repoMatch
        
        // 获取提交历史 - 限制数量以避免数据过大
        const commits = await GitHubService.getRepositoryCommits(owner, repo.replace('.git', ''), 10);
        
        // 获取问题历史 - 限制数量
        const issues = await GitHubService.getRepositoryIssues(owner, repo.replace('.git', ''), 'all');
        const limitedIssues = issues.slice(0, 5); // 只取前5个
        
        // 简化数据，只保留必要信息
        const simplifiedCommits = commits.map(c => ({
          message: c.commit?.message || '',
          date: c.commit?.author?.date || ''
        }));
        
        const simplifiedIssues = limitedIssues.map(issue => ({
          title: issue.title,
          state: issue.state
        }));
        
        return {
          teamName: team.name,
          members: team.members.length,
          commits: simplifiedCommits,
          issues: simplifiedIssues,
          commitCount: commits.length
        }
      } catch (error) {
        console.error(`Error fetching data for team ${team.name}:`, error);
        return {
          teamName: team.name,
          error: 'Failed to fetch GitHub data',
          commits: [],
          issues: []
        }
      }
    }));
    
    // 获取AI设置
    const settings = await Setting.findOne();
    if (!settings || !settings.aiToken) {
      return next(new AppError('AI settings not configured', 500));
    }
    
    // 检查是否使用模拟模式
    const useMock = req.query.mock === 'true' || !settings.aiToken;
    
    if (useMock) {
      console.log('Using mock AI response for course progress');
      return res.status(200).json({
        analysis: `# Course Progress Analysis for "${course.name}"

## Overall Progress
The course has ${teams.length} teams with varying levels of progress.

## Team Status
- **On Track**: 3 teams
- **Behind Schedule**: 1 team
- **At Risk**: 1 team

## Teams Needing Assistance
1. **Team Delta** - No recent commits in the last 2 weeks
2. **Team Omega** - Several unresolved issues and slow progress

## Recommendations
- Schedule check-in meetings with Team Delta and Team Omega
- Provide additional resources on version control and project management
- Consider adjusting the project timeline for struggling teams

*This is a mock analysis for testing purposes.*`
      });
    }
    
    // 构建AI提示
    const messages = [
      {
        role: 'system',
        content: 'You are an educational analytics assistant that helps instructors analyze course progress.'
      },
      {
        role: 'user',
        content: buildCourseProgressPrompt(course.name, teamsData)
      }
    ];
    
    // 调用AI API
    try {
      const aiResponse = await callAI(settings, messages);
      console.log('AI response received for course progress');
      
      res.status(200).json({
        analysis: aiResponse
      });
    } catch (error: any) {
      next(new AppError(`Course analysis failed: ${error.message}`, 500));
    }
  } catch (error: any) {
    console.error('Error processing course data:', error);
    next(new AppError(`Error processing course data: ${error.message}`, 500));
  }
});

// 调用AI API
async function callAI(settings: any, messages: any[]) {
  const endpoint = settings.aiEndpoint.trim();
  const token = settings.aiToken.trim();
  const model = settings.aiModel.trim();
  
  try {
    // 检查端点格式
    if (!endpoint.startsWith('http')) {
      throw new Error(`Invalid API endpoint: ${endpoint}`);
    }
    
    console.log(`Calling AI API at ${endpoint} with model ${model}`);
    
    // 构建完整的 API URL
    let apiUrl = endpoint;
    if (!apiUrl.endsWith('/')) {
      apiUrl += '/';
    }
    
    // 根据端点类型选择不同的 API 路径
    if (apiUrl.includes('openai.com')) {
      apiUrl += 'v1/chat/completions';
    } else {
      apiUrl += 'chat/completions';
    }
    
    console.log(`Full API URL: ${apiUrl}`);
    
    // 构建请求体
    const requestBody = {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000  // 限制响应长度
    };
    
    console.log('Request headers:', {
      'Authorization': `Bearer ${token.substring(0, 5)}...`,
      'Content-Type': 'application/json'
    });
    
    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, response.headers);
    
    // 检查响应状态
    if (!response.ok) {
      // 尝试获取响应内容，无论是JSON还是文本
      const contentType = response.headers.get('content-type');
      let errorData;
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
        console.error('AI API JSON error:', errorData);
      } else {
        errorData = await response.text();
        console.error('AI API text error (first 500 chars):', errorData.substring(0, 500));
      }
      
      throw new Error(`AI API responded with status: ${response.status}, URL: ${response.url}`);
    }
    
    // 获取响应内容
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Unexpected response type:', contentType);
      console.error('Response text (first 500 chars):', text.substring(0, 500));
      throw new Error(`AI API returned non-JSON response: ${contentType}`);
    }
    
    // 解析JSON响应
    const data = await response.json();
    console.log('API response structure:', Object.keys(data));
    
    // 验证响应格式
    if (!data.choices || !data.choices[0]) {
      console.error('Unexpected API response format:', data);
      throw new Error('AI API returned an unexpected response format');
    }
    
    // 处理不同的响应格式
    let content = '';
    if (data.choices[0].message) {
      content = data.choices[0].message.content;
    } else if (data.choices[0].text) {
      content = data.choices[0].text;
    } else {
      console.error('Cannot find content in response:', data.choices[0]);
      throw new Error('Cannot find content in AI response');
    }
    
    return content;
  } catch (error: any) {
    console.error('AI API call error:', error);
    throw new Error(`Failed to call AI API: ${error.message}`);
  }
}

// 简化的协作分析提示
function buildSimplifiedCollaborationPrompt(teamName: string, members: any[], commits: any[], pullRequests: any[], issues: any[]) {
  // 提取关键信息，减少数据量
  const simplifiedCommits = commits.map(c => ({
    sha: c.sha?.substring(0, 7) || '',
    message: c.commit?.message || '',
    author: c.commit?.author?.name || c.author?.login || 'Unknown',
    date: c.commit?.author?.date || ''
  }));
  
  const simplifiedPRs = pullRequests.slice(0, 10).map(pr => ({
    title: pr.title,
    state: pr.state,
    user: pr.user?.login || 'Unknown',
    created_at: pr.created_at,
    merged_at: pr.merged_at
  }));
  
  const simplifiedIssues = issues.slice(0, 10).map(issue => ({
    title: issue.title,
    state: issue.state,
    user: issue.user?.login || 'Unknown',
    created_at: issue.created_at,
    closed_at: issue.closed_at
  }));
  
  return `
Analyze collaboration patterns for team "${teamName}" based on GitHub data.

Team Members:
${members.map(m => `- ${m.name} (${m.githubId || 'No GitHub ID'}) - ${m.role}`).join('\n')}

Recent Commits (${simplifiedCommits.length}):
${JSON.stringify(simplifiedCommits, null, 2)}

Recent Pull Requests (${simplifiedPRs.length}):
${JSON.stringify(simplifiedPRs, null, 2)}

Recent Issues (${simplifiedIssues.length}):
${JSON.stringify(simplifiedIssues, null, 2)}

Please provide a brief analysis of:
1. Contribution distribution
2. Collaboration patterns
3. Suggestions for improvement
`;
}

// 简化的代码分析提示
function buildSimplifiedCodeAnalysisPrompt(teamName: string, members: any[], commits: any[]) {
  // 提取关键信息，减少数据量
  const simplifiedCommits = commits.map(c => ({
    sha: c.sha?.substring(0, 7) || '',
    message: c.commit?.message || '',
    author: c.commit?.author?.name || c.author?.login || 'Unknown',
    date: c.commit?.author?.date || ''
  }));
  
  return `
Analyze code quality for team "${teamName}" based on GitHub data.

Team Members:
${members.map(m => `- ${m.name} (${m.githubId || 'No GitHub ID'}) - ${m.role}`).join('\n')}

Recent Commits (${simplifiedCommits.length}):
${JSON.stringify(simplifiedCommits, null, 2)}

Please provide a brief analysis of:
1. Code quality indicators
2. Potential code hotspots
3. Suggestions for improvement
`;
}

// 简化的进度分析提示
function buildSimplifiedProgressAnalysisPrompt(teamName: string, members: any[], commits: any[], issues: any[]) {
  // 提取关键信息，减少数据量
  const simplifiedCommits = commits.map(c => ({
    sha: c.sha?.substring(0, 7) || '',
    message: c.commit?.message || '',
    author: c.commit?.author?.name || c.author?.login || 'Unknown',
    date: c.commit?.author?.date || ''
  }));
  
  const simplifiedIssues = issues.slice(0, 10).map(issue => ({
    title: issue.title,
    state: issue.state,
    user: issue.user?.login || 'Unknown',
    created_at: issue.created_at,
    closed_at: issue.closed_at
  }));
  
  return `
Analyze project progress for team "${teamName}" based on GitHub data.

Team Members:
${members.map(m => `- ${m.name} (${m.githubId || 'No GitHub ID'}) - ${m.role}`).join('\n')}

Recent Commits (${simplifiedCommits.length}):
${JSON.stringify(simplifiedCommits, null, 2)}

Recent Issues (${simplifiedIssues.length}):
${JSON.stringify(simplifiedIssues, null, 2)}

Please provide a brief analysis of:
1. Project velocity
2. Milestone progress
3. Suggestions for improvement
`;
}

// 构建课程进度分析提示
function buildCourseProgressPrompt(courseName: string, teamsData: any[]) {
  // 提取关键信息，减少数据量
  const teamsInfo = teamsData.map(team => ({
    name: team.teamName,
    members: team.members || 0,
    commitCount: team.commits?.length || 0,
    issueCount: team.issues?.length || 0,
    recentCommits: team.commits?.slice(0, 3).map((c: any) => c.message) || []
  }));
  
  return `
Analyze the progress of all teams in the course "${courseName}" based on GitHub data.

Course Teams (${teamsData.length}):
${JSON.stringify(teamsInfo, null, 2)}

Please provide a comprehensive analysis of:
1. Overall course progress
2. Teams that are on track
3. Teams that need assistance
4. Specific recommendations for instructors

Focus on identifying which teams might be falling behind and need additional support.
`;
}

// 构建学习模式分析提示
function buildLearningPatternsPrompt(teamName: string, members: any[], commits: any[], issues: any[]) {
  // 提取关键信息，减少数据量
  const simplifiedCommits = commits.map(c => ({
    message: c.commit?.message || '',
    author: c.commit?.author?.name || c.author?.login || 'Unknown',
    date: c.commit?.author?.date || ''
  }));
  
  // 按作者分组提交
  const commitsByAuthor: { [key: string]: any[] } = {};
  simplifiedCommits.forEach(commit => {
    if (!commitsByAuthor[commit.author]) {
      commitsByAuthor[commit.author] = [];
    }
    commitsByAuthor[commit.author].push(commit);
  });
  
  // 简化问题
  const simplifiedIssues = issues.slice(0, 5).map(issue => ({
    title: issue.title,
    state: issue.state,
    user: issue.user?.login || 'Unknown'
  }));
  
  return `
Analyze learning patterns for team "${teamName}" based on GitHub activity.

Team Members:
${members.map(m => `- ${m.name} (${m.githubId || 'No GitHub ID'}) - ${m.role}`).join('\n')}

Commit Activity by Member:
${Object.keys(commitsByAuthor).map(author => 
  `${author} (${commitsByAuthor[author].length} commits):\n` +
  commitsByAuthor[author].slice(0, 3).map(c => `- ${c.message.split('\n')[0]}`).join('\n')
).join('\n\n')}

Recent Issues:
${simplifiedIssues.map(i => `- ${i.title} (${i.state}) by ${i.user}`).join('\n')}

Please provide an analysis of:
1. Individual learning patterns for each team member
2. Strengths and areas for improvement
3. Personalized teaching recommendations
4. Suggested learning resources or activities

Focus on identifying each student's learning style, pace, and areas where they might need additional support.
`;
}

export default router 