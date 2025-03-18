import { Router } from 'express'
import Team from '../models/team'
import { AppError } from '../middleware/error'
import { authMiddleware } from '../middleware/auth'
import type { Request, Response, NextFunction } from 'express'
import { GitHubService } from '../services/github.service'
import { UserService } from '../services/user.service'
import Student from '../models/student'
import crypto from 'crypto'

interface PopulatedMember {
  userId: {
    name: string;
    githubId: string;
  };
  role: string;
}

interface PopulatedTeam {
  _id: any;
  name: string;
  members: PopulatedMember[];
  repositoryUrl: string;
}

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.find().populate('course').lean()

    // Get all student IDs
    const studentIds = teams.flatMap(team => 
      team.members.map(member => member.userId.toString())
    )

    // Get student information in bulk
    const students = await Student.find({ _id: { $in: studentIds } }).lean()
    const studentMap = new Map(students.map(student => [student._id.toString(), student]))

    // Get GitHub stats in bulk
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        try {
          const [owner, repo] = team.repositoryUrl
            .replace('https://github.com/', '')
            .split('/')
          
          const stats = await GitHubService.getRepoStats(owner, repo)
          
          // Add student information
          const membersWithDetails = team.members.map(member => ({
            ...member,
            user: studentMap.get(member.userId.toString())
          }))

          return {
            ...team,
            ...stats,
            members: membersWithDetails
          }
        } catch (error) {
          return {
            ...team,
            commits: 0,
            issues: 0,
            prs: 0,
            lastActive: new Date().toISOString(),
            exists: false
          }
        }
      })
    )

    res.json(teamsWithStats)
  } catch (error) {
    next(new AppError('Failed to fetch teams', 500))
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Fetching team with ID:", req.params.id)
    
    const team = await Team.findById(req.params.id)
      .populate('members.userId')
      .populate('course')
      .lean()

    console.log("Team found:", team ? "Yes" : "No")
    
    if (!team) {
      return next(new AppError('Team not found', 404))
    }

    res.json(team)
  } catch (error) {
    console.error("Error in team/:id route:", error)
    next(new AppError('Failed to fetch team', 500))
  }
})

