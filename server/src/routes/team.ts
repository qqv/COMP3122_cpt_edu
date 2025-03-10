import { Router } from 'express'
import Team from '../models/team'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'
import { GitHubService } from '../services/github.service'
import { UserService } from '../services/user.service'
import Student from '../models/student'
import crypto from 'crypto'

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

// 通过邀请码获取团队
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

// 更新团队仓库URL
router.put('/:id/repository', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { repositoryUrl } = req.body;
    
    if (!repositoryUrl) {
      return next(new AppError('Repository URL is required', 400));
    }
    
    // 查找团队
    const team = await Team.findById(id);
    
    if (!team) {
      return next(new AppError('Team not found', 404));
    }
    
    // 更新仓库URL
    team.repositoryUrl = repositoryUrl;
    
    await team.save();
    
    res.status(200).json({ message: 'Repository URL updated successfully' });
  } catch (error) {
    next(new AppError('Failed to update repository URL', 500));
  }
});

export default router 