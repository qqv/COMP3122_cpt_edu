import { Router } from 'express'
import { GitHubService } from '../services/github.service'
import Team from '../models/team'
import User from '../models/user'
import type { Request, Response } from 'express'

const router = Router()

router.get('/team/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params
    const team = await Team.findById(teamId).populate('members.userId')
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    const [owner, repo] = team.repositoryUrl
      .replace('https://github.com/', '')
      .split('/')

    const teamStats = await GitHubService.getRepositoryStats(owner, repo)

    const memberContributions = await Promise.all(
      team.members.map(async (member) => {
        const user = member.userId as any
        const stats = await GitHubService.getUserContributions(
          owner,
          repo,
          user.githubId
        )
        return {
          userId: user._id,
          name: user.name,
          role: member.role,
          contributions: stats
        }
      })
    )

    res.json({
      teamStats,
      memberContributions
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Error fetching team analytics' })
  }
})

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const teams = await Team.find({ 'members.userId': userId })

    const teamContributions = await Promise.all(
      teams.map(async (team) => {
        const [owner, repo] = team.repositoryUrl
          .replace('https://github.com/', '')
          .split('/')

        const stats = await GitHubService.getUserContributions(
          owner,
          repo,
          user.githubId
        )

        return {
          teamId: team._id,
          teamName: team.name,
          contributions: stats
        }
      })
    )

    res.json(teamContributions)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user analytics' })
  }
})

export default router 