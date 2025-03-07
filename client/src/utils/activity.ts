import { differenceInDays } from 'date-fns'

export const isTeamActive = (lastActive: string): boolean => {
  const lastActiveDate = new Date(lastActive)
  const daysSinceLastActive = differenceInDays(new Date(), lastActiveDate)
  return daysSinceLastActive <= 7 // 7天内有活动就算活跃
}

export const getActivityStatus = (lastActive: string) => {
  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const diffDays = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) {
    return { color: '#4CAF50', label: 'Active', value: 100 }      // 绿色
  } else if (diffDays <= 14) {
    return { color: '#2196F3', label: 'Recent', value: 75 }       // 蓝色
  } else if (diffDays <= 30) {
    return { color: '#FF9800', label: 'Idle', value: 50 }         // 橙色
  } else {
    return { color: '#F44336', label: 'Inactive', value: 25 }     // 红色
  }
} 