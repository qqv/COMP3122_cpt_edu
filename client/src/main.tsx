import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import './index.css'
import Sidebar from './components/Sidebar'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Dashboard />
      {/* <Sidebar /> */}
    </BrowserRouter>
  </React.StrictMode>
) 