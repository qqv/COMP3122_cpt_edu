import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  MergeType as MergeTypeIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon
} from '@mui/icons-material'
import { LineChart, PieChart } from '@mui/x-charts'
import Sidebar from '../components/Sidebar'
import { useParams } from 'react-router-dom'
import { teamService } from '../services/api'
import ErrorPage from './ErrorPage'
import { getGithubAvatarUrl } from '../utils/github'
import { TeamDetails } from '../types/team'
import { formatLastActive } from '../utils/dateFormat'

export default function TeamDetail() {
  const { id } = useParams()
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true)
        const data = await teamService.getTeamDetails(id!)
        setTeam(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTeamDetails()
    }
  }, [id])

  const activityData = useMemo(() => {
    if (!team?.analytics?.commitActivity) return []
    
    return team.analytics.commitActivity.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      commits: item.count
    }))
  }, [team])

  const contributionData = useMemo(() => {
    if (!team?.memberStats) return []
    
    return team.memberStats.map(member => ({
      id: member.userId._id,
      label: member.userId.name,
      value: member.contribution.commits,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }))
  }, [team])

  const getMailtoLink = () => {
    if (!team) return '#'
    
    const emails = team.memberStats
      .map(member => member.userId.email)
      .join(',')
    return `mailto:${emails}?subject=Regarding ${team.name}&body=Hello team,`
  }

  const handleExportData = () => {
    if (!team) return
    
    const data = {
      teamName: team.name,
      repository: team.repositoryUrl,
      members: team.memberStats.map(member => ({
        name: member.userId.name,
        email: member.userId.email,
        role: member.role,
        commits: member.contribution.commits,
        additions: member.contribution.additions,
        deletions: member.contribution.deletions,
        lastActive: member.contribution.lastCommit
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${team.name.toLowerCase()}-stats.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error || !team) {
    return (
      <ErrorPage 
        code={404}
        title="Team Not Found"
        message={error || 'The requested team could not be found.'}
      />
    )
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'grey.100' }}>
        {/* Header */}
        <Paper sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" component="h1" sx={{ mr: 2 }}>
                {team.name}
              </Typography>
              <Chip
                label={team.exists ? 'Active' : 'Repository Not Found'}
                color={team.exists ? 'success' : 'error'}
                size="small"
              />
            </Box>
            <Typography color="text.secondary" gutterBottom>
              Course: {team.course.name}
            </Typography>
            <Typography color="text.secondary">
              Repository: <Link href={team.repositoryUrl} target="_blank" underline="hover">
                {team.repositoryUrl.replace('https://github.com/', '')}
              </Link>
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ px: 4, py: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                color="inherit"
                href="/"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Home
              </Link>
              <Link color="inherit" href="/teams">
                Teams
              </Link>
              <Typography color="text.primary">Team Alpha</Typography>
            </Breadcrumbs>
          </Box>
        </Paper>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Commits
                    </Typography>
                    <Typography variant="h4">
                      {team.commits}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <CodeIcon />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                      +12%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs last week
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Issues Closed
                    </Typography>
                    <Typography variant="h4">
                      {team.issues}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <BugReportIcon />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                      +8%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs last week
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pull Requests
                    </Typography>
                    <Typography variant="h4">
                      {team.prs}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <MergeTypeIcon />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                      +15%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs last week
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Code Reviews
                    </Typography>
                    <Typography variant="h4">
                      {team.reviews}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <AssessmentIcon />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                      +20%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs last week
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Activity Timeline
                </Typography>
                <Box sx={{ height: 300 }}>
                  <LineChart
                    series={[
                      {
                        data: activityData.map(item => item.commits),
                        label: 'Commits',
                        color: 'primary.main'
                      }
                    ]}
                    xAxis={[{
                      data: activityData.map(item => item.date),
                      scaleType: 'band',
                    }]}
                    height={250}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Member Contribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <PieChart
                    series={[{
                      data: contributionData,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30 }
                    }]}
                    height={250}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Team Members Table */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Team Members</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<GroupIcon />}
              >
                Add Member
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Commits</TableCell>
                  <TableCell>PRs</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {team.memberStats.map((member) => (
                  <TableRow key={member.userId._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ mr: 2 }} 
                          src={getGithubAvatarUrl(member.userId.githubId)}
                        />
                        <Box>
                          <Typography variant="body2">{member.userId.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.userId.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.role}</Typography>
                    </TableCell>
                    <TableCell>{member.contribution.commits}</TableCell>
                    <TableCell>{member.contribution.prs || 0}</TableCell>
                    <TableCell>{formatLastActive(member.contribution.lastCommit || '')}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.contribution.lastCommit ? 'Active' : 'Inactive'}
                        size="small"
                        color={member.contribution.lastCommit ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* Activity Feed and Progress */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Recent Activity</Typography>
                  <Box>
                    <Button size="small" sx={{ mr: 1 }} variant="contained">All</Button>
                    <Button size="small" sx={{ mr: 1 }}>Commits</Button>
                    <Button size="small" sx={{ mr: 1 }}>PRs</Button>
                    <Button size="small">Issues</Button>
                  </Box>
                </Box>
                <Stack spacing={3} sx={{ maxHeight: 'calc(100% - 60px)', overflow: 'auto' }}>
                  {team.memberStats.map((member) => 
                    member.contribution.lastCommit && (
                      <Box key={member.userId._id}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Avatar 
                            sx={{ mr: 2 }} 
                            src={getGithubAvatarUrl(member.userId.githubId)}
                          />
                          <Box>
                            <Typography variant="body2">
                              <Link href="#" underline="hover" color="inherit">
                                {member.userId.name}
                              </Link>
                              {' made '}{member.contribution.commits} commits
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              {formatLastActive(member.contribution.lastCommit)}
                            </Typography>
                            <Box sx={{ mt: 1, bgcolor: 'grey.50', borderRadius: 1, p: 1 }}>
                              <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                                + Added {member.contribution.additions} lines
                              </Typography>
                              <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                                - Removed {member.contribution.deletions} lines
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    )
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Team Progress</Typography>
                <Stack spacing={3}>
                  {team.memberStats.map((member) => (
                    <Box key={member.userId._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ mr: 2 }} 
                          src={getGithubAvatarUrl(member.userId.githubId)}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {member.userId.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack spacing={2}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Contribution
                            </Typography>
                            <Typography variant="caption" fontWeight="medium">
                              {((member.contribution.commits / team.commits) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(member.contribution.commits / team.commits) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'grey.100',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'success.main'
                              }
                            }}
                          />
                        </Box>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Export Data Button */}
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
              onClick={handleExportData}
            >
              Export Data
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
} 