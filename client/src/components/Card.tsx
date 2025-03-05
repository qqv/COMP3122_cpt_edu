import React from 'react'

interface CardProps {
  className?: string
  children?: React.ReactNode
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-5 sm:p-6">{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-medium text-gray-900">{children}</h3>
}

export function CardContent({ className = '', children }: CardProps) {
  return <div className={`px-4 pb-5 sm:px-6 ${className}`}>{children}</div>
} 