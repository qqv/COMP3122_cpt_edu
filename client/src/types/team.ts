export interface TeamMember {
  userId: {
    _id: string
    name: string
    email: string
    avatar: string
    githubId: string
  }
  user?: {
    _id: string
    name: string
    email: string
    githubId: string
  }
  role: 'leader' | 'member'
  contribution?: {
    commits: number
    additions: number
    deletions: number
    lastCommit: string | null
  }
}

export interface Team {
  _id: string
  name: string
//   description: string
  repositoryUrl: string
  members: TeamMember[]
  exists: boolean
  commits: number
  issues: number
  prs: number
  lastActive: string
  course: {
    _id: string
    name: string
  }
  inviteCode: string
  createdAt: string
  updatedAt: string
}

export interface TeamDetails extends Team {
  course: {
    _id: string
    name: string
  }
  reviews: number
  memberStats: Array<{
    userId: {
      _id: string
      name: string
      email: string
      githubId: string
    }
    role: string
    contribution: {
      commits: number
      additions: number
      deletions: number
      lastCommit: string | null
      prs: number
    }
  }>
  analytics: {
    commitActivity: Array<{
      date: string
      count: number
    }>
    contributionDistribution: Array<{
      author: string
      percentage: number
    }>
    totalCommits?: number
    totalPRs?: number
    issues?: number
    reviews?: number
  }
  recentActivity?: Array<{
    id: string
    message: string
    author: {
      name: string
      email: string
      date: string
      avatar: string | null
      githubId: string | null
    }
    url: string
  }>
} 