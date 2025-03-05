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
  Stack
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Analytics as AnalyticsIcon,
  Description as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Teams', icon: <GroupIcon />, path: '/teams' },
  { text: 'Students', icon: <SchoolIcon />, path: '/students' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const drawerWidth = 240

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'grey.900',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 3, bgcolor: 'grey.900' }}>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GitHub Classroom
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: 'grey.800' }} />

        {/* Navigation Menu */}
        <List sx={{ px: 2, py: 1, flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: 'grey.300',
                '&:hover': {
                  bgcolor: 'grey.800',
                },
                ...(location.pathname === item.path && {
                  bgcolor: 'grey.800',
                  color: 'white',
                }),
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ bgcolor: 'grey.800' }} />

        {/* User Profile Section */}
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>JW</Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'white' }}>
                Dr. Wong, Jane
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                Instructor
              </Typography>
            </Box>
          </Stack>

          {/* Logout Button */}
          <ListItem
            button
            onClick={() => navigate('/login')}
            sx={{
              borderRadius: 1,
              color: 'grey.300',
              '&:hover': {
                bgcolor: 'grey.800',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  )
} 