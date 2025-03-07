import { Octokit } from '@octokit/rest'
import { config } from '../config'
import { withRetry } from '../utils/github'
const NodeCache = require('node-cache')

if (!config.github.token) {
  throw new Error('GitHub token is not configured')
}

const octokit = new Octokit({
  auth: config.github.token,
  headers: {
    accept: 'application/vnd.github.v3+json',
    authorization: `token ${config.github.token}`
  }
})

// 添加类型声明
interface Cache {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T, ttl?: number): boolean
}

const cache: Cache = new NodeCache({ stdTTL: 600 })

// 添加延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 添加限流队列
class RequestQueue {
  private queue: (() => Promise<any>)[] = []
  private processing = false

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return
    this.processing = true

    while (this.queue.length > 0) {
      const request = this.queue.shift()!
      await request()
      // Add a delay of 100ms between requests
      await delay(100)
    }

    this.processing = false
  }
}

const requestQueue = new RequestQueue()

export interface CommitContribution {
  sha: string
  additions: number
  deletions: number
  date: Date
  author: string
}

export interface PullRequestContribution {
  number: number
  title: string
  state: string
  created_at: Date
  merged_at: Date | null
  author: string
}

export interface IssueContribution {
  number: number
  title: string
  state: string
  created_at: Date
  closed_at: Date | null
  author: string
}

interface RepoStats {
  commits: number
  issues: number
  prs: number
  lastActive: string
  exists: boolean
}

interface Contributor {
  githubId: string
  commits: number
  additions: number
  deletions: number
  lastCommit: string
}

export const GitHubService = {
  async validateAuth() {
    try {
      const { data } = await octokit.rest.users.getAuthenticated()
      console.log('GitHub Auth successful:', data.login)
      return true
    } catch (error) {
      console.error('GitHub Auth failed:', error)
      return false
    }
  },

  async getRepoStats(owner: string, repo: string): Promise<RepoStats> {
    const cacheKey = `repo:${owner}/${repo}`
    const cachedData = cache.get<RepoStats>(cacheKey)
    if (cachedData) return cachedData

    try {
      // 检查仓库是否存在
      const repoExists = await requestQueue.add(() => 
        octokit.repos.get({ owner, repo })
          .then(() => true)
          .catch((error) => {
            if (error.status === 404) {
              console.log(`Repository ${owner}/${repo} not found`)
              return false
            }
            throw error
          })
      )

      if (!repoExists) {
        const defaultStats = {
          commits: 0,
          issues: 0,
          prs: 0,
          lastActive: new Date().toISOString(),
          exists: false
        }
        cache.set(cacheKey, defaultStats)
        return defaultStats
      }

      // 将所有请求添加到队列中
      const repoData = await requestQueue.add(() => 
        octokit.repos.get({ owner, repo })
      )

      const [commits, issues, prs] = await Promise.all([
        requestQueue.add(() =>
          octokit.repos.getCommitActivityStats({ owner, repo })
            .then(response => response.data?.reduce((sum, week) => sum + week.total, 0) || 0)
            .catch(() => 0)
        ),
        requestQueue.add(() =>
          octokit.issues.listForRepo({ owner, repo, state: 'all' })
            .then(response => response.data.length)
            .catch(() => 0)
        ),
        requestQueue.add(() =>
          octokit.pulls.list({ owner, repo, state: 'all' })
            .then(response => response.data.length)
            .catch(() => 0)
        )
      ])

      const result = {
        commits,
        issues,
        prs,
        lastActive: repoData.data.updated_at,
        exists: true
      }

      // 存入缓存
      cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error fetching repo stats:', error)
      return {
        commits: 0,
        issues: 0,
        prs: 0,
        lastActive: new Date().toISOString(),
        exists: false
      }
    }
  },

  async getUserContributions(owner: string, repo: string, username: string) {
    return requestQueue.add(async () => {
      const [commits, pulls, issues] = await Promise.all([
        octokit.repos.listCommits({ owner, repo, author: username }),
        octokit.pulls.list({ owner, repo, state: 'all', creator: username }),
        octokit.issues.listForRepo({ owner, repo, state: 'all', creator: username })
      ])

      return {
        commits: commits.data.length,
        pulls: pulls.data.length,
        issues: issues.data.length
      }
    })
  },

  async getRepoContributors(owner: string, repo: string): Promise<Contributor[]> {
    const cacheKey = `contributors:${owner}/${repo}`
    const cachedData = cache.get<Contributor[]>(cacheKey)
    if (cachedData) return cachedData

    try {
      const { data: commits } = await requestQueue.add(() =>
        octokit.repos.listCommits({
          owner,
          repo,
          per_page: 100 // 获取最近100条提交
        })
      )

      // 按作者统计提交
      const contributors = commits.reduce((acc: { [key: string]: Contributor }, commit) => {
        const githubId = commit.author?.login || commit.commit.author?.email || 'unknown'
        
        if (!acc[githubId]) {
          acc[githubId] = {
            githubId,
            commits: 0,
            additions: 0,
            deletions: 0,
            lastCommit: commit.commit.author?.date || ''
          }
        }

        acc[githubId].commits++
        // 添加类型检查和默认值
        acc[githubId].additions += commit.stats?.additions ?? 0
        acc[githubId].deletions += commit.stats?.deletions ?? 0

        return acc
      }, {})

      const result = Object.values(contributors)
      cache.set(cacheKey, result, 3600) // 缓存1小时
      return result
    } catch (error) {
      console.error('Error fetching contributors:', error)
      return []
    }
  }
}

// 在服务启动时验证
GitHubService.validateAuth() 