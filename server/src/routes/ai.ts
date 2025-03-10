import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { AppError } from '../middleware/error'
import Team from '../models/team'
import Setting from '../models/setting'
import { GitHubService } from '../services/github.service'
import type { Request, Response, NextFunction } from 'express'

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
      const issues = await GitHubService.getRepositoryIssues(owner, repo.replace('.git', ''));
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
        prompt = buildSimplifiedCollaborationPrompt(team.name, teamMembers, commits, pullRequests, issues);
      } else if (analysisType === 'code') {
        prompt = buildSimplifiedCodeAnalysisPrompt(team.name, teamMembers, commits);
      } else if (analysisType === 'progress') {
        prompt = buildSimplifiedProgressAnalysisPrompt(team.name, teamMembers, commits, issues);
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

export default router 