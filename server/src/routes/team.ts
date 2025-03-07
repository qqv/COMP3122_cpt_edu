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
    const team = await Team.findById(req.params.id)
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

router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.userId')
      .lean()

    if (!team) {
      throw new AppError('Team not found', 404)
    }

    const [owner, repo] = team.repositoryUrl
      .replace('https://github.com/', '')
      .split('/')

    const contributors = await GitHubService.getRepoContributors(owner, repo)
    
    interface PopulatedUser {
      _id: string
      name: string
      githubId: string
      email: string
    }

    // 将 GitHub 贡献者数据与团队成员匹配
    const memberStats = team.members.map(member => {
      const user = (member.userId as unknown) as PopulatedUser // 双重类型断言
      const contribution = contributors.find(c => 
        c.githubId === user.githubId
      ) || {
        commits: 0,
        additions: 0,
        deletions: 0,
        lastCommit: null
      }

      return {
        ...member,
        contribution
      }
    })

    res.json({
      teamId: team._id,
      name: team.name,
      repositoryUrl: team.repositoryUrl,
      exists: contributors.length > 0,
      totalCommits: contributors.reduce((sum, c) => sum + c.commits, 0),
      members: memberStats
    })
  } catch (error) {
    next(error)
  }
})

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

export default router 