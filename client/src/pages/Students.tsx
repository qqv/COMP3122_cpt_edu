import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  InputAdornment,
  Chip,
  IconButton,
  Pagination,
  TableContainer
} from '@mui/material'
import {
  Search as SearchIcon,
  GitHub as GitHubIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  MergeType as MergeIcon,
  Comment as CommentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material'

const students = [
  {
    id: 1,
    name: 'John Smith',
    github: 'johnsmith',
    team: 'Team Alpha',
    avatar: '/avatars/john.jpg',
    stats: {
      commits: 42,
      issues: 12,
      pullRequests: 8,
      comments: 24,
      activity: 'high',
      lastActive: '2 hours ago'
    }
  },
  {
    id: 2,
    name: 'Emily Johnson',
    github: 'emilyjohnson',
    team: 'Team Beta',
    avatar: '/avatars/emily.jpg',
    stats: {
      commits: 38,
      issues: 15,
      pullRequests: 6,
      comments: 31,
      activity: 'high',
      lastActive: '1 hour ago'
    }
  },
  {
    id: 3,
    name: 'Sarah Wilson',
    github: 'sarahw',
    team: 'Team Alpha',
    avatar: '/avatars/sarah.jpg',
    stats: { commits: 56, issues: 8, pullRequests: 12, comments: 35, activity: 'high', lastActive: '30 minutes ago' }
  },
  {
    id: 4,
    name: 'Michael Chen',
    github: 'mchen',
    team: 'Team Beta',
    avatar: '/avatars/michael.jpg',
    stats: { commits: 27, issues: 5, pullRequests: 4, comments: 19, activity: 'medium', lastActive: '3 hours ago' }
  },
  {
    id: 5,
    name: 'Jessica Lee',
    github: 'jlee',
    team: 'Team Gamma',
    avatar: '/avatars/jessica.jpg',
    stats: { commits: 31, issues: 14, pullRequests: 7, comments: 28, activity: 'high', lastActive: '1 hour ago' }
  },
  // ... 
]

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'high':
      return <CheckCircleIcon fontSize="small" color="success" />
    case 'medium':
      return <WarningIcon fontSize="small" color="warning" />
    case 'low':
      return <ErrorIcon fontSize="small" color="error" />
    default:
      return <CheckCircleIcon fontSize="small" />
  }
}

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'high':
      return 'success'
    case 'medium':
      return 'warning'
    case 'low':
      return 'error'
    default:
      return 'default'
  }
}

export default function Students() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const rowsPerPage = 15

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.github.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.team.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Students
              </Typography>
              <TextField
                placeholder="Search students..."
                size="small"
                sx={{ width: 300 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2 }}>
              <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell align="center">Commits</TableCell>
                      <TableCell align="center">Issues</TableCell>
                      <TableCell align="center">Pull Requests</TableCell>
                      <TableCell align="center">Comments</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell>Last Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={student.avatar} alt={student.name} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <GitHubIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {student.github}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{student.team}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <CodeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            {student.stats.commits}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <BugIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            {student.stats.issues}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <MergeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                            {student.stats.pullRequests}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <CommentIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                            {student.stats.comments}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            icon={getActivityIcon(student.stats.activity)}
                            label={student.stats.activity}
                            color={getActivityColor(student.stats.activity) as any}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{student.stats.lastActive}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredStudents.length / rowsPerPage)}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  )
} 