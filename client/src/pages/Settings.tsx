import React, { useState, useEffect } from 'react'
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
  Divider,
  Slider,
  InputAdornment,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

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
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [tokenExpiry, setTokenExpiry] = useState(24) // Default 24 hours
  const [darkMode, setDarkMode] = useState(false)
  const [aiEndpoint, setAiEndpoint] = useState('https://api.openai.com/v1')
  const [aiToken, setAiToken] = useState('')
  const [aiModel, setAiModel] = useState('gpt-4')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [loading, setLoading] = useState(false)

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings')
        if (data) {
          setTokenExpiry(data.tokenExpiry || 24)
          setDarkMode(data.darkMode || false)
          setAiEndpoint(data.aiEndpoint || 'https://api.openai.com/v1')
          setAiModel(data.aiModel || 'gpt-4')
          // Don't set the token directly for security reasons
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSaveGeneral = async () => {
    try {
      setLoading(true)
      await api.post('/settings/general', {
        tokenExpiry,
        darkMode
      })
      setSnackbar({
        open: true,
        message: 'General settings saved successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Failed to save general settings:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAI = async () => {
    try {
      setLoading(true)
      await api.post('/settings/ai', {
        aiEndpoint,
        aiToken: aiToken ? aiToken : undefined, // Only send if changed
        aiModel
      })
      setSnackbar({
        open: true,
        message: 'AI settings saved successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Failed to save AI settings:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      // 发送实际的测试请求到服务器
      const { data } = await api.post('/settings/test-ai', {
        aiEndpoint,
        aiToken,
        aiModel
      });
      
      setSnackbar({
        open: true,
        message: data.message || 'Connection test successful',
        severity: 'success'
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Connection test failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Only allow admin/lecturer to access settings
  if (user?.role !== 'lecturer') {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Alert severity="warning">
              You don't have permission to access settings. Please contact an administrator.
            </Alert>
          </Container>
        </Box>
      </Box>
    )
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
            Configure application settings
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
              <Tab label="AI Integration" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Stack spacing={4}>
                <Typography variant="h6">Authentication Settings</Typography>
                
                <Box>
                  <Typography gutterBottom>
                    Token Expiry Time (hours)
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <Slider
                      value={tokenExpiry}
                      onChange={(_, newValue) => setTokenExpiry(newValue as number)}
                      min={1}
                      max={168} // 1 week
                      valueLabelDisplay="auto"
                      sx={{ flexGrow: 1 }}
                    />
                    <TextField
                      value={tokenExpiry}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        if (!isNaN(value) && value >= 1 && value <= 168) {
                          setTokenExpiry(value)
                        }
                      }}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                      }}
                      sx={{ width: 150 }}
                    />
                  </Stack>
                </Box>
                
                <Divider />
                
                {/* <Typography variant="h6">Display Settings</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                /> */}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveGeneral}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Stack spacing={4}>
                <Typography variant="h6">AI Service Configuration</Typography>
                
                <TextField
                  fullWidth
                  label="AI API Endpoint"
                  value={aiEndpoint}
                  onChange={(e) => setAiEndpoint(e.target.value)}
                  helperText="The base URL for the AI service API"
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="API Token"
                  value={aiToken}
                  onChange={(e) => setAiToken(e.target.value)}
                  helperText="Leave blank to keep the current token"
                />
                
                <TextField
                  fullWidth
                  label="AI Model"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  placeholder="e.g., gpt-4, claude-3-sonnet, gemini-pro"
                  helperText="Enter the model identifier as required by your AI provider"
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />}
                    sx={{ mr: 2 }}
                    onClick={handleTestConnection}
                    disabled={loading}
                  >
                    Test Connection
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAI}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </TabPanel>
          </Paper>
        </Container>
        
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity as 'success' | 'error'} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  )
} 