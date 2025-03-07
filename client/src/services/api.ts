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
      if (!id) throw new Error('Team ID is required');
      
      const [teamResponse, statsResponse] = await Promise.all([
        api.get(`/teams/${id}`).catch(error => {
          console.error('Error fetching team:', error);
          throw new Error(error.response?.data?.message || 'Failed to fetch team');
        }),
        api.get(`/teams/${id}/stats`).catch(error => {
          console.error('Error fetching team stats:', error);
          return { data: {} }; // 返回空对象而不是抛出错误
        })
      ]);
      
      return { ...teamResponse.data, ...statsResponse.data };
    } catch (error: any) {
      console.error('Error in getTeamDetails:', error);
      throw new Error(error.message || 'Failed to fetch team details');
    }
  },

  getTeamAnalytics: async (id: string) => {
    try {
      const { data } = await api.get(`/analytics/team/${id}`)
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team analytics')
    }
  },

  getTeamByName: async (name: string) => {
    try {
      const { data } = await api.get(`/teams/name/${encodeURIComponent(name)}`)
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team')
    }
  },

  deleteTeam: async (id: string) => {
    try {
      await api.delete(`/teams/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete team');
    }
  },

  getAvailableStudents: async () => {
    try {
      const { data } = await api.get('/teams/students/available');
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available students');
    }
  },

  addTeamMember: async (teamId: string, studentId: string) => {
    try {
      const { data } = await api.post(`/teams/${teamId}/members`, { studentId });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add team member');
    }
  },

  changeTeamLeader: async (teamId: string, newLeaderId: string) => {
    try {
      const { data } = await api.put(`/teams/${teamId}/leader`, { newLeaderId });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change team leader');
    }
  }
}

export const courseService = {
  getAllCourses: async () => {
    try {
      const response = await api.get('/courses');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  },
  
  getCourseById: async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course');
    }
  }
} 