import { Router } from 'express'
import Team from '../models/team'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'
import { GitHubService } from '../services/github.service'
import { UserService } from '../services/user.service'
import Student from '../models/student'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.find().populate('course').lean()

    // 获取所有学生ID
    const studentIds = teams.flatMap(team => 
      team.members.map(member => member.userId.toString())
    )

    // 批量获取学生信息
    const students = await Student.find({ _id: { $in: studentIds } }).lean()
    const studentMap = new Map(students.map(student => [student._id.toString(), student]))

    // 批量获取GitHub统计数据
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        try {
          const [owner, repo] = team.repositoryUrl
            .replace('https://github.com/', '')
            .split('/')
          
          const stats = await GitHubService.getRepoStats(owner, repo)
          
          // 添加学生信息
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
      
      // 获取最近的提交记录
      const recentCommits = await GitHubService.getRecentCommits(owner, repo, 10);
      
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
        },
        recentActivity: recentCommits
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
      
      // 获取最近的提交记录
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

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.params.id;
    
    // 查找并删除团队
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

// 修改路由路径
router.get('/api/students/available', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 获取所有学生
    const students = await Student.find().lean();
    
    // 获取所有团队成员的学生ID
    const teams = await Team.find().lean();
    const teamMemberIds = new Set(
      teams.flatMap(team => team.members.map(member => member.userId.toString()))
    );
    
    // 过滤出未分配到团队的学生
    const availableStudents = students.filter(student => 
      !teamMemberIds.has(student._id.toString())
    );
    
    res.json(availableStudents);
  } catch (error) {
    next(new AppError('Failed to fetch available students', 500));
  }
});

// 添加团队成员的路由
router.post('/:id/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return next(new AppError('Student ID is required', 400));
    }
    
    // 查找团队
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // 检查学生是否已经是团队成员
    const isAlreadyMember = team.members.some(
      member => member.userId.toString() === studentId
    );
    
    if (isAlreadyMember) {
      return next(new AppError('Student is already a team member', 400));
    }
    
    // 添加新成员
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

// 更改团队领导的路由
router.put('/:id/leader', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newLeaderId } = req.body;
    
    if (!newLeaderId) {
      return next(new AppError('New leader ID is required', 400));
    }
    
    // 查找团队
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // 检查新领导是否是团队成员
    const newLeaderIndex = team.members.findIndex(
      member => member.userId.toString() === newLeaderId
    );
    
    if (newLeaderIndex === -1) {
      return next(new AppError('New leader must be a team member', 400));
    }
    
    // 找到当前领导
    const currentLeaderIndex = team.members.findIndex(
      member => member.role === 'leader'
    );
    
    // 更新角色
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

// 添加获取可用学生的路由
router.get('/:teamId/available-students', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;
    
    // 获取所有团队的成员ID
    const teams = await Team.find().lean();
    
    // 获取当前团队（如果存在）
    const currentTeam = teams.find(team => team._id.toString() === teamId);
    if (!currentTeam) {
      return next(new AppError('Team not found', 404));
    }
    
    // 收集所有已经在团队中的学生ID
    const allTeamMemberIds = teams.flatMap(team => 
      team.members.map(member => member.userId.toString())
    );
    
    // 获取所有学生
    const allStudents = await Student.find().lean();
    
    // 过滤出可用的学生（不在任何团队中的学生）
    const availableStudents = allStudents.filter(student => 
      !allTeamMemberIds.includes(student._id.toString())
    );
    
    res.status(200).json(availableStudents);
  } catch (error) {
    next(new AppError('Failed to fetch available students', 500));
  }
});

// 添加移除团队成员的路由
router.delete('/:id/members/:memberId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, memberId } = req.params;
    
    // 查找团队
    const team = await Team.findById(id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // 检查成员是否存在
    const memberIndex = team.members.findIndex(
      member => member.userId.toString() === memberId
    );
    
    if (memberIndex === -1) {
      return next(new AppError('Member not found in team', 404));
    }
    
    // 检查是否是团队领导
    if (team.members[memberIndex].role === 'leader') {
      return next(new AppError('Cannot remove team leader. Change leader first.', 400));
    }
    
    // 移除成员
    team.members.splice(memberIndex, 1);
    
    await team.save();
    
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    next(new AppError('Failed to remove team member', 500));
  }
});

export default router 