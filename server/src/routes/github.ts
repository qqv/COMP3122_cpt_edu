import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/error'
import { GitHubService } from '../services/github.service'

const router = Router()

// Get commits for a repository
router.get('/:owner/:repo/commits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params
    const { author } = req.query
    
    if (!owner || !repo) {
      return next(new AppError('Owner and repository are required', 400))
    }
    
    const commits = await GitHubService.getRepositoryCommits(
      owner, 
      repo.replace('.git', ''),
      100  // 使用默認限制
    )
    
    // 如果指定了作者，則進行過濾
    const filteredCommits = author 
      ? commits.filter(commit => {
          const authorLogin = commit.author?.login || '';
          const authorName = commit.commit?.author?.name || '';
          const authorEmail = commit.commit?.author?.email || '';
          return authorLogin === author || authorName === author || authorEmail === author;
        })
      : commits;
    
    res.json(filteredCommits)
  } catch (error) {
    console.error('Error fetching commits:', error)
    next(new AppError('Failed to fetch commits', 500))
  }
})

// Get issues for a repository
router.get('/:owner/:repo/issues', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params
    const { creator } = req.query
    
    if (!owner || !repo) {
      return next(new AppError('Owner and repository are required', 400))
    }
    
    const issues = await GitHubService.getRepositoryIssues(
      owner, 
      repo.replace('.git', ''),
      'all'
    )
    
    // 如果指定了創建者，則進行過濾
    const filteredIssues = creator
      ? issues.filter(issue => issue.user?.login === creator)
      : issues;
    
    res.json(filteredIssues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    next(new AppError('Failed to fetch issues', 500))
  }
})

// Get pull requests for a repository
router.get('/:owner/:repo/pulls', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params
    const { creator } = req.query
    
    if (!owner || !repo) {
      return next(new AppError('Owner and repository are required', 400))
    }
    
    const pulls = await GitHubService.getRepositoryPullRequests(
      owner, 
      repo.replace('.git', ''),
      'all'
    )
    
    // 如果指定了創建者，則進行過濾
    const filteredPulls = creator
      ? pulls.filter(pr => pr.user?.login === creator)
      : pulls;
    
    res.json(filteredPulls)
  } catch (error) {
    console.error('Error fetching pull requests:', error)
    next(new AppError('Failed to fetch pull requests', 500))
  }
})

// Get comments for a repository
router.get('/:owner/:repo/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params
    const { author } = req.query
    
    if (!owner || !repo) {
      return next(new AppError('Owner and repository are required', 400))
    }
    
    // 目前沒有現成的方法獲取評論，返回空數組
    const allComments: any[] = [];
    
    // 注意：在實際環境中，需要實現getRepositoryComments方法
    console.log(`Comments endpoint called for ${owner}/${repo}${author ? ` with author=${author}` : ''}`);
    console.log('This endpoint is currently returning an empty array.');
    
    res.json(allComments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    next(new AppError('Failed to fetch comments', 500))
  }
})

// Get contributor stats for a repository
router.get('/:owner/:repo/stats/contributors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params
    
    if (!owner || !repo) {
      return next(new AppError('Owner and repository are required', 400))
    }
    
    const contributors = await GitHubService.getRepoContributors(owner, repo.replace('.git', ''))
    
    res.json(contributors)
  } catch (error) {
    console.error('Error fetching contributor stats:', error)
    next(new AppError('Failed to fetch contributor stats', 500))
  }
})

// Get user's contribution to a repository
router.get('/:owner/:repo/user/:githubId/contributions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo, githubId } = req.params
    
    if (!owner || !repo || !githubId) {
      return next(new AppError('Owner, repository and GitHub ID are required', 400))
    }
    
    const contributions = await GitHubService.getUserContributions(owner, repo.replace('.git', ''), githubId)
    
    res.json(contributions)
  } catch (error) {
    console.error('Error fetching user contributions:', error)
    next(new AppError('Failed to fetch user contributions', 500))
  }
})

export default router 