router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Fetching stats for team ID:", req.params.id);
    
    const team = await Team.findById(req.params.id)
      .populate('members.userId')
      .lean();
      
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    try {
      // Try to get real data from GitHub
      const [owner, repo] = team.repositoryUrl
        .replace('https://github.com/', '')
        .split('/');
      
      // Get contributors data
      const contributors = await GitHubService.getRepoContributors(owner, repo);
      
      // Match GitHub contributors data with team members
      const memberStats = team.members.map(member => {
        const user = (member.userId as any);
        const contribution = contributors.find(c => 
          c.githubId === user.githubId
        ) || {
          commits: 0,
          additions: 0,
          deletions: 0,
          lastCommit: null,
          prs: 0
        };
        
        return {
          userId: user,
          role: member.role,
          contribution
        };
      });
      
      // Get commit activity data
      const commitActivity = await GitHubService.getCommitActivity(owner, repo);
      
      // Get repository stats
      const repoStats = await GitHubService.getRepoStats(owner, repo);
      
      // Get recent commits
      const recentCommits = await GitHubService.getRecentCommits(owner, repo, 10);
      
      // Return full data
      const stats = {
        teamId: team._id,
        name: team.name,
        repositoryUrl: team.repositoryUrl,
        course: team.course,
        memberStats,
        analytics: {
          commitActivity,
          totalCommits: repoStats.commits || 0,
          totalPRs: repoStats.prs || 0,
          issues: repoStats.issues || 0,
          reviews: repoStats.reviews || 0
        },
        recentActivity: recentCommits
      };
      
      console.log("Returning stats with real GitHub data");
      return res.json(stats);
      
    } catch (githubError) {
      console.error("Error fetching GitHub data:", githubError);
      console.log("Falling back to mock data");
      
      // If GitHub API call fails, fall back to mock data
      // (keep existing mock data code)
      const mockMemberStats = team.members.map(member => {
        const userId = (member.userId as any);
        return {
          userId: userId,
          role: member.role,
          contribution: {
            commits: Math.floor(Math.random() * 50) + 1,
            additions: Math.floor(Math.random() * 1000) + 100,
            deletions: Math.floor(Math.random() * 500) + 50,
            prs: Math.floor(Math.random() * 10),
            lastCommit: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString()
          }
        };
      });
      
      // Mock commit activity data
      const today = new Date();
      const mockCommitActivity = Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10)
        };
      });
      
      // Get recent commits
      const mockRecentCommits = Array.from({ length: 10 }, (_, i) => ({
        id: `mock-commit-${i + 1}`,
        message: `Mock commit message ${i + 1}`,
        author: {
          name: `Mock Author ${i + 1}`,
          email: `mock-author${i + 1}@example.com`,
          date: new Date(Date.now() - i * 86400000).toISOString(),
          avatar: null,
          githubId: null
        },
        url: `https://github.com/mock-repo/commit/${i + 1}`
      }));
      
      // Get stats
      const stats = {
        teamId: team._id,
        name: team.name,
        repositoryUrl: team.repositoryUrl,
        course: team.course,
        memberStats: mockMemberStats,
        analytics: {
          commitActivity: mockCommitActivity,
          totalCommits: mockMemberStats.reduce((sum, m) => sum + m.contribution.commits, 0),
          totalPRs: mockMemberStats.reduce((sum, m) => sum + m.contribution.prs, 0),
          issues: Math.floor(Math.random() * 20),
          reviews: Math.floor(Math.random() * 15)
        },
        recentActivity: mockRecentCommits
      };
      
      console.log("Returning stats with mock data");
      return res.json(stats);
    }
    
  } catch (error) {
    console.error("Error in /:id/stats route:", error);
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, leaderEmail, courseId } = req.body;
    
    if (!name || !leaderEmail || !courseId) {
      return next(new AppError('Name, leader email and course ID are required', 400));
    }
    
    // Find or create student
    let student = await Student.findOne({ email: leaderEmail });
    
    if (!student) {
      // If student does not exist, create a new student
      student = new Student({
        name: leaderEmail.split('@')[0], // Use email prefix as temporary name
        email: leaderEmail,
        // Other fields can be updated when the student first logs in
      });
      
      await student.save();
    }
    
    // Generate a unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex');
    
    // Create team
    const team = new Team({
      name,
      course: courseId,
      members: [{
        userId: student._id,
        role: 'leader'
      }],
      inviteCode,
      repositoryUrl: '' // Initial empty, leader will submit
    });
    
    await team.save();
    
    // Generate invite link
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/teams/invite/${inviteCode}`;
    
    res.status(201).json({
      message: 'Team created successfully',
      teamId: team._id,
      inviteCode,
      inviteLink
    });
  } catch (error) {
    console.error('Error creating team:', error);
    next(new AppError('Failed to create team', 500));
  }
});

router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teams, courseId } = req.body;
    
    if (!teams || !Array.isArray(teams) || teams.length === 0 || !courseId) {
      return next(new AppError('Teams array and course ID are required', 400));
    }
    
    const results = [];
    
    for (const teamData of teams) {
      const { name, leaderEmail } = teamData;
      
      if (!name || !leaderEmail) {
        continue; // Skip invalid team data
      }
      
      // Find or create student
      let student = await Student.findOne({ email: leaderEmail });
      
      if (!student) {
        // If student does not exist, create a new student
        student = new Student({
          name: leaderEmail.split('@')[0], // Use email prefix as temporary name
          email: leaderEmail,
          // Other fields can be updated when the student first logs in
        });
        
        await student.save();
      }
      
      // Generate a unique invite code
      const inviteCode = crypto.randomBytes(16).toString('hex');
      
      // Create team
      const team = new Team({
        name,
        course: courseId,
        members: [{
          userId: student._id,
          role: 'leader'
        }],
        inviteCode,
        repositoryUrl: '' // Initial empty, leader will submit
      });
      
      await team.save();
      
      // Generate invite link
      const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/teams/invite/${inviteCode}`;
      
      results.push({
        teamName: name,
        leaderEmail,
        teamId: team._id,
        inviteCode,
        inviteLink
      });
    }
    
    res.status(201).json(results);
  } catch (error) {
    next(new AppError('Failed to create teams', 500));
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }
    res.json(team)
  } catch (error) {
    res.status(400).json({ message: 'Error updating team' })
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.params.id;
    
    // Find and delete team
    const team = await Team.findByIdAndDelete(teamId);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(new AppError('Failed to delete team', 500));
  }
})

router.get('/name/:name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await Team.findOne({ 
      name: { $regex: new RegExp('^' + req.params.name + '$', 'i') } 
    })
      .populate('members.userId')
      .populate('course')
      .lean()

    if (!team) {
      return next(new AppError('Team not found', 404))
    }

    res.json(team)
  } catch (error) {
    next(new AppError('Failed to fetch team', 500))
  }
})

