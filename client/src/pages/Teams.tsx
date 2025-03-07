import React, { useState, useEffect, useMemo } from 'react'
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
  InputAdornment,
  Alert,
  CircularProgress
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
import { teamService } from '../services/api'
import { formatLastActive } from '../utils/dateFormat'
import { getActivityStatus } from '../utils/activity'
import { TeamCard } from '../components/TeamCard'

const getActivityColor = (index: number) => {
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336'] // 绿、蓝、橙、红
  return colors[index % colors.length]
}

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getTeams()
        setTeams(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      // 首先按仓库存在状态排序
      if (!a.exists && b.exists) return -1
      if (a.exists && !b.exists) return 1
      
      // 如果存在状态相同，按最后活动时间排序
      if (a.exists && b.exists) {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      }
      
      // 如果都不存在，按名称排序
      return a.name.localeCompare(b.name)
    })
  }, [teams])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'grey.100' }}>

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
            {sortedTeams.map((team) => (
              <Grid item xs={12} md={6} lg={4} key={team._id}>
                <TeamCard team={team} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
} 