import { differenceInDays } from 'date-fns'

export const isTeamActive = (lastActive: string): boolean => {
  const lastActiveDate = new Date(lastActive)
  const daysSinceLastActive = differenceInDays(new Date(), lastActiveDate)
  return daysSinceLastActive <= 7 // Team is active if last active within 7 days
}

export const getActivityStatus = (lastActive: string) => {
  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const diffDays = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) {
    return { color: '#4CAF50', label: 'Active', value: 100 }      // Green
  } else if (diffDays <= 14) {
    return { color: '#2196F3', label: 'Recent', value: 75 }       // Blue
  } else if (diffDays <= 30) {
    return { color: '#FF9800', label: 'Idle', value: 50 }         // Orange
  } else {
    return { color: '#F44336', label: 'Inactive', value: 25 }     // Red
  }
} 