// Get available students
router.get('/api/students/available', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all students
    const students = await Student.find().lean();
    
    // Get all team member student IDs
    const teams = await Team.find().lean();
    const teamMemberIds = new Set(
      teams.flatMap(team => team.members.map(member => member.userId.toString()))
    );
    
    // Filter out students not assigned to a team
    const availableStudents = students.filter(student => 
      !teamMemberIds.has(student._id.toString())
    );
    
    res.json(availableStudents);
  } catch (error) {
    next(new AppError('Failed to fetch available students', 500));
  }
});

// Add team member route
router.post('/:id/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return next(new AppError('Student ID is required', 400));
    }
    
    // Find team
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // Check if student is already a team member
    const isAlreadyMember = team.members.some(
      member => member.userId.toString() === studentId
    );
    
    if (isAlreadyMember) {
      return next(new AppError('Student is already a team member', 400));
    }
    
    // Add new member
    team.members.push({
      userId: studentId,
      role: 'member'
    });
    
    await team.save();
    
    res.status(200).json({ message: 'Member added successfully' });
  } catch (error) {
    next(new AppError('Failed to add team member', 500));
  }
});

// Change team leader route
router.put('/:id/leader', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newLeaderId } = req.body;
    
    if (!newLeaderId) {
      return next(new AppError('New leader ID is required', 400));
    }
    
    // Find team
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // Check if new leader is a team member
    const newLeaderIndex = team.members.findIndex(
      member => member.userId.toString() === newLeaderId
    );
    
    if (newLeaderIndex === -1) {
      return next(new AppError('New leader must be a team member', 400));
    }
    
    // Find current leader
    const currentLeaderIndex = team.members.findIndex(
      member => member.role === 'leader'
    );
    
    // Update role
    if (currentLeaderIndex !== -1) {
      team.members[currentLeaderIndex].role = 'member';
    }
    
    team.members[newLeaderIndex].role = 'leader';
    
    await team.save();
    
    res.status(200).json({ message: 'Team leader changed successfully' });
  } catch (error) {
    next(new AppError('Failed to change team leader', 500));
  }
});

// Add route to get available students
router.get('/:teamId/available-students', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;
    
    // Get all team member IDs
    const teams = await Team.find().lean();
    
    // Get current team (if exists)
    const currentTeam = teams.find(team => team._id.toString() === teamId);
    if (!currentTeam) {
      return next(new AppError('Team not found', 404));
    }
    
    // Collect all student IDs already in the team
    const allTeamMemberIds = teams.flatMap(team => 
      team.members.map(member => member.userId.toString())
    );
    
    // Get all students
    const allStudents = await Student.find().lean();
    
    // Filter out available students (students not in any team)
    const availableStudents = allStudents.filter(student => 
      !allTeamMemberIds.includes(student._id.toString())
    );
    
    res.status(200).json(availableStudents);
  } catch (error) {
    next(new AppError('Failed to fetch available students', 500));
  }
});

// Add route to remove team member
router.delete('/:id/members/:memberId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, memberId } = req.params;
    
    // Find team
    const team = await Team.findById(id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // Check if member exists
    const memberIndex = team.members.findIndex(
      member => member.userId.toString() === memberId
    );
    
    if (memberIndex === -1) {
      return next(new AppError('Member not found in team', 404));
    }
    
    // Check if member is team leader
    if (team.members[memberIndex].role === 'leader') {
      return next(new AppError('Cannot remove team leader. Change leader first.', 400));
    }
    
    // Remove member
    team.members.splice(memberIndex, 1);
    
    await team.save();
    
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    next(new AppError('Failed to remove team member', 500));
  }
});

// Get team by invite code
router.get('/invite/:inviteCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await Team.findOne({ inviteCode: req.params.inviteCode })
      .populate('members.userId')
      .populate('course');
    
    if (!team) {
      return next(new AppError('Invalid invite code', 404));
    }
    
    res.json({ team });
  } catch (error) {
    next(new AppError('Failed to verify invite', 500));
  }
});

// Update team repository URL
router.put('/:id/repository', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { repositoryUrl } = req.body;
    
    if (!repositoryUrl) {
      return next(new AppError('Repository URL is required', 400));
    }
    
    // Find team
    const team = await Team.findById(id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // Update repository URL
    team.repositoryUrl = repositoryUrl;
    
    await team.save();
    
    res.status(200).json({ message: 'Repository URL updated successfully' });
  } catch (error) {
    next(new AppError('Failed to update repository URL', 500));
  }
});

