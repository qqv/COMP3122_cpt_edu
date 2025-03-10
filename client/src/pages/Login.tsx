import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Stack,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  School as SchoolIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'grey.100'
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SchoolIcon
              sx={{
                fontSize: 40,
                color: 'primary.main',
                p: 1,
                bgcolor: 'primary.lighter',
                borderRadius: '50%',
                mb: 2
              }}
            />
            <Typography variant="h5" component="h1" gutterBottom fontWeight="500">
              GitHub Classroom Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your classroom
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Login with your credentials
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  mt: 3,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          {/* <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link href="#" variant="body2" underline="hover">
              Forgot password?
            </Link>
          </Box> */}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
            Forgot password or don't have an account?
            </Typography>
            <Link href="#" underline="hover">
                Contact administrator
              </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
} 