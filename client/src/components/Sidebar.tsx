import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Stack,
  Button,
  Tooltip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Style as StyleIcon,
  Assistant as AssistantIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 240

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Teams', icon: <GroupIcon />, path: '/teams' },
    { text: 'Students', icon: <SchoolIcon />, path: '/students' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'AI Assistant', icon: <AssistantIcon />, path: '/assistant' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ]

  // Only lecturers can see user management
  if (user?.role === 'lecturer') {
    menuItems.push({ text: 'Courses', icon: <StyleIcon />, path: '/courses' })
    menuItems.push({ text: 'Users', icon: <PersonIcon />, path: '/users' })
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ color: 'primary.main', mr: 1, fontSize: 30 }} />
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            CPT Classroom
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* User information */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', px: 1 }}>
          <Avatar 
            sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" noWrap fontWeight="medium">
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Role'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List component="nav" sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.lighter',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Box>
          <Divider sx={{ my: 2 }} />
          <Tooltip title="Logout">
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                color: 'grey.700',
                '&:hover': {
                  bgcolor: 'grey.100',
                  color: 'error.main',
                  '& .MuiListItemIcon-root': {
                    color: 'error.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  )
} 