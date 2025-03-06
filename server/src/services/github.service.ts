import { Octokit } from '@octokit/rest'
import { config } from '../config/index'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

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

export const GitHubService = {
  async getRepositoryStats(owner: string, repo: string) {
    const [commits, pulls, issues] = await Promise.all([
      octokit.repos.listCommits({ owner, repo }),
      octokit.pulls.list({ owner, repo, state: 'all' }),
      octokit.issues.listForRepo({ owner, repo, state: 'all' })
    ])

    return {
      commits: commits.data.length,
      pulls: pulls.data.length,
      issues: issues.data.length
    }
  },

  async getUserContributions(owner: string, repo: string, username: string) {
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
  }
} 