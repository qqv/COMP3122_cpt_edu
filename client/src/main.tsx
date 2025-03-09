import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// 添加错误边界
const root = ReactDOM.createRoot(document.getElementById('root')!)

// 添加错误处理
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