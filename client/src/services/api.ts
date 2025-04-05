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

  getGitHubStats: async (owner: string, repo: string) => {
    try {
      if (!owner || !repo) {
        throw new Error('Owner and repo are required');
      }
      
      // Get GitHub token from localStorage or from .env
      const token = localStorage.getItem('github_token') || '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';
      
      // Function to fetch commits with pagination to get more than 100
      const fetchAllCommits = async () => {
        let page = 1;
        let allCommits: any[] = [];
        let hasMore = true;
        
        while (hasMore) {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`, 
            {
              headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
                'X-GitHub-Api-Version': '2022-11-28'
              }
            }
          );
          
          if (response.ok) {
            const commits = await response.json();
            if (commits.length > 0) {
              allCommits = [...allCommits, ...commits];
              page++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
          
          // Limit to 5 pages (500 commits) to avoid hitting rate limits
          if (page > 5) {
            hasMore = false;
          }
        }
        
        return allCommits;
      };
      
      // Get all commits with pagination
      const commits = await fetchAllCommits();
      
      // 函數用於分頁獲取所有 PR 數據
      const fetchAllPRs = async () => {
        let page = 1;
        let allPRs: any[] = [];
        let hasMore = true;
        
        while (hasMore) {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}`, 
            {
              headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
                'X-GitHub-Api-Version': '2022-11-28'
              }
            }
          );
          
          if (response.ok) {
            const prs = await response.json();
            if (prs.length > 0) {
              allPRs = [...allPRs, ...prs];
              page++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
          
          // 最多獲取 5 頁 (500 個 PR) 以避免超出 API 限制
          if (page > 5) {
            hasMore = false;
          }
        }
        
        return allPRs;
      };
      
      // 使用分頁函數獲取所有 issues
      const fetchAllIssues = async () => {
        let page = 1;
        let allIssues: any[] = [];
        let hasMore = true;
        
        while (hasMore) {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`, 
            {
              headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
                'X-GitHub-Api-Version': '2022-11-28'
              }
            }
          );
          
          if (response.ok) {
            const issues = await response.json();
            if (issues.length > 0) {
              allIssues = [...allIssues, ...issues];
              page++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
          
          // 最多獲取 5 頁 (500 個 issues) 以避免超出 API 限制
          if (page > 5) {
            hasMore = false;
          }
        }
        
        // 過濾掉 PR (GitHub API 中 issues 包含 PR)
        return allIssues.filter((issue: any) => !issue.pull_request);
      };
      
      // 並行獲取 PR 和 issue 數據
      const [prs, issues] = await Promise.all([
        fetchAllPRs(),
        fetchAllIssues()
      ]);
      
      // 計算月度和週度數據
      const dateSort = (a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      };

      // 按月分組提交
      const commitsByMonth: number[] = [];
      const lastSixMonths: Array<{month: number, year: number}> = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        lastSixMonths.push({
          month: date.getMonth(),
          year: date.getFullYear()
        });
      }
      
      for (const monthData of lastSixMonths) {
        const count = commits.filter((commit: any) => {
          const commitDate = new Date(commit.commit.author.date);
          return commitDate.getMonth() === monthData.month && 
                commitDate.getFullYear() === monthData.year;
        }).length;
        
        commitsByMonth.push(count);
      }
      
      // 按週計算最近6週的趨勢
      const commitTrends: number[] = [];
      const prTrends: number[] = [];
      const issueTrends: number[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (i * 7) - 6);
        startDate.setHours(0, 0, 0, 0);
        
        // 計算當前週的提交數
        const weekCommits = commits.filter((commit: any) => {
          const commitDate = new Date(commit.commit.author.date);
          return commitDate >= startDate && commitDate <= endDate;
        }).length;
        
        // 計算當前週的 PR 數
        const weekPRs = prs.filter((pr: any) => {
          const prDate = new Date(pr.created_at);
          return prDate >= startDate && prDate <= endDate;
        }).length;
        
        // 計算當前週的問題數
        const weekIssues = issues.filter((issue: any) => {
          const issueDate = new Date(issue.created_at);
          return issueDate >= startDate && issueDate <= endDate;
        }).length;
        
        commitTrends.push(weekCommits);
        prTrends.push(weekPRs);
        issueTrends.push(weekIssues);
      }
      
      // 按月分組問題
      const issuesOpened: number[] = [];
      const issuesClosed: number[] = [];
      
      for (const monthData of lastSixMonths) {
        const openedCount = issues.filter((issue: any) => {
          const issueDate = new Date(issue.created_at);
          return issueDate.getMonth() === monthData.month && 
                issueDate.getFullYear() === monthData.year;
        }).length;
        
        const closedCount = issues.filter((issue: any) => {
          if (!issue.closed_at) return false;
          const closeDate = new Date(issue.closed_at);
          return closeDate.getMonth() === monthData.month && 
                closeDate.getFullYear() === monthData.year;
        }).length;
        
        issuesOpened.push(openedCount);
        issuesClosed.push(closedCount);
      }
      
      const totalCommits = commits.length;
      const totalPRs = prs.length;
      const totalIssues = issues.length;
      const openIssues = issues.filter((issue: any) => issue.state === 'open').length;
      const closedIssues = issues.filter((issue: any) => issue.state === 'closed').length;
      
      return {
        data: {
          commitsByMonth,
          issuesOpened,
          issuesClosed,
          commitTrends,
          prTrends,
          issueTrends,
          totalCommits,
          totalPRs,
          totalIssues,
          openIssues,
          closedIssues
        }
      };
    } catch (error) {
      console.error('Error in getGitHubStats:', error);
      return {
        data: {
          commitsByMonth: [],
          issuesOpened: [],
          issuesClosed: [],
          commitTrends: [],
          prTrends: [],
          issueTrends: [],
          totalCommits: 0,
          totalPRs: 0,
          totalIssues: 0,
          openIssues: 0,
          closedIssues: 0
        }
      };
    }
  },

  exportTeams: async (teamIds: string[]) => {
    try {
      const { data } = await api.post('/teams/export', { teamIds });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export teams');
    }
  },

  getRepoContributors: async (owner: string, repo: string) => {
    try {
      // 嘗試使用後端 API 獲取
      try {
        const { data } = await api.get(`/analytics/github/${owner}/${repo}/contributors`);
        return data;
      } catch (error) {
        console.log('Backend API for contributors not available, falling back to direct GitHub API');
        
        // 使用 GitHub API 直接獲取貢獻者
        const headers = {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        };
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, { headers });
        const contributors = await response.json();
        
        if (Array.isArray(contributors)) {
          return contributors.map(contributor => ({
            login: contributor.login,
            id: contributor.id,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
            url: contributor.html_url
          }));
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching repository contributors:', error);
      return [];
    }
  },
  
  getRepoParticipation: async (owner: string, repo: string) => {
    try {
      console.log(`Fetching GitHub participation stats for ${owner}/${repo}`);
      
      // 使用 GitHub API 直接獲取參與統計數據
      const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer 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',
        'X-GitHub-Api-Version': '2022-11-28'
      };
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/participation`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Participation data:", data);
        return data;
      } else {
        console.error(`GitHub API error: ${response.status} - ${await response.text()}`);
        // 返回空數據結構
        return {
          all: Array(52).fill(0),
          owner: Array(52).fill(0)
        };
      }
    } catch (error) {
      console.error('Error fetching participation data:', error);
      return {
        all: Array(52).fill(0),
        owner: Array(52).fill(0)
      };
    }
  },
  
  getRepoPullRequests: async (owner: string, repo: string) => {
    try {
      console.log(`Fetching GitHub pull requests for ${owner}/${repo}`);
      
      // 使用 GitHub API 直接獲取 PR 數據
      const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer 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',
        'X-GitHub-Api-Version': '2022-11-28'
      };
      
      // 分頁獲取所有 PR 數據
      const fetchAllPullRequests = async () => {
        let page = 1;
        let allPullRequests: any[] = [];
        let hasMore = true;
        
        while (hasMore) {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}`, 
            { headers }
          );
          
          if (response.ok) {
            const prs = await response.json();
            if (prs.length > 0) {
              allPullRequests = [...allPullRequests, ...prs];
              page++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
          
          // 最多獲取 5 頁數據 (500 個 PR) 以避免超出 API 限制
          if (page > 5) {
            hasMore = false;
          }
        }
        
        return allPullRequests;
      };
      
      // 使用分頁獲取所有 PR 數據
      const pullRequests = await fetchAllPullRequests();
      console.log("Pull Requests data:", pullRequests);
      
      // 統計每個貢獻者的 PR 數量
      interface ContributorStat {
        login: string;
        id: number;
        avatar_url: string;
        total_prs: number;
        open_prs: number;
        closed_prs: number;
        merged_prs: number;
        url: string;
      }
      
      const contributorStats: Record<string, ContributorStat> = {};
      
      for (const pr of pullRequests) {
        const username = pr.user.login;
        
        if (!contributorStats[username]) {
          contributorStats[username] = {
            login: username,
            id: pr.user.id,
            avatar_url: pr.user.avatar_url,
            total_prs: 0,
            open_prs: 0,
            closed_prs: 0,
            merged_prs: 0,
            url: pr.user.html_url
          };
        }
        
        contributorStats[username].total_prs++;
        
        if (pr.state === 'open') {
          contributorStats[username].open_prs++;
        } else if (pr.merged_at) {
          contributorStats[username].merged_prs++;
        } else {
          contributorStats[username].closed_prs++;
        }
      }
      
      // 轉換成數組並排序
      const contributorsArray = Object.values(contributorStats);
      contributorsArray.sort((a: ContributorStat, b: ContributorStat) => b.total_prs - a.total_prs);
      
      return {
        pullRequests,
        contributorsStats: contributorsArray,
        totalCount: pullRequests.length,
        openCount: pullRequests.filter(pr => pr.state === 'open').length,
        closedCount: pullRequests.filter(pr => pr.state === 'closed' && !pr.merged_at).length,
        mergedCount: pullRequests.filter(pr => pr.merged_at).length
      };
    } catch (error) {
      console.error('Error fetching repository pull requests:', error);
      return {
        pullRequests: [],
        contributorsStats: [],
        totalCount: 0,
        openCount: 0,
        closedCount: 0,
        mergedCount: 0
      };
    }
  },
  
  getRepoIssues: async (owner: string, repo: string) => {
    try {
      console.log(`Fetching GitHub issues for ${owner}/${repo}`);
      
      // 使用 GitHub API 直接獲取 Issues 數據
      const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer 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',
        'X-GitHub-Api-Version': '2022-11-28'
      };
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`, { headers });
      
      if (response.ok) {
        const allIssues = await response.json();
        
        // 過濾掉 Pull Requests (GitHub API 中 Issues 包含 PRs)
        const issues = allIssues.filter((issue: any) => !issue.pull_request);
        console.log("Issues data:", issues);
        
        // 統計每個貢獻者的 Issues 數量
        interface IssueContributorStat {
          login: string;
          id: number;
          avatar_url: string;
          total_issues: number;
          open_issues: number;
          closed_issues: number;
          url: string;
          // 添加統計評論數量
          comments_count: number;
        }
        
        const contributorStats: Record<string, IssueContributorStat> = {};
        
        // 獲取和處理 Issues
        for (const issue of issues) {
          const username = issue.user.login;
          
          if (!contributorStats[username]) {
            contributorStats[username] = {
              login: username,
              id: issue.user.id,
              avatar_url: issue.user.avatar_url,
              total_issues: 0,
              open_issues: 0,
              closed_issues: 0,
              comments_count: 0,
              url: issue.user.html_url
            };
          }
          
          contributorStats[username].total_issues++;
          
          if (issue.state === 'open') {
            contributorStats[username].open_issues++;
          } else {
            contributorStats[username].closed_issues++;
          }
          
          // 計算評論數量
          contributorStats[username].comments_count += issue.comments || 0;
        }
        
        // 轉換成數組並排序
        const contributorsArray = Object.values(contributorStats);
        contributorsArray.sort((a: IssueContributorStat, b: IssueContributorStat) => 
          b.total_issues - a.total_issues || b.comments_count - a.comments_count
        );
        
        return {
          issues,
          contributorsStats: contributorsArray,
          totalCount: issues.length,
          openCount: issues.filter((issue: any) => issue.state === 'open').length,
          closedCount: issues.filter((issue: any) => issue.state === 'closed').length
        };
      } else {
        console.error(`GitHub API error: ${response.status} - ${await response.text()}`);
        return {
          issues: [],
          contributorsStats: [],
          totalCount: 0,
          openCount: 0,
          closedCount: 0
        };
      }
    } catch (error) {
      console.error('Error fetching repository issues:', error);
      return {
        issues: [],
        contributorsStats: [],
        totalCount: 0,
        openCount: 0,
        closedCount: 0
      };
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