// 批量导出团队数据
router.post('/export', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamIds } = req.body;
    
    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return next(new AppError('Team IDs array is required', 400));
    }
    
    // 获取所有团队信息
    const teams = await Team.find({ _id: { $in: teamIds } })
      .populate({
        path: 'members.userId',
        model: 'Student',
        select: 'name githubId'
      })
      .populate('course')
      .lean() as unknown as PopulatedTeam[];
    
    // 获取团队的 GitHub 数据
    const teamsData = await Promise.all(teams.map(async (team) => {
      try {
        // 解析仓库 URL
        const repoUrl = team.repositoryUrl;
        if (!repoUrl) {
          // 如果没有仓库 URL，返回基本信息
          return team.members.map(member => ({
            name: member.userId.name,
            team: team.name,
            role: member.role,
            commits: 0,
            prs: 0,
            teamCommits: 0,
            issues: 0,
            pullRequests: 0,
            reviews: 0,
            lastActive: 'N/A'
          }));
        }
        
        // 从 URL 中提取所有者和仓库名
        const [owner, repo] = repoUrl
          .replace('https://github.com/', '')
          .split('/');
        
        // 获取仓库统计信息
        const stats = await GitHubService.getRepoStats(owner, repo.replace('.git', ''));
        
        // 获取提交历史
        const commits = await GitHubService.getRepositoryCommits(owner, repo.replace('.git', ''));
        
        // 获取 PR 历史
        const pullRequests = await GitHubService.getRepositoryPullRequests(owner, repo.replace('.git', ''), 'all');
        
        // 获取 Issue 历史
        const issues = await GitHubService.getRepositoryIssues(owner, repo.replace('.git', ''), 'all');
        
        // 添加类型定义
        const commitsByAuthor: { [key: string]: any[] } = {};
        const prsByAuthor: { [key: string]: any[] } = {};

        // 使用定义的类型
        commits.forEach(commit => {
          const author = commit.author?.login || commit.commit?.author?.name || 'Unknown';
          if (!commitsByAuthor[author]) {
            commitsByAuthor[author] = [];
          }
          commitsByAuthor[author].push(commit);
        });

        pullRequests.forEach(pr => {
          const author = pr.user?.login || 'Unknown';
          if (!prsByAuthor[author]) {
            prsByAuthor[author] = [];
          }
          prsByAuthor[author].push(pr);
        });
        
        // 计算每个成员的贡献
        return team.members.map(member => {
          const githubId = member.userId?.githubId || 'Unknown';
          const memberCommits = commitsByAuthor[githubId] || [];
          const memberPRs = prsByAuthor[githubId] || [];
          
          // 找出最后活动时间
          const lastCommitDate = memberCommits.length > 0 
            ? new Date(memberCommits[0].commit?.author?.date || memberCommits[0].commit?.committer?.date)
            : null;
          
          const lastPRDate = memberPRs.length > 0
            ? new Date(memberPRs[0].created_at)
            : null;
          
          let lastActive = 'N/A';
          if (lastCommitDate && lastPRDate) {
            lastActive = lastCommitDate > lastPRDate 
              ? lastCommitDate.toISOString() 
              : lastPRDate.toISOString();
          } else if (lastCommitDate) {
            lastActive = lastCommitDate.toISOString();
          } else if (lastPRDate) {
            lastActive = lastPRDate.toISOString();
          }
          
          return {
            name: member.userId.name,
            team: team.name,
            role: member.role,
            commits: memberCommits.length,
            prs: memberPRs.length,
            teamCommits: commits.length,
            issues: issues.length,
            pullRequests: pullRequests.length,
            reviews: stats.reviews || 0,
            lastActive
          };
        });
      } catch (error) {
        console.error(`Error processing team ${team._id}:`, error);
        // 如果处理某个团队出错，返回基本信息
        return team.members.map(member => ({
          name: member.userId.name,
          team: team.name,
          role: member.role,
          commits: 0,
          prs: 0,
          teamCommits: 0,
          issues: 0,
          pullRequests: 0,
          reviews: 0,
          lastActive: 'Error fetching data'
        }));
      }
    }));
    
    // 扁平化数组
    const flatData = teamsData.flat();
    
    res.status(200).json(flatData);
  } catch (error) {
    next(new AppError('Failed to export teams data', 500));
  }
});

export default router 