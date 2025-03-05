import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Dashboard from './pages/Dashboard'
import Teams from './pages/Teams'
import Login from './pages/Login'
import TeamDetail from './pages/TeamDetail'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
})

function App() {
  console.log('App rendering')

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/team/:id" element={<TeamDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/students" element={<div>Students Page</div>} />
          <Route path="/analytics" element={<div>Analytics Page</div>} />
          <Route path="/reports" element={<div>Reports Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App 