import { Router } from 'express'
import { GitHubService } from '../services/github.service'
import Team from '../models/team'
import Student from '../models/student'
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

    const teamStats = await GitHubService.getRepoStats(owner, repo)

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
    const user = await Student.findById(userId)
    
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

// New route for direct GitHub repository analytics
router.get('/github/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params
    
    // Get the basic repository stats
    const repoStats = await GitHubService.getRepoStats(owner, repo)
    
    // Get additional detailed data
    const [commits, issues, pulls] = await Promise.all([
      GitHubService.getRepositoryCommits(owner, repo, 200),
      GitHubService.getRepositoryIssues(owner, repo, 'all'),
      GitHubService.getRepositoryPullRequests(owner, repo, 'all')
    ])
    
    // Process commits by month (last 6 months)
    const today = new Date()
    const commitsByMonth = Array(6).fill(0)
    
    if (Array.isArray(commits)) {
      commits.forEach(commit => {
        const commitDate = new Date(commit.commit.author.date)
        const monthIndex = today.getMonth() - commitDate.getMonth() + (today.getFullYear() - commitDate.getFullYear()) * 12
        if (monthIndex >= 0 && monthIndex < 6) {
          commitsByMonth[5 - monthIndex]++
        }
      })
    }
    
    // Calculate issues opened and closed by month
    const issuesOpened = Array(6).fill(0)
    const issuesClosed = Array(6).fill(0)
    
    if (Array.isArray(issues)) {
      issues.forEach(issue => {
        // Issues opened
        const createdDate = new Date(issue.created_at)
        const createdMonthIndex = today.getMonth() - createdDate.getMonth() + (today.getFullYear() - createdDate.getFullYear()) * 12
        if (createdMonthIndex >= 0 && createdMonthIndex < 6) {
          issuesOpened[5 - createdMonthIndex]++
        }
        
        // Issues closed
        if (issue.closed_at) {
          const closedDate = new Date(issue.closed_at)
          const closedMonthIndex = today.getMonth() - closedDate.getMonth() + (today.getFullYear() - closedDate.getFullYear()) * 12
          if (closedMonthIndex >= 0 && closedMonthIndex < 6) {
            issuesClosed[5 - closedMonthIndex]++
          }
        }
      })
    }
    
    // Calculate weekly activity trends (last 6 weeks)
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000
    const commitTrends = Array(6).fill(0)
    const prTrends = Array(6).fill(0)
    const issueTrends = Array(6).fill(0)
    
    if (Array.isArray(commits)) {
      commits.forEach(commit => {
        const commitDate = new Date(commit.commit.author.date)
        const weekIndex = Math.floor((today.getTime() - commitDate.getTime()) / millisecondsPerWeek)
        if (weekIndex >= 0 && weekIndex < 6) {
          commitTrends[5 - weekIndex]++
        }
      })
    }
    
    if (Array.isArray(pulls)) {
      pulls.forEach(pr => {
        const prDate = new Date(pr.created_at)
        const weekIndex = Math.floor((today.getTime() - prDate.getTime()) / millisecondsPerWeek)
        if (weekIndex >= 0 && weekIndex < 6) {
          prTrends[5 - weekIndex]++
        }
      })
    }
    
    if (Array.isArray(issues)) {
      issues.forEach(issue => {
        const issueDate = new Date(issue.created_at)
        const weekIndex = Math.floor((today.getTime() - issueDate.getTime()) / millisecondsPerWeek)
        if (weekIndex >= 0 && weekIndex < 6) {
          issueTrends[5 - weekIndex]++
        }
      })
    }
    
    // Return combined stats
    res.json({
      ...repoStats,
      commitsByMonth,
      issuesOpened,
      issuesClosed,
      commitTrends,
      prTrends,
      issueTrends,
      totalCommits: commits.length,
      totalPRs: pulls.length,
      totalIssues: issues.length,
      openIssues: issues.filter(issue => issue.state === 'open').length,
      closedIssues: issues.filter(issue => issue.state === 'closed').length
    })
  } catch (error) {
    console.error('GitHub analytics error:', error)
    res.status(500).json({ message: 'Error fetching GitHub analytics' })
  }
})

// 新增路由：獲取存儲庫貢獻者
router.get('/github/:owner/:repo/contributors', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params
    
    try {
      // 獲取存儲庫貢獻者
      const contributors = await GitHubService.getRepositoryContributors(owner, repo)
      
      // 返回貢獻者列表
      res.json(contributors)
    } catch (error) {
      console.error(`Error fetching contributors for ${owner}/${repo}:`, error)
      res.status(500).json({ message: 'Error fetching repository contributors' })
    }
  } catch (error) {
    console.error('Contributors fetch error:', error)
    res.status(500).json({ message: 'Error processing request' })
  }
})

export default router 