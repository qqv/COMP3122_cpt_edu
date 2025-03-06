import React from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Paper
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { 
  SentimentVeryDissatisfied as SadIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material'

type ErrorPageProps = {
  code?: number;
  title?: string;
  message?: string;
}

export default function ErrorPage({ 
  code = 404,
  title = 'Page Not Found',
  message = 'The page you are looking for might have been removed or is temporarily unavailable.'
}: ErrorPageProps) {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <SadIcon 
            sx={{ 
              fontSize: 80,
              color: 'text.secondary',
              mb: 2
            }} 
          />
          
          <Typography 
            variant="h1" 
            component="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            {code}
          </Typography>

          <Typography 
            variant="h5" 
            component="h2"
            sx={{ mb: 2 }}
          >
            {title}
          </Typography>

          <Typography 
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            {message}
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  )
} 