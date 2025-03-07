import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

export const teamService = {
  getTeams: async () => {
    try {
      const { data } = await api.get('/teams')
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams')
    }
  },

  getTeamById: async (id: string) => {
    try {
      const { data } = await api.get(`/teams/${id}`)
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team')
    }
  },

  getTeamDetails: async (id: string) => {
    try {
      const [team, stats] = await Promise.all([
        api.get(`/teams/${id}`).then(res => res.data),
        api.get(`/teams/${id}/stats`).then(res => res.data)
      ])
      return { ...team, ...stats }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team details')
    }
  },

  getTeamAnalytics: async (id: string) => {
    try {
      const { data } = await api.get(`/analytics/team/${id}`)
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team analytics')
    }
  }
} 