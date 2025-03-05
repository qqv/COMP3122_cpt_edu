import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()
  
  const isActiveLink = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path))
  }

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white font-bold text-lg">GitHub Classroom Tracker</span>
        </div>
        <div className="flex flex-col flex-grow px-4 mt-5">
          <nav className="flex-1 space-y-2">
            {[
              { path: '/', icon: 'fa-tachometer-alt', label: 'Dashboard' },
              { path: '/teams', icon: 'fa-users', label: 'Teams' },
              { path: '/students', icon: 'fa-user-graduate', label: 'Students' },
              { path: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
              { path: '/reports', icon: 'fa-file-alt', label: 'Reports' },
              { path: '/settings', icon: 'fa-cog', label: 'Settings' }
            ].map(({ path, icon, label }) => (
              <Link 
                key={path}
                to={path} 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActiveLink(path) 
                    ? 'text-white bg-gray-700' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <i className={`fas ${icon} mr-3`}></i>
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto mb-5">
            <button className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 w-full">
              <i className="fas fa-sign-out-alt mr-3"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 