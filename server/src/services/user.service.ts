import NodeCache from 'node-cache'
import { Model } from 'mongoose'
import User from '../models/user'

interface IUser {
  _id: string
  name: string
  email: string
  avatarUrl?: string
}

const userCache = new NodeCache({ 
  stdTTL: 3600, // 1 hour
  checkperiod: 120 // 2 minutes per check
})

export const UserService = {
  async getUserWithCache(userId: string) {
    const cacheKey = `user:${userId}`
    const cachedUser = userCache.get(cacheKey)
    
    if (cachedUser) {
      return cachedUser
    }

    const user = await User.findById(userId)
    if (user) {
      userCache.set(cacheKey, user)
    }
    return user
  },

  async getUsersWithCache(userIds: string[]) {
    const users = await Promise.all(
      userIds.map(id => this.getUserWithCache(id))
    )
    return users.filter((user): user is IUser => user !== null)
  }
} 