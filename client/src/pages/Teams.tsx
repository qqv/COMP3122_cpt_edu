import React from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Divider,
  TextField,
  Button,
  InputAdornment
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  MergeType as MergeTypeIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'

const teams = [
  {
    name: "Team Alpha",
    members: [
      { name: "Chan, David", avatar: "/api/placeholder/32/32" },
      { name: "Wong, Sarah", avatar: "/api/placeholder/32/32" },
      { name: "Li, Jason", avatar: "/api/placeholder/32/32" },
      { name: "Chen, Emily", avatar: "/api/placeholder/32/32" },
      { name: "Zhang, Michael", avatar: "/api/placeholder/32/32" }
    ],
    commits: 142,
    issues: 38,
    prs: 24,
    progress: 85,
    status: "On Track",
    lastActive: "2h ago",
    description: "Frontend Development Team"
  },
  {
    name: "Team Beta",
    members: [
      { name: "Wang, Alex", avatar: "/api/placeholder/32/32" },
      { name: "Liu, Anna", avatar: "/api/placeholder/32/32" },
      { name: "Kumar, Raj", avatar: "/api/placeholder/32/32" },
      { name: "Park, Jin", avatar: "/api/placeholder/32/32" }
    ],
    commits: 98,
    issues: 27,
    prs: 15,
    progress: 72,
    status: "On Track",
    lastActive: "1d ago",
    description: "Backend Development Team"
  },
  {
    name: "Team Gamma",
    members: [
      { name: "Smith, John", avatar: "/api/placeholder/32/32" },
      { name: "Johnson, Emma", avatar: "/api/placeholder/32/32" },
      { name: "Brown, Mike", avatar: "/api/placeholder/32/32" },
      { name: "Davis, Sophie", avatar: "/api/placeholder/32/32" },
      { name: "Wilson, Tom", avatar: "/api/placeholder/32/32" }
    ],
    commits: 165,
    issues: 42,
    prs: 21,
    progress: 90,
    status: "On Track",
    lastActive: "5h ago",
    description: "Mobile Development Team"
  },
  {
    name: "Team Delta",
    members: [
      { name: "Lee, Kevin", avatar: "/api/placeholder/32/32" },
      { name: "Kim, Grace", avatar: "/api/placeholder/32/32" },
      { name: "Tan, Marcus", avatar: "/api/placeholder/32/32" },
      { name: "Wu, Linda", avatar: "/api/placeholder/32/32" }
    ],
    commits: 87,
    issues: 19,
    prs: 8,
    progress: 45,
    status: "Warning",
    lastActive: "3d ago",
    description: "DevOps Team"
  }
]

export default function Teams() {
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'grey.100' }}>
        {/* Header */}
        <Paper sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton sx={{ display: { sm: 'none' } }}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h5" component="h1">
                  COMP3421 - Software Engineering
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Dr. Wong, Jane
                </Typography>
                <Avatar>JW</Avatar>
              </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Course Project: Smart Campus App
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Groups: 10
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students: 45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deadline: April 30, 2025
              </Typography>
            </Stack>
          </Box>
        </Paper>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Search and Actions */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <TextField
              placeholder="Search teams..."
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ px: 3 }}
            >
              Create Team
            </Button>
          </Box>

          {/* Teams Grid */}
          <Grid container spacing={3}>
            {teams.map((team) => (
              <Grid item xs={12} md={6} lg={4} key={team.name}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {team.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {team.description}
                        </Typography>
                      </Box>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
                        {team.members.map((member) => (
                          <Avatar key={member.name} src={member.avatar} />
                        ))}
                      </AvatarGroup>
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                      <Chip
                        icon={<CodeIcon />}
                        label={`${team.commits} commits`}
                        size="small"
                      />
                      <Chip
                        icon={<BugReportIcon />}
                        label={`${team.issues} issues`}
                        size="small"
                      />
                      <Chip
                        icon={<MergeTypeIcon />}
                        label={`${team.prs} PRs`}
                        size="small"
                      />
                    </Stack>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {team.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={team.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.100',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: team.progress > 75 ? 'success.main' :
                                    team.progress > 50 ? 'primary.main' :
                                    team.progress > 25 ? 'warning.main' : 'error.main'
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Chip
                          label={team.status}
                          size="small"
                          color={
                            team.status === "On Track" ? "success" :
                            team.status === "Warning" ? "warning" : "error"
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          Last active: {team.lastActive}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/team/${team.name.toLowerCase()}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
} 