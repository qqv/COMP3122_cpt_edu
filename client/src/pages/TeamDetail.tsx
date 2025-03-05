import React from 'react'
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
  Divider
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

// 团队数据
const teamData = {
  name: "Team Alpha",
  status: "On Track",
  project: "Mobile App for Campus Navigation",
  repository: "github.com/comp3421-2025/team-alpha",
  progress: 85,
  members: 5,
  commits: 142,
  issues: 38,
  prs: 24,
  reviews: 31
}

export default function TeamDetail() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'grey.100' }}>
        {/* Header */}
        <Paper sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <Box sx={{ px: 4, py: 3 }}>
            {/* ... 课程信息头部，与 Teams 页面相同 ... */}
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
          {/* Team Header Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: 'primary.light',
                      mr: 2
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" component="h1" sx={{ mr: 2 }}>
                        {teamData.name}
                      </Typography>
                      <Chip
                        label={teamData.status}
                        color="success"
                        size="small"
                      />
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      Project: {teamData.project}
                    </Typography>
                    <Typography color="text.secondary">
                      Repository: <Link href="#" underline="hover">{teamData.repository}</Link>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Stack
                    direction="row"
                    spacing={3}
                    divider={<Divider orientation="vertical" flexItem />}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {teamData.progress}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {teamData.members}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Members
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {teamData.commits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Commits
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<EmailIcon />}
                      size="small"
                    >
                      Contact Team
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      size="small"
                    >
                      Export Data
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

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
                      {teamData.commits}
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
                      {teamData.issues}
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
                      {teamData.prs}
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
                      {teamData.reviews}
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
                        data: [12, 15, 8, 19, 22, 14, 10],
                        label: 'Commits',
                        color: 'primary.main'
                      }
                    ]}
                    xAxis={[{
                      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
                      data: [
                        { value: 32, label: 'Chan, David' },
                        { value: 27, label: 'Wong, Sarah' },
                        { value: 22, label: 'Chen, Emily' },
                        { value: 16, label: 'Li, Jason' },
                        { value: 3, label: 'Zhang, Michael' }
                      ],
                      innerRadius: 30,
                      paddingAngle: 2,
                      cornerRadius: 4
                    }]}
                    height={250}
                    margin={{ top: 10, bottom: 50 }}
                    slotProps={{
                      legend: {
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                        padding: 0,
                        itemMarkWidth: 8,
                        itemMarkHeight: 8,
                        markGap: 5,
                        itemGap: 12,
                        labelStyle: {
                          fontSize: 11
                        }
                      }
                    }}
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
                {[
                  {
                    name: 'Chan, David',
                    email: 'david.chan@polyu.edu.hk',
                    role: 'Team Lead',
                    subRole: 'Frontend',
                    commits: 45,
                    prs: 12,
                    lastActive: '2h ago',
                    status: 'Active'
                  },
                  // ... 其他成员数据
                ].map((member) => (
                  <TableRow key={member.name}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="body2">{member.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.role}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.subRole}
                      </Typography>
                    </TableCell>
                    <TableCell>{member.commits}</TableCell>
                    <TableCell>{member.prs}</TableCell>
                    <TableCell>{member.lastActive}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        size="small"
                        color={member.status === 'Active' ? 'success' : 'warning'}
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
                  {[
                    {
                      type: 'commit',
                      user: 'Chan, David',
                      action: 'pushed 3 commits',
                      target: 'main',
                      time: '2h ago',
                      details: [
                        'Fix navigation bug in campus map view',
                        'Update UI components for better responsiveness',
                        'Add unit tests for location services'
                      ]
                    },
                    // ... 其他活动数据
                  ].map((activity, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="body2">
                            <Link href="#" underline="hover" color="inherit">
                              {activity.user}
                            </Link>
                            {' '}{activity.action} to{' '}
                            <Link href="#" underline="hover" color="inherit">
                              {activity.target}
                            </Link>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            {activity.time}
                          </Typography>
                          {activity.details && (
                            <Box sx={{ mt: 1, bgcolor: 'grey.50', borderRadius: 1, p: 1 }}>
                              {activity.details.map((detail, i) => (
                                <Typography key={i} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                                  + {detail}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Student Performance</Typography>
                <Stack spacing={3}>
                  {[
                    {
                      name: 'Chan, David',
                      role: 'Team Lead',
                      metrics: {
                        participation: 90,
                        collaboration: 92
                      }
                    },
                    {
                      name: 'Wong, Sarah',
                      role: 'Developer',
                      metrics: {
                        participation: 85,
                        collaboration: 85
                      }
                    },
                    {
                      name: 'Chen, Emily',
                      role: 'Developer',
                      metrics: {
                        participation: 88,
                        collaboration: 90
                      }
                    },
                    {
                      name: 'Li, Jason',
                      role: 'Developer',
                      metrics: {
                        participation: 75,
                        collaboration: 82
                      }
                    }
                  ].map((student) => (
                    <Box key={student.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack spacing={2}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Participation
                            </Typography>
                            <Typography variant="caption" fontWeight="medium">
                              {student.metrics.participation}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={student.metrics.participation}
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
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Collaboration
                            </Typography>
                            <Typography variant="caption" fontWeight="medium">
                              {student.metrics.collaboration}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={student.metrics.collaboration}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'grey.100',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'info.main'
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
        </Container>
      </Box>
    </Box>
  )
} 