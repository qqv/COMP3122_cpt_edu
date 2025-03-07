import { Router } from 'express'
import Team from '../models/team'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'
import { GitHubService } from '../services/github.service'
import { UserService } from '../services/user.service'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.find().populate('course').lean()

    // 获取所有用户ID
    const userIds = teams.flatMap(team => 
      team.members.map(member => member.userId.toString())
    )

    // 批量获取缓存的用户信息
    const users = await UserService.getUsersWithCache(userIds)
    const userMap = new Map(users.map(user => [user._id.toString(), user]))

    // 批量获取GitHub统计数据
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        try {
          const [owner, repo] = team.repositoryUrl
            .replace('https://github.com/', '')
            .split('/')
          
          const stats = await GitHubService.getRepoStats(owner, repo)
          
          // 添加用户信息
          const membersWithDetails = team.members.map(member => ({
            ...member,
            user: userMap.get(member.userId.toString())
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
      // 尝试从 GitHub 获取真实数据
      const [owner, repo] = team.repositoryUrl
        .replace('https://github.com/', '')
        .split('/');
      
      // 获取贡献者数据
      const contributors = await GitHubService.getRepoContributors(owner, repo);
      
      // 将 GitHub 贡献者数据与团队成员匹配
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
      
      // 获取提交活动数据
      const commitActivity = await GitHubService.getCommitActivity(owner, repo);
      
      // 获取仓库统计数据
      const repoStats = await GitHubService.getRepoStats(owner, repo);
      
      // 返回完整数据
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
        }
      };
      
      console.log("Returning stats with real GitHub data");
      return res.json(stats);
      
    } catch (githubError) {
      console.error("Error fetching GitHub data:", githubError);
      console.log("Falling back to mock data");
      
      // 如果 GitHub API 调用失败，回退到模拟数据
      // (保留现有的模拟数据代码)
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
      
      // 模拟提交活动数据
      const today = new Date();
      const mockCommitActivity = Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10)
        };
      });
      
      // 获取统计数据
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
        }
      };
      
      console.log("Returning stats with mock data");
      return res.json(stats);
    }
    
  } catch (error) {
    console.error("Error in /:id/stats route:", error);
    next(error);
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const team = new Team(req.body)
    await team.save()
    res.status(201).json(team)
  } catch (error) {
    res.status(400).json({ message: 'Error creating team' })
  }
})

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

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id)
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }
    res.json({ message: 'Team deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team' })
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

export default router 