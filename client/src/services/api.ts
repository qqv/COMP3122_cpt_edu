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

  getAvailableStudents: async (teamId: string) => {
    try {
      const { data } = await api.get(`/teams/${teamId}/available-students`);
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
  },

  removeTeamMember: async (teamId: string, memberId: string) => {
    try {
      const { data } = await api.delete(`/teams/${teamId}/members/${memberId}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove team member');
    }
  },

  createTeam: async (teamData: { name: string; leaderEmail: string; courseId: string }) => {
    try {
      const { data } = await api.post('/teams', teamData);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create team');
    }
  },

  batchCreateTeams: async (teams: Array<{ name: string; leaderEmail: string }>, courseId: string) => {
    try {
      const { data } = await api.post('/teams/batch', { teams, courseId });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create teams');
    }
  },

  getTeamByInviteCode: async (inviteCode: string) => {
    try {
      const { data } = await api.get(`/teams/invite/${inviteCode}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team by invite code');
    }
  },

  updateTeamRepository: async (teamId: string, repositoryUrl: string) => {
    try {
      const { data } = await api.put(`/teams/${teamId}/repository`, { repositoryUrl });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update repository URL');
    }
  },

  verifyInvite: async (inviteCode: string) => {
    const response = await api.get(`/teams/invite/${inviteCode}`);
    return response.data;
  },
}

export const courseService = {
  getAllCourses: async () => {
    try {
      const { data } = await api.get('/courses');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  },
  
  getCourseById: async (id) => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course');
    }
  },
  
  createCourse: async (courseData) => {
    try {
      const { data } = await api.post('/courses', courseData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create course');
    }
  },
  
  updateCourse: async (id, courseData) => {
    try {
      const { data } = await api.put(`/courses/${id}`, courseData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update course');
    }
  },
  
  deleteCourse: async (id) => {
    try {
      const { data } = await api.delete(`/courses/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete course');
    }
  },
  
  assignTeachers: async (id, teachers) => {
    try {
      const { data } = await api.post(`/courses/${id}/assign-teachers`, { teachers });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign teachers');
    }
  }
};

export const studentService = {
  searchStudents: async (query: string) => {
    try {
      const { data } = await api.post('/students/search', { query });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search students');
    }
  },
  
  getStudentById: async (id: string) => {
    try {
      const { data } = await api.get(`/students/${id}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student');
    }
  }
};

export const userService = {
  getAllUsers: async () => {
    try {
      const { data } = await api.get('/users');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },
  
  getUserById: async (id) => {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },
  
  createUser: async (userData) => {
    try {
      const { data } = await api.post('/users', userData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },
  
  updateUser: async (id, userData) => {
    try {
      const { data } = await api.put(`/users/${id}`, userData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },
  
  resetPassword: async (id, newPassword) => {
    try {
      const { data } = await api.post(`/users/${id}/reset-password`, { newPassword });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
  
  assignCourses: async (id, courses) => {
    try {
      const { data } = await api.post(`/users/${id}/assign-courses`, { courses });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign courses');
    }
  }
}; 