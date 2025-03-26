import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// Add a function to verify server connection
const checkServerConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_URL}/students`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Server connection check failed:', error);
    return false;
  }
};

// Check server connection on startup
checkServerConnection().then(isConnected => {
  if (isConnected) {
    console.log('✅ Server connection successful');
  } else {
    console.error('❌ Server connection failed - Please ensure the backend server is running');
    alert('Cannot connect to the server. Please ensure the backend server is running at ' + API_URL);
  }
});

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000 // Add a timeout to prevent hanging requests
})

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || {});
  return config;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(response => {
  console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
  return response;
}, error => {
  console.error('API Response Error:', error.response || error);
  return Promise.reject(error);
});

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
          return { data: {} }; // 
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

  getTeamsForCourse: async (courseId: string) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/teams`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams');
    }
  },

  exportTeams: async (teamIds: string[]) => {
    try {
      const { data } = await api.post('/teams/export', { teamIds });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export teams');
    }
  }
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
  
  getAllCourseStats: async () => {
    try {
      const { data } = await api.get('/course-stats/all');
      return data;
    } catch (error) {
      console.error('Error fetching course stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch course statistics');
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
      console.log('Searching students with query:', query);
      const { data } = await api.post('/students/search', { query });
      console.log('API response data:', data);
      return data; 
    } catch (error: any) {
      console.error('Search students error:', error.response || error);
      if (!error.response) {
        // Network error or server not running
        console.error('Network error - Is the server running?');
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
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
  },

  getStudentActivity: async (githubId: string) => {
    try {
      // 尝试获取学生所属的团队
      const studentTeams = await api.get(`/students/teams/${githubId}`).catch(() => ({ data: [] }));
      
      // 如果找到了学生的团队，尝试获取该团队的GitHub数据
      if (studentTeams.data && studentTeams.data.length > 0) {
        const team = studentTeams.data[0]; // 使用第一个团队
        
        if (team.repositoryUrl) {
          try {
            // 从URL中提取GitHub仓库信息
            const [owner, repo] = team.repositoryUrl
              .replace('https://github.com/', '')
              .split('/');
              
            if (owner && repo) {
              // 尝试获取用户的GitHub贡献数据
              try {
                // 获取提交数据
                const commitsResponse = await api.get(`/github/${owner}/${repo}/commits?author=${githubId}`);
                const commits = commitsResponse.data?.length || 0;
                
                // 获取问题数据
                const issuesResponse = await api.get(`/github/${owner}/${repo}/issues?creator=${githubId}`);
                const issues = issuesResponse.data?.length || 0;
                
                // 获取拉取请求数据
                const pullsResponse = await api.get(`/github/${owner}/${repo}/pulls?creator=${githubId}`);
                const pullRequests = pullsResponse.data?.length || 0;
                
                // 获取评论数据
                const commentsResponse = await api.get(`/github/${owner}/${repo}/comments?author=${githubId}`);
                const comments = commentsResponse.data?.length || 0;
                
                // 获取最后活动时间
                const lastActiveDate = commitsResponse.data && commitsResponse.data.length > 0
                  ? new Date(commitsResponse.data[0].commit.author.date)
                  : null;
                
                return {
                  commits,
                  issues,
                  pullRequests,
                  comments,
                  lastActive: lastActiveDate ? lastActiveDate.toISOString() : null,
                  team: team.name
                };
              } catch (githubError) {
                console.error('Failed to fetch GitHub data:', githubError);
                // 如果API调用失败，返回0值而不是模拟数据
                return {
                  commits: 0,
                  issues: 0,
                  pullRequests: 0,
                  comments: 0,
                  lastActive: null,
                  team: team.name
                };
              }
            }
          } catch (error) {
            console.error('Error parsing repository URL:', error);
          }
        }
      }
      
      // 如果没有团队或其他错误，返回0值
      return {
        commits: 0,
        issues: 0,
        pullRequests: 0,
        comments: 0,
        lastActive: null,
        team: null
      };
    } catch (error: any) {
      console.error('Failed to fetch student activity:', error);
      // 返回0值
      return {
        commits: 0,
        issues: 0,
        pullRequests: 0, 
        comments: 0,
        lastActive: null,
        team: null
      };
    }
  },

  createStudent: async (studentData: { name: string; email: string; githubId: string }) => {
    try {
      console.log('Creating student with data:', studentData);
      const { data } = await api.post('/students', studentData);
      console.log('Student created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error in createStudent:', error.response?.data || error);
      
      // 处理常见的错误类型
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // 处理重复键错误
        if (responseData.error === 'duplicate_key') {
          const field = responseData.field;
          if (field === 'email') {
            throw new Error('Email already exists');
          } else if (field === 'githubId') {
            throw new Error('GitHub ID already exists');
          } else {
            throw new Error('Student already exists');
          }
        }
        
        // 返回服务器提供的错误消息
        if (responseData.message) {
          throw new Error(responseData.message);
        }
      }
      
      // 处理一般连接错误
      if (!error.response) {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      
      // 默认错误消息
      throw new Error(error.response?.data?.message || 'Failed to create student');
    }
  },

  getAllStudents: async () => {
    try {
      console.log('Getting all students');
      const { data } = await api.get('/students');
      console.log('Get all students response:', data);
      return data;
    } catch (error: any) {
      console.error('Get all students error:', error.response || error);
      if (!error.response) {
        // Network error or server not running
        console.error('Network error - Is the server running?');
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw new Error(error.response?.data?.message || 'Failed to get students');
    }
  },
  
  deleteStudent: async (id: string) => {
    try {
      console.log('Deleting student with ID:', id);
      await api.delete(`/students/${id}`);
      return true;
    } catch (error: any) {
      console.error('Delete student error:', error.response || error);
      if (!error.response) {
        // Network error or server not running
        console.error('Network error - Is the server running?');
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete student');
    }
  },
  
  updateStudent: async (id: string, studentData: { name: string; email: string; githubId: string }) => {
    try {
      console.log('Updating student with ID:', id, 'and data:', studentData);
      const { data } = await api.put(`/students/${id}`, studentData);
      console.log('Student updated successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Update student error:', error.response || error);
      
      // 處理常見的錯誤類型
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // 處理重複鍵錯誤
        if (responseData.error === 'duplicate_key') {
          const field = responseData.field;
          if (field === 'email') {
            throw new Error('Email already exists');
          } else if (field === 'githubId') {
            throw new Error('GitHub ID already exists');
          } else {
            throw new Error('Student already exists');
          }
        }
        
        // 返回服務器提供的錯誤訊息
        if (responseData.message) {
          throw new Error(responseData.message);
        }
      }
      
      // 處理一般連接錯誤
      if (!error.response) {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      
      // 默認錯誤訊息
      throw new Error(error.response?.data?.message || 'Failed to update student');
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
