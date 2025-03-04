// This file will handle GitHub API integration

import { Octokit } from "octokit"

// Initialize Octokit with GitHub token
// In production, this would be an environment variable
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export interface Repository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Commit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    avatar_url: string
  } | null
  html_url: string
}

export interface Issue {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  created_at: string
  closed_at: string | null
  user: {
    login: string
    avatar_url: string
  }
  assignees: {
    login: string
    avatar_url: string
  }[]
}

export interface PullRequest {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  created_at: string
  closed_at: string | null
  merged_at: string | null
  user: {
    login: string
    avatar_url: string
  }
  assignees: {
    login: string
    avatar_url: string
  }[]
}

// Get repositories for an organization
export async function getOrganizationRepos(org: string): Promise<Repository[]> {
  try {
    const response = await octokit.request("GET /orgs/{org}/repos", {
      org,
      per_page: 100,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching organization repositories:", error)
    return []
  }
}

// Get commits for a repository
export async function getRepositoryCommits(owner: string, repo: string): Promise<Commit[]> {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
      per_page: 100,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching repository commits:", error)
    return []
  }
}

// Get issues for a repository
export async function getRepositoryIssues(owner: string, repo: string): Promise<Issue[]> {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo,
      state: "all",
      per_page: 100,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching repository issues:", error)
    return []
  }
}

// Get pull requests for a repository
export async function getRepositoryPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      state: "all",
      per_page: 100,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching repository pull requests:", error)
    return []
  }
}

// Get contributors for a repository
export async function getRepositoryContributors(owner: string, repo: string) {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/contributors", {
      owner,
      repo,
      per_page: 100,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching repository contributors:", error)
    return []
  }
}

// Calculate commit frequency by user
export async function getCommitFrequencyByUser(owner: string, repo: string) {
  const commits = await getRepositoryCommits(owner, repo)

  const commitsByUser: Record<string, number> = {}

  commits.forEach((commit) => {
    const username = commit.author?.login || commit.commit.author.name
    if (username) {
      commitsByUser[username] = (commitsByUser[username] || 0) + 1
    }
  })

  return commitsByUser
}

// Calculate issue resolution rate by user
export async function getIssueResolutionByUser(owner: string, repo: string) {
  const issues = await getRepositoryIssues(owner, repo)

  const issuesByUser: Record<string, { opened: number; closed: number }> = {}

  issues.forEach((issue) => {
    const username = issue.user.login

    if (!issuesByUser[username]) {
      issuesByUser[username] = { opened: 0, closed: 0 }
    }

    issuesByUser[username].opened += 1

    if (issue.state === "closed") {
      issuesByUser[username].closed += 1
    }
  })

  return issuesByUser
}

// Calculate pull request metrics by user
export async function getPullRequestMetricsByUser(owner: string, repo: string) {
  const pullRequests = await getRepositoryPullRequests(owner, repo)

  const prsByUser: Record<string, { opened: number; merged: number }> = {}

  pullRequests.forEach((pr) => {
    const username = pr.user.login

    if (!prsByUser[username]) {
      prsByUser[username] = { opened: 0, merged: 0 }
    }

    prsByUser[username].opened += 1

    if (pr.merged_at) {
      prsByUser[username].merged += 1
    }
  })

  return prsByUser
}

// Identify deadline fighters (users who commit mostly close to deadlines)
export async function identifyDeadlineFighters(owner: string, repo: string, deadline: Date) {
  const commits = await getRepositoryCommits(owner, repo)

  const commitsByUser: Record<string, { total: number; closeToDeadline: number }> = {}

  // Consider commits within 48 hours of deadline as "close to deadline"
  const deadlineThreshold = 48 * 60 * 60 * 1000 // 48 hours in milliseconds

  commits.forEach((commit) => {
    const username = commit.author?.login || commit.commit.author.name
    if (!username) return

    if (!commitsByUser[username]) {
      commitsByUser[username] = { total: 0, closeToDeadline: 0 }
    }

    commitsByUser[username].total += 1

    const commitDate = new Date(commit.commit.author.date)
    const timeDifference = deadline.getTime() - commitDate.getTime()

    if (timeDifference >= 0 && timeDifference <= deadlineThreshold) {
      commitsByUser[username].closeToDeadline += 1
    }
  })

  // Calculate percentage of commits close to deadline
  const deadlineFighters = Object.entries(commitsByUser).map(([username, data]) => {
    const percentage = (data.closeToDeadline / data.total) * 100
    return {
      username,
      totalCommits: data.total,
      closeToDeadlineCommits: data.closeToDeadline,
      percentage,
    }
  })

  // Sort by percentage (highest first)
  return deadlineFighters.sort((a, b) => b.percentage - a.percentage)
}

// Identify free riders (users with minimal contribution)
export async function identifyFreeRiders(owner: string, repo: string) {
  const commits = await getRepositoryCommits(owner, repo)
  const issues = await getRepositoryIssues(owner, repo)
  const pullRequests = await getRepositoryPullRequests(owner, repo)

  // Get all unique usernames
  const allUsers = new Set<string>()

  commits.forEach((commit) => {
    const username = commit.author?.login || commit.commit.author.name
    if (username) allUsers.add(username)
  })

  issues.forEach((issue) => {
    allUsers.add(issue.user.login)
  })

  pullRequests.forEach((pr) => {
    allUsers.add(pr.user.login)
  })

  // Calculate contribution metrics for each user
  const userContributions = Array.from(allUsers).map((username) => {
    const commitCount = commits.filter(
      (commit) => (commit.author?.login || commit.commit.author.name) === username,
    ).length

    const issueCount = issues.filter((issue) => issue.user.login === username).length

    const prCount = pullRequests.filter((pr) => pr.user.login === username).length

    const totalContributions = commitCount + issueCount + prCount

    return {
      username,
      commitCount,
      issueCount,
      prCount,
      totalContributions,
    }
  })

  // Sort by total contributions (lowest first)
  return userContributions.sort((a, b) => a.totalContributions - b.totalContributions)
}

