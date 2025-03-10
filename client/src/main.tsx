import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// Add error boundary
const root = ReactDOM.createRoot(document.getElementById('root')!)

// Add error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e)
})

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
) 