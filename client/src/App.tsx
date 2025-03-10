import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Dashboard from './pages/Dashboard'

import Teams from './pages/Teams'
import TeamDetail from './pages/TeamDetail'
import TeamInvite from './pages/TeamInvite'

import Students from './pages/Students'
import Courses from './pages/Courses'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
// import Reports from './pages/Reports'
import Users from './pages/Users'
import Assistant from './pages/Assistant'
import Login from './pages/Login'
import ErrorPage from './pages/ErrorPage'
import { AuthProvider } from './contexts/AuthContext'

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
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/students" element={<Students />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/analytics" element={<Analytics />} />
            {/* <Route path="/reports" element={<Reports />} /> */}
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/teams/invite/:inviteCode" element={<TeamInvite />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App 