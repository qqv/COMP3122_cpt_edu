import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Button,
  Stack,
  Divider
} from '@mui/material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  )
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [showInactive, setShowInactive] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Settings
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Manage your application settings
          </Typography>

          <Paper sx={{ width: '100%', p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 4,
                bgcolor: 'grey.50'
              }}
            >
              <Tab label="General" />
              <Tab label="GitHub Integration" />
              <Tab label="Notifications" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                <Typography variant="h6">Course Information</Typography>
                <TextField
                  fullWidth
                  label="Course Name"
                  defaultValue="COMP3421 - Software Engineering"
                />
                <TextField
                  fullWidth
                  label="Project Name"
                  defaultValue="Smart Campus App"
                />
                <TextField
                  fullWidth
                  label="Instructor Name"
                  defaultValue="Dr. Wong, Jane"
                />
                <TextField
                  type="date"
                  fullWidth
                  label="Project Deadline"
                  defaultValue="2025-04-30"
                  InputLabelProps={{ shrink: true }}
                />
                
                <Divider />
                
                <Typography variant="h6">Display Settings</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                    />
                  }
                  label="Show Inactive Students"
                />
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  type="password"
                  label="GitHub Personal Access Token"
                  defaultValue="••••••••••••••••••••"
                />
                <TextField
                  fullWidth
                  label="GitHub Organization"
                  defaultValue="comp3421-2025"
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Data Refresh Interval (minutes)"
                  defaultValue="30"
                  inputProps={{ min: 5, max: 1440 }}
                />
                <Box>
                  <Button variant="contained" sx={{ mr: 2 }}>
                    Save Changes
                  </Button>
                  <Button variant="outlined">
                    Test Connection
                  </Button>
                </Box>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  defaultValue="jane.wong@example.com"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Low Activity Alerts"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Weekly Summary Reports"
                />
              </Stack>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
} 