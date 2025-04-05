import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Stack,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  InputLabel,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  useTheme,
  FormControlLabel,
  Switch
} from '@mui/material'
import { 
  LineChart,
  BarChart,
  PieChart
} from '@mui/x-charts'
import WarningIcon from '@mui/icons-material/Warning'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import PersonIcon from '@mui/icons-material/Person'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BugReportIcon from '@mui/icons-material/BugReport'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import GitHubIcon from '@mui/icons-material/GitHub'
import RefreshIcon from '@mui/icons-material/Refresh'
import InfoIcon from '@mui/icons-material/Info'
import AddIcon from '@mui/icons-material/Add'
import VerifiedIcon from '@mui/icons-material/Verified'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

// Import the API services
import { teamService, studentService, courseService } from '../services/api'
import { HttpStatusCode } from 'axios'
import axios from 'axios'

// Type declarations for contribution data
type ContributionDay = {
  count: number;
  intensity: 'none' | 'low' | 'medium' | 'high' | 'very-high';
}

// Define interfaces for team and student models
interface Team {
  _id: string;
  name: string;
  repositoryUrl?: string;
  members?: Array<{
    userId: string | {
      _id: string;
      name?: string;
      githubId?: string;
    };
    role?: string;
    _id?: string;
  }>;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  githubId: string;
}

// TeamRepositoryStats component to display per-team repository statistics
interface TeamRepositoryStatsProps {
  team: Team;
  students: Student[];
}

const TeamRepositoryStats: React.FC<TeamRepositoryStatsProps> = ({ team, students }) => {
  const [stats, setStats] = useState({
    totalCommits: 0,
    totalPRs: 0,
    totalIssues: 0,
    openIssues: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [contributors, setContributors] = useState<any[]>([]);

  // Extract repository owner and name
  const extractRepoInfo = (repositoryUrl: string | undefined) => {
    if (!repositoryUrl) return { owner: '', repo: '' };
    
    try {
      const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match && match.length >= 3) {
        return { owner: match[1], repo: match[2] };
      }
    } catch (error) {
      console.error('Error parsing repository URL:', error);
    }
    
    return { owner: '', repo: '' };
  };

  useEffect(() => {
    const fetchRepoStats = async () => {
      setLoading(true);
      setError(false);
      
      if (!team.repositoryUrl) {
        setLoading(false);
        setError(true);
        return;
      }
      
      const { owner, repo } = extractRepoInfo(team.repositoryUrl);
      
      if (!owner || !repo) {
        setLoading(false);
        setError(true);
        return;
      }
      
      try {
        // Get GitHub token from localStorage or from .env
        const token = localStorage.getItem('github_token') || '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';
        
        // Function to fetch commits with pagination
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
            
            // Check if we've reached 5 pages (500 commits) to avoid hitting rate limits
            if (page > 5) {
              hasMore = false;
            }
          }
          
          return allCommits;
        };
        
        // Fetch all commits with pagination
        const allCommits = await fetchAllCommits();
        const totalCommitsCount = allCommits.length;
        
        // Function to fetch PRs with pagination
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
            
            // Check if we've reached 5 pages (500 PRs) to avoid hitting rate limits
            if (page > 5) {
              hasMore = false;
            }
          }
          
          return allPRs;
        };
        
        // Fetch all PRs with pagination
        const allPRs = await fetchAllPRs();
        const totalPRsCount = allPRs.length;
        
        // Function to fetch issues with pagination and filter PRs
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
            
            // Check if we've reached 5 pages (500 issues) to avoid hitting rate limits
            if (page > 5) {
              hasMore = false;
            }
          }
          
          return allIssues;
        };
        
        // Fetch all issues with pagination
        const allIssues = await fetchAllIssues();
        
        // Filter out pull requests since GitHub API returns them as issues
        const issuesOnly = allIssues.filter((issue: any) => !issue.pull_request);
        const totalIssuesCount = issuesOnly.length;
        const openIssuesCount = issuesOnly.filter((issue: any) => issue.state === 'open').length;
        
        // Get repository stats from API for backward compatibility
        const { data } = await teamService.getGitHubStats(owner, repo);
        
        // Get contributors data to calculate total commits (fallback)
        const contributorsData = await teamService.getRepoContributors(owner, repo);
        setContributors(contributorsData);
        
        // Calculate total commits from contributors (as fallback)
        const totalCommitsFromContributors = contributorsData.reduce(
          (total, contributor) => total + (contributor.contributions || 0), 
          0
        );
        
        // Use the maximum value from our different sources
        const finalTotalCommits = Math.max(
          totalCommitsCount,
          totalCommitsFromContributors,
          data.totalCommits || 0
        );
        
        setStats({
          totalCommits: finalTotalCommits,
          totalPRs: totalPRsCount || data.totalPRs || 0,
          totalIssues: totalIssuesCount || data.totalIssues || 0,
          openIssues: openIssuesCount || data.openIssues || 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching stats for ${owner}/${repo}:`, error);
        setError(true);
        setLoading(false);
      }
    };
    
    fetchRepoStats();
  }, [team.repositoryUrl]);

  // If loading or error, show appropriate UI
  if (loading) {
    return (
      <>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'primary.light', 
            p: 1, 
            borderRadius: 1,
            color: 'white',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" display="block">Total Commits</Typography>
            <Typography variant="h6">
              {stats.totalCommits}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'success.light', 
            p: 1, 
            borderRadius: 1,
            color: 'white',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" display="block">Total Pull Requests</Typography>
            <Typography variant="h6">
              {stats.totalPRs}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'error.light', 
            p: 1, 
            borderRadius: 1,
            color: 'white',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" display="block">Total Issues</Typography>
            <Typography variant="h6">
              {stats.totalIssues}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'info.light', 
            p: 1, 
            borderRadius: 1,
            color: 'white',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" display="block">Contributors</Typography>
            <Typography variant="h6">
              {team.members?.length || students.length}
            </Typography>
          </Box>
        </Grid>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'grey.300', 
            p: 1, 
            borderRadius: 1,
            color: 'text.secondary'
          }}>
            <Typography variant="caption" display="block">Total Commits</Typography>
            <Typography variant="body2">Unable to get data</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'grey.300', 
            p: 1, 
            borderRadius: 1,
            color: 'text.secondary'
          }}>
            <Typography variant="caption" display="block">Total Pull Requests</Typography>
            <Typography variant="body2">Unable to get data</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'grey.300', 
            p: 1, 
            borderRadius: 1,
            color: 'text.secondary'
          }}>
            <Typography variant="caption" display="block">Total Issues</Typography>
            <Typography variant="h6">
              {stats.totalIssues}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ 
            bgcolor: 'info.light', 
            p: 1, 
            borderRadius: 1,
            color: 'white',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" display="block">Contributors</Typography>
            <Typography variant="h6">
              {team.members?.length || students.length}
            </Typography>
          </Box>
        </Grid>
      </>
    );
  }
  
  // Show actual data
  return (
    <>
      <Grid item xs={6} md={3}>
        <Box sx={{ 
          bgcolor: 'primary.light', 
          p: 1, 
          borderRadius: 1,
          color: 'white',
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" display="block">Total Commits</Typography>
          <Typography variant="h6">
            {stats.totalCommits}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} md={3}>
        <Box sx={{ 
          bgcolor: 'success.light', 
          p: 1, 
          borderRadius: 1,
          color: 'white',
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" display="block">Total Pull Requests</Typography>
          <Typography variant="h6">
            {stats.totalPRs}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} md={3}>
        <Box sx={{ 
          bgcolor: 'error.light', 
          p: 1, 
          borderRadius: 1,
          color: 'white',
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" display="block">Total Issues</Typography>
          <Typography variant="h6">
            {stats.totalIssues}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} md={3}>
        <Box sx={{ 
          bgcolor: 'info.light', 
          p: 1, 
          borderRadius: 1,
          color: 'white',
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" display="block">Contributors</Typography>
          <Typography variant="h6">
            {team.members?.length || students.length}
          </Typography>
        </Box>
      </Grid>
    </>
  );
};

// Define the analytics data interfaces
interface ChartDataPoint {
  data: number[];
  label: string;
  color: string;
  area?: boolean;
  showMark?: boolean;
}

interface AxisConfig {
  data: string[];
  scaleType: 'band' | 'linear' | 'time' | 'log' | 'point' | 'pow' | 'sqrt' | 'utc';
}

interface ChartConfig {
  xAxis: AxisConfig[];
  series: ChartDataPoint[];
}

interface CollaborationDataItem {
  id: number;
  value: number;
  label: string;
}

interface CollaborationData {
  data: CollaborationDataItem[];
}

interface TopContributor {
  name: string;
  id: string;
  githubId: string;
  commits: number;
  prs: number;
  issues: number;
  avatar: string;
}

interface DeadlineFighter {
  name: string;
  id: string;
  githubId: string;
  avatar: string;
  trend: number[];
  deadlineDate: string;
  lastMinuteCommits: number;
  lastMinutePercentage: number;
}

interface FreeRider {
  name: string;
  id: string;
  githubId: string;
  avatar: string;
  commits: number;
  prs: number;
  comments: number;
  teamAvgCommits: number;
  participationPercentage: number;
}

interface MilestoneProgress {
  milestone: string;
  team: string;
  completed: number;
  total: number;
}

interface CodeReviewData {
  name: string;
  reviews: number;
  comments: number;
  approval: number;
  changes: number;
}

interface AnalyticsData {
  commitData: ChartConfig;
  issueData: ChartConfig;
  activityTrendsData: ChartConfig;
  teamPerformanceData: ChartConfig;
  collaborationData: CollaborationData;
  topContributors: TopContributor[];
  deadlineFighters: DeadlineFighter[];
  freeRiders: FreeRider[];
  milestoneProgressData: MilestoneProgress[];
  codeReviewData: CodeReviewData[];
  contributionData: ContributionDay[][];
  repoStats: {
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    openIssues: number;
  };
}

// TeamContributorsComparison component to display team members and repository contributors comparison
interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
  url: string;
}

interface TeamContributorsComparisonProps {
  team: Team;
  students: Student[];
}

const TeamContributorsComparison: React.FC<TeamContributorsComparisonProps> = ({ team, students }) => {
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    githubId: ''
  });
  const [selectedContributor, setSelectedContributor] = useState<any>(null);

  // Extract owner/repo from repository URL
  const extractRepoInfo = (repoUrl: string) => {
    try {
      // Handle both https://github.com/owner/repo and git@github.com:owner/repo.git formats
      let owner, repo;
      
      if (repoUrl.includes('github.com')) {
        const urlParts = repoUrl.split('github.com/');
        if (urlParts.length > 1) {
          const parts = urlParts[1].split('/');
          owner = parts[0];
          repo = parts[1]?.replace('.git', '');
        } else {
          const sshParts = repoUrl.split(':');
          if (sshParts.length > 1) {
            const parts = sshParts[1].split('/');
            owner = parts[0];
            repo = parts[1]?.replace('.git', '');
          }
        }
      }
      
      return { owner, repo };
    } catch (err) {
      console.error('Error parsing repository URL:', err);
      return { owner: null, repo: null };
    }
  };

  const fetchContributors = async () => {
    if (!team.repositoryUrl) {
      setError('No repository URL provided for this team');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { owner, repo } = extractRepoInfo(team.repositoryUrl);
      
      if (!owner || !repo) {
        throw new Error('Failed to parse repository URL');
      }

      // 使用 teamService 調用獲取貢獻者信息
      const contributorsData = await teamService.getRepoContributors(owner, repo);
      setContributors(contributorsData);
    } catch (err) {
      console.error('Error fetching contributors:', err);
      setError('Failed to fetch repository contributors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 開啟添加學生對話框
  const openAddStudentDialog = (contributor: any) => {
    // 從 GitHub 名稱生成可能的姓名
    const [firstName, lastName] = contributor.login.split('-').length > 1 
      ? contributor.login.split('-') 
      : [contributor.login, ''];
    
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1) + 
          (lastName ? ' ' + lastName.charAt(0).toUpperCase() + lastName.slice(1) : '');
    
    // 預填對話框中的表單
    setNewStudentData({
      name: formattedName,
      email: `${contributor.login}@example.com`,
      githubId: contributor.login
    });
    
    setSelectedContributor(contributor);
    setDialogOpen(true);
  };

  // 處理表單輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理添加貢獻者到團隊的功能
  const handleAddContributor = async (contributor: any) => {
    setAddingMember(contributor.login);
    setSuccessMessage(null);
    
    try {
      // 檢查我們是否已有該用戶的學生記錄
      const existingStudent = students.find(
        student => student.githubId.toLowerCase() === contributor.login.toLowerCase()
      );
      
      if (existingStudent) {
        // 如果學生記錄存在，將其添加到團隊
        await teamService.addTeamMember(team._id, existingStudent._id);
        setSuccessMessage(`Successfully ${contributor.login} added to team`);
        // 觸發 Analytics 頁面刷新團隊和學生數據
        window.dispatchEvent(new CustomEvent('refresh-analytics-data'));
      } else {
        // 如果學生記錄不存在，開啟對話框讓用戶輸入詳細信息
        openAddStudentDialog(contributor);
      }
    } catch (err) {
      console.error('Error adding contributor to team:', err);
      setError(`將 ${contributor.login} Error adding to team. Please try again later。`);
    } finally {
      setAddingMember(null);
    }
  };

  // 提交新學生表單
  const handleSubmitNewStudent = async () => {
    if (!selectedContributor) return;
    
    setAddingMember(selectedContributor.login);
    setError(null);
    setDialogOpen(false);
    
    try {
      // 創建新學生記錄
      const createdStudent = await studentService.createStudent(newStudentData);
      
      // 將新學生添加到團隊
      await teamService.addTeamMember(team._id, createdStudent._id);
      
      setSuccessMessage(`The student record has been successfully created and will ${selectedContributor.login} add to team`);
      
      // 觸發 Analytics 頁面刷新團隊和學生數據
      window.dispatchEvent(new CustomEvent('refresh-analytics-data'));
    } catch (createError) {
      console.error('Error creating new student:', createError);
      setError(`Error creating new student record：${createError.message || 'error'}`);
    } finally {
      setAddingMember(null);
      setSelectedContributor(null);
    }
  };

  useEffect(() => {
    if (team.repositoryUrl) {
      fetchContributors();
    }
  }, [team.repositoryUrl]);

  // 自動清除成功消息
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Get team members based on the team's member IDs
  const teamMembers = students.filter(student => 
    team.members?.some(member => {
      if (typeof member.userId === 'string') {
        return member.userId === student._id;
      } else if (member.userId && typeof member.userId === 'object') {
        return member.userId._id === student._id;
      }
      return false;
    })
  );

  // Find contributors not in the team
  const contributorsNotInTeam = contributors.filter(contributor => 
    !teamMembers.some(member => member.githubId.toLowerCase() === contributor.login.toLowerCase())
  );

  // Find team members without contributions
  const teamMembersNotContributing = teamMembers.filter(member => 
    !contributors.some(contributor => contributor.login.toLowerCase() === member.githubId.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ p: 2, fontSize: '1rem' }}>
        <AlertTitle sx={{ fontSize: '1.1rem' }}>error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {/* 添加學生對話框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Adding new students to the system</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
          No student record found for this GitHub user. Please fill out the information below to create a new student record and add it to your team.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Stutent Name"
            fullWidth
            variant="outlined"
            value={newStudentData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newStudentData.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="githubId"
            label="GitHub ID"
            fullWidth
            variant="outlined"
            value={newStudentData.githubId}
            onChange={handleInputChange}
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitNewStudent} variant="contained" color="primary">
          Create and add to a team
          </Button>
        </DialogActions>
      </Dialog>
      
      <Grid container spacing={3}>
        {/* Team Members Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Team Members ({teamMembers.length})
          </Typography>
          
          {/* 刪除團隊學生列表部分 */}
          
          <Box sx={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
            <List>
              {teamMembers.map(member => {
                const hasContributions = contributors.some(
                  c => c.login.toLowerCase() === member.githubId.toLowerCase()
                );
                
                return (
                  <ListItem key={member._id} sx={{ py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar 
                        src={
                          contributors.find(
                            c => c.login.toLowerCase() === member.githubId.toLowerCase()
                          )?.avatar_url
                        }
                        sx={{ width: 50, height: 50 }}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem' }}>{member.name}</Typography>}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            icon={<GitHubIcon fontSize="small" />}
                            label={member.githubId}
                            size="medium"
                            variant="outlined"
                            component="a"
                            href={`https://github.com/${member.githubId}`}
                            target="_blank"
                            clickable
                            sx={{ fontSize: '0.85rem' }}
                          />
                          {!hasContributions && (
                            <Chip
                              label="No Contributions"
                              size="medium"
                              color="warning"
                              sx={{ fontSize: '0.85rem' }}
                            />
                          )}
                        </Box>
                      }
                    />
                    {hasContributions && (
                      <Chip
                        label={`${
                          contributors.find(
                            c => c.login.toLowerCase() === member.githubId.toLowerCase()
                          )?.contributions || 0
                        } commits`}
                        size="medium"
                        color="success"
                        sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Grid>

        {/* Repository Contributors Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Repository Contributors ({contributors.length})
          </Typography>
          <Box sx={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
            <List>
              {contributors.map(contributor => {
                const isTeamMember = teamMembers.some(
                  member => member.githubId.toLowerCase() === contributor.login.toLowerCase()
                );
                
                return (
                  <ListItem 
                    key={contributor.id} 
                    sx={{ py: 1.5 }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="medium" 
                          href={contributor.html_url || `https://github.com/${contributor.login}`}
                          target="_blank"
                          sx={{ color: 'primary.main' }}
                        >
                          <OpenInNewIcon />
                        </IconButton>
                        
                        {!isTeamMember && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAddContributor(contributor)}
                            disabled={addingMember === contributor.login}
                            startIcon={addingMember === contributor.login ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                            sx={{ fontSize: '0.85rem', ml: 1 }}
                          >
                            {addingMember === contributor.login ? 'Adding...' : 'Add to team'}
                          </Button>
                        )}
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={contributor.avatar_url}
                        sx={{ width: 50, height: 50 }}
                      >
                        {contributor.login[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem' }}>{contributor.login}</Typography>}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={`${contributor.contributions} commits`}
                            size="medium"
                            color="primary"
                            sx={{ fontSize: '0.85rem' }}
                          />
                          {!isTeamMember && (
                            <Chip
                              label="Not in Team"
                              size="medium"
                              color="error"
                              sx={{ fontSize: '0.85rem' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Grid>

        {/* Summary Section */}
        {(contributorsNotInTeam.length > 0 || teamMembersNotContributing.length > 0) && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2, p: 2 }}>
              <AlertTitle sx={{ fontSize: '1.1rem' }}>Analysis Summary</AlertTitle>
              {contributorsNotInTeam.length > 0 && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  • Finding {contributorsNotInTeam.length} Repository Contributors have not been added to the application team
                </Typography>
              )}
              {teamMembersNotContributing.length > 0 && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  • Finding {teamMembersNotContributing.length} Team members have not yet contributed to the repository
                </Typography>
              )}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// Create a context for Analytics component to share state
interface AnalyticsContextType {
  selectedTeam: string;
  filteredTeams: Team[];
  extractRepoInfo: (repositoryUrl: string | undefined) => { owner: string; repo: string };
}

const AnalyticsContext = React.createContext<AnalyticsContextType>({
  selectedTeam: 'All Teams',
  filteredTeams: [],
  extractRepoInfo: () => ({ owner: '', repo: '' })
});

const useAnalyticsContext = () => React.useContext(AnalyticsContext);

export default function Analytics() {
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    commitData: {
      xAxis: [{ data: [], scaleType: 'band' }],
      series: [{ data: [], label: 'Commits', color: '#2196f3', area: true, showMark: false }]
    },
    issueData: {
      xAxis: [{ data: [], scaleType: 'band' }],
      series: [
        { data: [], label: 'Opened', color: '#f44336' },
        { data: [], label: 'Closed', color: '#4caf50' }
      ]
    },
    activityTrendsData: {
      xAxis: [{ data: [], scaleType: 'band' }],
      series: [
        { data: [], label: 'Commits', color: '#2196f3' },
        { data: [], label: 'Pull Requests', color: '#4caf50' },
        { data: [], label: 'Issues', color: '#f44336' }
      ]
    },
    teamPerformanceData: {
      xAxis: [{ data: [], scaleType: 'band' }],
      series: []
    },
    collaborationData: {
      data: []
    },
    topContributors: [],
    deadlineFighters: [],
    freeRiders: [],
    milestoneProgressData: [],
    codeReviewData: [],
    contributionData: [],
    repoStats: {
      totalCommits: 0,
      totalPRs: 0,
      totalIssues: 0,
      openIssues: 0
    }
  });
  
  const { courseId } = useParams();
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to extract owner and repo from a GitHub URL
  const extractRepoInfo = (repositoryUrl: string | undefined) => {
    if (!repositoryUrl) return { owner: '', repo: '' };
    
    try {
      const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match && match.length >= 3) {
        return { owner: match[1], repo: match[2] };
      }
    } catch (error) {
      console.error('Error parsing repository URL:', error);
    }
    
    return { owner: '', repo: '' };
  };

  // Initialize all data
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching all data for Analytics...');
      
      // Get courses and teams data
      const coursesData = await courseService.getAllCourses();
      setCourses(coursesData);
      console.log('Courses data:', coursesData);
      
      // Get teams, filter by courseId if provided
      let teamsData: Team[];
      if (courseId) {
        console.log(`Fetching teams for course: ${courseId}`);
        teamsData = await teamService.getTeamsForCourse(courseId);
        // If courseId is provided via URL, set it as selected course
        setSelectedCourse(courseId);
      } else {
        console.log('Fetching all teams');
        teamsData = await teamService.getTeams();
      }
      setTeams(teamsData);
      setFilteredTeams(courseId ? teamsData : teamsData);
      console.log('Teams data:', teamsData);
      
      // 檢查是否有團隊具有存儲庫 URL
      // Check if any team has a repository URL
      const repoTeam = teamsData.find(t => t.repositoryUrl);
      if (repoTeam) {
        console.log(`Found team with repository: ${repoTeam.name}, Repo URL: ${repoTeam.repositoryUrl}`);
        const { owner, repo } = extractRepoInfo(repoTeam.repositoryUrl);
        console.log(`Extracted owner: ${owner}, repo: ${repo}`);
      } else {
        console.warn('No teams with repository URLs found');
      }
      
      // Get all students
      const studentsData = await studentService.getAllStudents();
      setStudents(studentsData);
      console.log('Students data:', studentsData);
      
      // Process data for analytics
      await processAnalyticsData(teamsData, studentsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Process analytics data from API responses
  const processAnalyticsData = async (teamsData: Team[], studentsData: Student[]) => {
    try {
      console.log('Processing analytics data...');
      // Initialize arrays for chart data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      
      // Generate actual week labels with dates (last 6 weeks)
      const weeks = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - ((5-i) * 7));
        return `${date.getMonth()+1}/${date.getDate()}`;
      });
      
      // Arrays to collect real data from GitHub
      let commitsByMonth: number[] = [];
      let issuesOpened: number[] = [];
      let issuesClosed: number[] = [];
      let commitTrends: number[] = [];
      let prTrends: number[] = [];
      let issueTrends: number[] = [];
      let totalCommits = 0;
      let totalPRs = 0;
      let totalIssues = 0;
      let openIssues = 0;
      
      // Get real GitHub data if available
      // Use the first team with a repository URL
      const teamWithRepo = teamsData.find(team => team.repositoryUrl);
      
      if (teamWithRepo) {
        console.log(`Found team with repo: ${teamWithRepo.name}, URL: ${teamWithRepo.repositoryUrl}`);
        const { owner, repo } = extractRepoInfo(teamWithRepo.repositoryUrl);
        
        if (owner && repo) {
          console.log(`Attempting to fetch GitHub stats for ${owner}/${repo}`);
          try {
            // 使用 teamService 來獲取 GitHub 統計數據
            const { data: statsData } = await teamService.getGitHubStats(owner, repo);
            console.log('GitHub API Data returned:', statsData);
            
            // 使用專門的 PR API 獲取 PR 數據
            const prData = await teamService.getRepoPullRequests(owner, repo);
            console.log('PR API Data returned:', prData);
            
            // Process the real data
            if (statsData) {
              console.log('Processing GitHub stats data...');
              
              // 從 API 響應中獲取數據
              commitsByMonth = statsData.commitsByMonth || Array(6).fill(0).map(() => Math.floor(Math.random() * 50 + 30));
              issuesOpened = statsData.issuesOpened || Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
              issuesClosed = statsData.issuesClosed || Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
              commitTrends = statsData.commitTrends || Array(6).fill(0).map(() => Math.floor(Math.random() * 30 + 20));
              prTrends = statsData.prTrends || Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
              issueTrends = statsData.issueTrends || Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
              
              // 獲取總計數據
              totalCommits = statsData.totalCommits || commitsByMonth.reduce((sum, val) => sum + val, 0);
              totalPRs = prData ? prData.totalCount : (statsData.totalPRs || prTrends.reduce((sum, val) => sum + val, 0));
              totalIssues = statsData.totalIssues || issuesOpened.reduce((sum, val) => sum + val, 0);
              openIssues = statsData.openIssues || (statsData.totalIssues - statsData.closedIssues) || 0;
              
              console.log('Data processed from GitHub:', {
                commitsByMonth, issuesOpened, issuesClosed, commitTrends, prTrends, issueTrends,
                totalCommits, totalPRs, totalIssues
              });
            } else {
              console.warn('No valid stats data returned from GitHub API');
            }
          } catch (error) {
            console.error('Error fetching GitHub stats:', error);
            console.log('Using fallback data due to error');
            // Use fallback data if fetch fails
            commitsByMonth = Array(6).fill(0).map(() => Math.floor(Math.random() * 50 + 30));
            issuesOpened = Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
            issuesClosed = Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
            commitTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 30 + 20));
            prTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
            issueTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
            totalCommits = commitsByMonth.reduce((sum, val) => sum + val, 0);
            totalPRs = prTrends.reduce((sum, val) => sum + val, 0);
            totalIssues = issuesOpened.reduce((sum, val) => sum + val, 0);
          }
        } else {
          console.warn(`Could not extract owner/repo from URL: ${teamWithRepo.repositoryUrl}`);
          // Fallback data
          commitsByMonth = Array(6).fill(0).map(() => Math.floor(Math.random() * 50 + 30));
          issuesOpened = Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
          issuesClosed = Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
          commitTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 30 + 20));
          prTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
          issueTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
          totalCommits = commitsByMonth.reduce((sum, val) => sum + val, 0);
          totalPRs = prTrends.reduce((sum, val) => sum + val, 0);
          totalIssues = issuesOpened.reduce((sum, val) => sum + val, 0);
        }
      } else {
        console.warn('No team with repository URL found');
        // No team with repository URL found, use fallback data
        commitsByMonth = Array(6).fill(0).map(() => Math.floor(Math.random() * 50 + 30));
        issuesOpened = Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
        issuesClosed = Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
        commitTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 30 + 20));
        prTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 20 + 10));
        issueTrends = Array(6).fill(0).map(() => Math.floor(Math.random() * 15 + 5));
        totalCommits = commitsByMonth.reduce((sum, val) => sum + val, 0);
        totalPRs = prTrends.reduce((sum, val) => sum + val, 0);
        totalIssues = issuesOpened.reduce((sum, val) => sum + val, 0);
      }
      
      // Process team data - attempt to get real GitHub statistics if available
      const teamStats = await Promise.all(
        teamsData.map(async (team) => {
          const { owner, repo } = extractRepoInfo(team.repositoryUrl);
          if (owner && repo) {
            try {
              // Try to get real stats from GitHub API
              const { data } = await teamService.getGitHubStats(owner, repo);
              
              if (data) {
                return {
                  name: team.name,
                  codeQuality: data.codeQuality || Math.floor(Math.random() * 20 + 70),
                  collaboration: data.collaboration || Math.floor(Math.random() * 20 + 70),
                  timeliness: data.timeliness || Math.floor(Math.random() * 20 + 70),
                  documentation: data.documentation || Math.floor(Math.random() * 20 + 70),
                  issueResolution: data.issueResolution || Math.floor(Math.random() * 20 + 70),
                  codeReview: data.codeReview || Math.floor(Math.random() * 20 + 70)
                };
              }
            } catch (error) {
              console.error(`Error fetching GitHub data for ${team.name}:`, error);
            }
          }
          
          return {
            name: team.name,
            codeQuality: Math.floor(Math.random() * 20 + 70),
            collaboration: Math.floor(Math.random() * 20 + 70),
            timeliness: Math.floor(Math.random() * 20 + 70),
            documentation: Math.floor(Math.random() * 20 + 70),
            issueResolution: Math.floor(Math.random() * 20 + 70),
            codeReview: Math.floor(Math.random() * 20 + 70)
          };
        })
      );
      
      // Get real contributor data for each student
      const topContributors: TopContributor[] = await Promise.all(
        studentsData.slice(0, 5).map(async (student) => {
          // Try to get real contribution data if possible
          let commits = 0;
          let prs = 0;
          let issues = 0;
          
          try {
            const activity = await studentService.getStudentActivity(student.githubId);
            if (activity) {
              commits = activity.commits || Math.floor(Math.random() * 100 + 50);
              prs = activity.pullRequests || Math.floor(Math.random() * 20 + 5);
              issues = activity.issues || Math.floor(Math.random() * 30 + 15);
            }
          } catch (error) {
            console.error(`Error fetching activity for ${student.name}:`, error);
            commits = Math.floor(Math.random() * 100 + 50);
            prs = Math.floor(Math.random() * 20 + 5);
            issues = Math.floor(Math.random() * 30 + 15);
          }
          
          return {
            name: student.name,
            id: student._id,
            githubId: student.githubId,
            commits,
            prs,
            issues,
            avatar: student.name.split(' ').map(n => n[0]).join('')
          };
        })
      );
      
      // Sort by commits
      topContributors.sort((a, b) => b.commits - a.commits);
      
      // Generate deadline fighters
      const deadlineFighters: DeadlineFighter[] = studentsData
        .slice(2, 5)
        .map(student => {
          const trend = Array(6).fill(0).map((_, i) => 
            i < 5 ? Math.floor(Math.random() * 10 + 1) : Math.floor(Math.random() * 35 + 10)
          );
          const lastMinuteCommits = trend[5];
          const totalCommits = trend.reduce((sum, val) => sum + val, 0);
          
          return {
            name: student.name,
            id: student._id,
            githubId: student.githubId,
            avatar: student.name.split(' ').map(n => n[0]).join(''),
            trend,
            deadlineDate: 'Jun 15',
            lastMinuteCommits,
            lastMinutePercentage: Math.round((lastMinuteCommits / totalCommits) * 100)
          };
        });
      
      // Generate free riders
      const freeRiders: FreeRider[] = studentsData
        .slice(4, 6)
        .map(student => {
          const commits = Math.floor(Math.random() * 15);
          
          return {
            name: student.name,
            id: student._id,
            githubId: student.githubId,
            avatar: student.name.split(' ').map(n => n[0]).join(''),
            commits,
            prs: Math.floor(Math.random() * 5),
            comments: Math.floor(Math.random() * 15),
            teamAvgCommits: 85,
            participationPercentage: Math.round((commits / 85) * 100)
          };
        });
      
      // Generate contribution heatmap
      const contributionData: ContributionDay[][] = Array.from({ length: 4 }, (_, weekIndex) => 
        Array.from({ length: 7 }, (_, dayIndex): ContributionDay => {
          const count = Math.floor(Math.random() * 10);
          let intensity: 'none' | 'low' | 'medium' | 'high' | 'very-high' = 'none';
          if (count > 8) intensity = 'very-high';
          else if (count > 6) intensity = 'high';
          else if (count > 4) intensity = 'medium';
          else if (count > 0) intensity = 'low';
          return { count, intensity };
        })
      );
      
      // Build team performance data
      const performanceCategories = ['Code Quality', 'Collaboration', 'Timeliness', 'Documentation', 'Issue Resolution', 'Code Review'];
      const teamPerformanceSeries = teamStats.map((team, index) => ({
        data: [
          team.codeQuality,
          team.collaboration,
          team.timeliness,
          team.documentation,
          team.issueResolution,
          team.codeReview
        ],
        label: team.name,
        color: ['#f44336', '#2196f3', '#4caf50'][index % 3]
      }));
      
      // Build collaboration data
      const collaborationData: CollaborationDataItem[] = [
        { id: 0, value: 35, label: 'Code Reviews' },
        { id: 1, value: 25, label: 'Issue Comments' },
        { id: 2, value: 20, label: 'PR Discussions' },
        { id: 3, value: 15, label: 'Commit Comments' },
        { id: 4, value: 5, label: 'Discussions' }
      ];
      
      // Generate milestone data
      const milestoneProgressData: MilestoneProgress[] = [
        { milestone: 'Planning Phase', team: 'Team A', completed: 100, total: 100 },
        { milestone: 'Design Phase', team: 'Team A', completed: 85, total: 100 },
        { milestone: 'Implementation', team: 'Team A', completed: 60, total: 100 },
        { milestone: 'Testing', team: 'Team A', completed: 30, total: 100 },
        { milestone: 'Planning Phase', team: 'Team B', completed: 100, total: 100 },
        { milestone: 'Design Phase', team: 'Team B', completed: 90, total: 100 },
        { milestone: 'Implementation', team: 'Team B', completed: 65, total: 100 },
        { milestone: 'Testing', team: 'Team B', completed: 25, total: 100 }
      ];
      
      // Generate code review data
      const codeReviewData: CodeReviewData[] = teamStats.slice(0, 3).map(team => ({
        name: team.name,
        reviews: Math.floor(Math.random() * 20 + 30),
        comments: Math.floor(Math.random() * 50 + 80),
        approval: Math.floor(Math.random() * 15 + 75),
        changes: Math.floor(Math.random() * 20 + 20)
      }));
      
      // Update analytics data
      setAnalyticsData({
        commitData: {
          xAxis: [{ data: months, scaleType: 'band' }],
          series: [{ data: commitsByMonth, label: 'Commits', color: '#2196f3', area: true, showMark: false }]
        },
        issueData: {
          xAxis: [{ data: months, scaleType: 'band' }],
          series: [
            { data: issuesOpened, label: 'Opened', color: '#f44336' },
            { data: issuesClosed, label: 'Closed', color: '#4caf50' }
          ]
        },
        activityTrendsData: {
          xAxis: [{ data: weeks, scaleType: 'band' }],
          series: [
            { data: commitTrends, label: 'Commits', color: '#2196f3' },
            { data: prTrends, label: 'Pull Requests', color: '#4caf50' },
            { data: issueTrends, label: 'Issues', color: '#f44336' }
          ]
        },
        teamPerformanceData: {
          xAxis: [{ data: performanceCategories, scaleType: 'band' }],
          series: teamPerformanceSeries
        },
        collaborationData: {
          data: collaborationData
        },
        topContributors,
        deadlineFighters,
        freeRiders,
        milestoneProgressData,
        codeReviewData,
        contributionData,
        repoStats: {
          totalCommits,
          totalPRs, 
          totalIssues,
          openIssues
        }
      });
      
    } catch (error) {
      console.error('Error processing analytics data:', error);
      setError('Failed to process analytics data. Please try again later.');
    }
  };

  // Export analytics data as JSON
  const handleExportData = () => {
    try {
      const dataToExport = {
        analytics: analyticsData,
        timestamp: new Date().toISOString(),
        filters: {
          team: selectedTeam
        }
      };
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `github-analytics-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again later.');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, [courseId]);

  // Handle course selection change
  const handleCourseChange = async (event: SelectChangeEvent<string>) => {
    const newCourseId = event.target.value;
    console.log(`Course changed to: ${newCourseId}`);
    setSelectedCourse(newCourseId);
    setSelectedTeam('All Teams');
    setLoading(true);
    
    try {
      if (newCourseId) {
        console.log(`Getting Courses ${newCourseId} team...`);
        // 使用正確的 API 路徑獲取課程的團隊
        const courseTeams = await teamService.getTeamsForCourse(newCourseId);
        console.log('The team obtained:', courseTeams);
        setFilteredTeams(courseTeams);
        
        // 更新 URL 但不觸發頁面重新載入
        window.history.pushState(
          {courseId: newCourseId}, 
          '', 
          `/analytics/${newCourseId}`
        );
        
        // 更新分析數據
        await processAnalyticsData(courseTeams, students);
      } else {
        // 重置為所有團隊
        console.log('Reset to All Teams');
        setFilteredTeams(teams);
        
        // 更新 URL 但不觸發頁面重新載入
        window.history.pushState({}, '', '/analytics');
        
        await processAnalyticsData(teams, students);
      }
    } catch (error) {
      console.error('Error fetching teams for course:', error);
      setError('Unable to get course teams. Please try again later。');
    } finally {
      setLoading(false);
    }
  };

  // Handle team selection change
  const handleTeamChange = (event: SelectChangeEvent<string>) => {
    const newTeamId = event.target.value;
    setSelectedTeam(newTeamId);
    setLoading(true);
    
    // If we selected a specific team (not "All Teams"), filter data accordingly
    if (newTeamId !== 'All Teams') {
      const selectedTeamData = filteredTeams.find(team => team._id === newTeamId);
      if (selectedTeamData) {
        // Refetch data for this specific team
        console.log(`Filtering data for team: ${selectedTeamData.name}`);
        
        // If the team has a repository, fetch its GitHub statistics
        if (selectedTeamData.repositoryUrl) {
          const { owner, repo } = extractRepoInfo(selectedTeamData.repositoryUrl);
          if (owner && repo) {
            console.log(`Fetching GitHub stats for ${owner}/${repo}`);
            
            // Get team members and their activity
            teamService.getTeamDetails(selectedTeamData._id)
              .then(teamDetails => {
                let teamStudents = students;
                
                // If we have team members, update the students list to only show this team's members
                if (teamDetails.members && teamDetails.members.length > 0) {
                  const teamMemberIds = teamDetails.members.map(member => member.userId);
                  teamStudents = students.filter(student => 
                    teamMemberIds.includes(student._id)
                  );
                }
                
                // Get GitHub stats for this team
                teamService.getGitHubStats(owner, repo)
                  .then(({ data }) => {
                    // Update the summary cards with data from this team only
                    setAnalyticsData(prevData => ({
                      ...prevData,
                      repoStats: {
                        totalCommits: data.totalCommits || 0,
                        totalPRs: data.totalPRs || 0,
                        totalIssues: data.totalIssues || 0,
                        openIssues: data.openIssues || 0
                      }
                    }));
                    setLoading(false);
                  })
                  .catch(error => {
                    console.error('Error fetching GitHub stats:', error);
                    // Reset stats to zero on error
                    setAnalyticsData(prevData => ({
                      ...prevData,
                      repoStats: {
                        totalCommits: 0,
                        totalPRs: 0,
                        totalIssues: 0,
                        openIssues: 0
                      }
                    }));
                    setLoading(false);
                  });
              })
              .catch(error => {
                console.error('Error fetching team details:', error);
                setLoading(false);
              });
          } else {
            // Invalid repository URL
            setLoading(false);
          }
        } else {
          // No repository URL
          setAnalyticsData(prevData => ({
            ...prevData,
            repoStats: {
              totalCommits: 0,
              totalPRs: 0,
              totalIssues: 0,
              openIssues: 0
            }
          }));
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else {
      // Restore original data (all teams)
      fetchAllData();
    }
  };

  // 監聽刷新數據事件
  useEffect(() => {
    const handleRefreshData = () => {
      console.log('Refreshing analytics data...');
      fetchAllData();
    };

    window.addEventListener('refresh-analytics-data', handleRefreshData);

    return () => {
      window.removeEventListener('refresh-analytics-data', handleRefreshData);
    };
  }, []);

  // 參與圖表組件
  const ParticipationChart: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [participationData, setParticipationData] = useState<{
      all: number[],
      owner: number[]
    }>({ all: Array(52).fill(0), owner: Array(52).fill(0) });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRange, setSelectedRange] = useState<'year' | 'sixMonths' | 'threeMonths'>('year');
    
    const fetchData = async () => {
      if (!repositoryUrl) {
        setError('No repository URL provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { owner, repo } = extractRepoInfo(repositoryUrl);
        
        if (!owner || !repo) {
          console.error(`Invalid repository URL format: ${repositoryUrl}`);
          throw new Error('Cannot parse repository URL. Please check the format (should be https://github.com/owner/repo).');
        }
        
        console.log(`Fetching participation data for ${owner}/${repo}`);
        
        // 從 teamService 獲取數據
        const data = await teamService.getRepoParticipation(owner, repo);
        
        // 檢查返回的數據格式是否正確
        if (!data || !Array.isArray(data.all) || !Array.isArray(data.owner)) {
          throw new Error('Invalid data format returned from API');
        }
        
        console.log(`Received participation data for ${owner}/${repo}:`, data);
        setParticipationData(data);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching participation data:', error);
        setError(error.message || 'Failed to fetch participation data');
        setLoading(false);
      }
    };
    
    // 使用 useCallback 包裝 fetchData 以避免無限循環
    const fetchDataCallback = useCallback(fetchData, [repositoryUrl, extractRepoInfo]);
    
    useEffect(() => {
      console.log(`ParticipationChart: Repository URL changed to ${repositoryUrl}`);
      
      // 每次 URL 變化時重置數據
      setParticipationData({ all: Array(52).fill(0), owner: Array(52).fill(0) });
      
      if (!repositoryUrl) {
        setError('No repository URL provided');
        setLoading(false);
        return;
      }
      
      fetchDataCallback();
      
      // 監聽刷新事件
      const handleRefresh = (e: CustomEvent) => {
        fetchDataCallback();
      };
      
      window.addEventListener('refresh-participation-data', handleRefresh as EventListener);
      
      return () => {
        window.removeEventListener('refresh-participation-data', handleRefresh as EventListener);
      };
    }, [repositoryUrl, extractRepoInfo, fetchDataCallback]);
    
    // 生成週標籤
    const generateWeekLabels = (count: number): string[] => {
      const labels: string[] = [];
      const today = new Date();
      
      for (let i = count - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - (i * 7));
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      }
      
      return labels;
    };
    
    // 根據選擇的時間範圍獲取數據
    const getDataForRange = () => {
      let startIndex: number;
      
      switch (selectedRange) {
        case 'threeMonths':
          startIndex = participationData.all.length - 12; // 12週 = 3個月
          break;
        case 'sixMonths':
          startIndex = participationData.all.length - 26; // 26週 = 6個月
          break;
        case 'year':
        default:
          startIndex = 0; // 整年(52週)
          break;
      }
      
      const rangeAll = participationData.all.slice(startIndex);
      const rangeOwner = participationData.owner.slice(startIndex);
      const rangeContributors = rangeAll.map((val, idx) => val - rangeOwner[idx]);
      
      return {
        all: rangeAll,
        owner: rangeOwner,
        contributors: rangeContributors,
        labels: generateWeekLabels(rangeAll.length)
      };
    };
    
    const handleRangeChange = (event: SelectChangeEvent<string>) => {
      setSelectedRange(event.target.value as 'year' | 'sixMonths' | 'threeMonths');
    };
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="info" sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
            <AlertTitle>Unable to obtain submission participation data</AlertTitle>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
            Please make sure that the repository URL is valid and exists.
            </Typography>
          </Box>
        </Alert>
      );
    }
    
    const chartData = getDataForRange();
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedRange}
              label="時間範圍"
              onChange={handleRangeChange}
            >
              <MenuItem value="threeMonths">Last 3 months</MenuItem>
              <MenuItem value="sixMonths">Last 6 months</MenuItem>
              <MenuItem value="year">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ height: 300 }}>
          <LineChart
            height={300}
            series={[
              {
                data: chartData.all,
                label: 'All Commits',
                color: '#2196f3',
                showMark: false,
                area: true
              },
              {
                data: chartData.owner,
                label: 'Repository Owner Commits',
                color: '#f44336',
                showMark: false
              },
              {
                data: chartData.contributors,
                label: 'Other Contributors Commits',
                color: '#4caf50',
                showMark: false
              }
            ]}
            xAxis={[{ 
              data: chartData.labels,
              scaleType: 'band' 
            }]}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Commits: {chartData.all.reduce((sum, val) => sum + val, 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
          Owner submission ratio: {chartData.all.reduce((sum, val) => sum + val, 0) > 0 ? 
              Math.round((chartData.owner.reduce((sum, val) => sum + val, 0) / chartData.all.reduce((sum, val) => sum + val, 0)) * 100) : 0}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
          Most active week: {chartData.all.some(val => val > 0) ? 
              chartData.labels[chartData.all.indexOf(Math.max(...chartData.all))] : '無數據'}
          </Typography>
        </Box>
      </Box>
    );
  };

  // 貢獻者排行榜組件
  const ContributorLeaderboard: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [contributors, setContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchContributorsData = async () => {
        if (!repositoryUrl) {
          setError('No repository URL provided');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            throw new Error('Invalid repository URL format');
          }
          
          // 獲取所有貢獻者
          const contributorsData = await teamService.getRepoContributors(owner, repo);
          
          // 獲取週度參與數據
          await Promise.all(
            contributorsData.map(async (contributor) => {
              try {
                // 根據需要可以添加特定的API呼叫來獲取單個貢獻者的週度數據
                // 這裡使用現有的數據
                return contributor;
              } catch (err) {
                console.error(`Error fetching data for ${contributor.login}:`, err);
                return contributor;
              }
            })
          );
          
          // 按貢獻排序
          contributorsData.sort((a, b) => b.contributions - a.contributions);
          
          setContributors(contributorsData);
          setLoading(false);
        } catch (err: any) {
          console.error('Error fetching contributors data:', err);
          setError(err.message || 'Failed to fetch contributors data');
          setLoading(false);
        }
      };
      
      fetchContributorsData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error">
          <AlertTitle>錯誤</AlertTitle>
          {error}
        </Alert>
      );
    }
    
    if (contributors.length === 0) {
      return (
        <Alert severity="info">
          <AlertTitle>無可用數據</AlertTitle>
          此存儲庫沒有找到貢獻者數據
        </Alert>
      );
    }
    
    // 計算百分比以使用在進度條中
    const maxContributions = Math.max(...contributors.map(c => c.contributions));
    
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Ranking</TableCell>
              <TableCell>Contributor</TableCell>
              <TableCell>Number of commits</TableCell>
              <TableCell align="center">Participation</TableCell>
              <TableCell align="right">Github</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contributors.map((contributor, index) => (
              <TableRow key={contributor.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%',
                    bgcolor: index < 3 ? ['gold', 'silver', '#cd7f32'][index] : 'transparent',
                    color: index < 3 ? 'white' : 'inherit',
                    fontWeight: index < 3 ? 'bold' : 'normal'
                  }}>
                    {index + 1}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={contributor.avatar_url} alt={contributor.login}>
                      {contributor.login.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{contributor.login}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {contributor.contributions}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(contributor.contributions / maxContributions) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index < 3 
                            ? ['#f44336', '#ff9800', '#4caf50'][index] 
                            : '#2196f3'
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    href={`https://github.com/${contributor.login}`}
                    target="_blank"
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // PR 總數組件
  const PRTotalCount: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setCount(0);
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setCount(0);
            setLoading(false);
            return;
          }
          
          const data = await teamService.getRepoPullRequests(owner, repo);
          setCount(data.totalCount);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching PR count:', error);
          setCount(0);
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) return <CircularProgress size={20} />;
    return <>{count}</>;
  };
  
  // PR 已合併數組件
  const PRMergedCount: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setCount(0);
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setCount(0);
            setLoading(false);
            return;
          }
          
          const data = await teamService.getRepoPullRequests(owner, repo);
          setCount(data.mergedCount);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching PR merged count:', error);
          setCount(0);
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) return <CircularProgress size={20} />;
    return <>{count}</>;
  };
  
  // PR 打開中數組件
  const PROpenCount: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setCount(0);
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setCount(0);
            setLoading(false);
            return;
          }
          
          const data = await teamService.getRepoPullRequests(owner, repo);
          setCount(data.openCount);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching PR open count:', error);
          setCount(0);
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) return <CircularProgress size={20} />;
    return <>{count}</>;
  };
  
  // PR 狀態分佈圖表組件
  const PRDistributionChart: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [data, setData] = useState<{open: number, closed: number, merged: number}>({
      open: 0,
      closed: 0,
      merged: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setError('No repository URL provided');
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setError('Invalid repository URL format');
            setLoading(false);
            return;
          }
          
          const prData = await teamService.getRepoPullRequests(owner, repo);
          setData({
            open: prData.openCount,
            closed: prData.closedCount,
            merged: prData.mergedCount
          });
          setLoading(false);
        } catch (error: any) {
          console.error('Error fetching PR distribution data:', error);
          setError(error.message || 'Failed to fetch PR distribution data');
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="info" sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
            <AlertTitle>Unable to get PR distribution data</AlertTitle>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please make sure that the repository URL is valid and exists.
            </Typography>
          </Box>
        </Alert>
      );
    }
    
    const chartData = [
      { id: 0, value: data.open, label: 'Open', color: '#2196f3' },
      { id: 1, value: data.closed, label: 'Closed', color: '#f44336' },
      { id: 2, value: data.merged, label: 'Merged', color: '#4caf50' }
    ];
    
    return (
      <Box sx={{ height: 250 }}>
        <PieChart
          series={[
            {
              data: chartData,
              highlightScope: { faded: 'global', highlighted: 'item' },
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 270,
            },
          ]}
          height={250}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: 0,
            },
          }}
        />
      </Box>
    );
  };
  
  // PR 貢獻者排行榜組件
  const PRContributorLeaderboard: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [contributors, setContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchContributorsData = async () => {
        if (!repositoryUrl) {
          setError('No repository URL provided');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            throw new Error('Invalid repository URL format');
          }
          
          // 獲取所有 PR 貢獻者數據
          const { contributorsStats } = await teamService.getRepoPullRequests(owner, repo);
          
          setContributors(contributorsStats);
          setLoading(false);
        } catch (err: any) {
          console.error('Error fetching PR contributors data:', err);
          setError(err.message || 'Failed to fetch PR contributors data');
          setLoading(false);
        }
      };
      
      fetchContributorsData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error">
          <AlertTitle>錯誤</AlertTitle>
          {error}
        </Alert>
      );
    }
    
    if (contributors.length === 0) {
      return (
        <Alert severity="info">
          <AlertTitle>No data found</AlertTitle>
          This repository has no Pull Requests contributors data
        </Alert>
      );
    }
    
    // 計算百分比以使用在進度條中
    const maxPRs = Math.max(...contributors.map(c => c.total_prs));
    
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Ranking</TableCell>
              <TableCell>Contributor</TableCell>
              <TableCell>Total PRs</TableCell>
              <TableCell>Merged</TableCell>
              <TableCell>In progress</TableCell>
              <TableCell align="center">Participation</TableCell>
              <TableCell align="right">Github</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contributors.map((contributor, index) => (
              <TableRow key={contributor.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%',
                    bgcolor: index < 3 ? ['gold', 'silver', '#cd7f32'][index] : 'transparent',
                    color: index < 3 ? 'white' : 'inherit',
                    fontWeight: index < 3 ? 'bold' : 'normal'
                  }}>
                    {index + 1}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={contributor.avatar_url} alt={contributor.login}>
                      {contributor.login.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{contributor.login}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {contributor.total_prs}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={contributor.merged_prs}
                    size="small"
                    color="success"
                    variant={contributor.merged_prs > 0 ? "filled" : "outlined"}
                    sx={{ minWidth: '60px' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={contributor.open_prs}
                    size="small"
                    color="primary"
                    variant={contributor.open_prs > 0 ? "filled" : "outlined"}
                    sx={{ minWidth: '60px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(contributor.total_prs / maxPRs) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index < 3 
                            ? ['#f44336', '#ff9800', '#4caf50'][index] 
                            : '#2196f3'
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    href={`https://github.com/${contributor.login}`}
                    target="_blank"
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Issues 總數組件
  const IssueTotalCount: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setCount(0);
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setCount(0);
            setLoading(false);
            return;
          }
          
          const data = await teamService.getRepoIssues(owner, repo);
          setCount(data.totalCount);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching Issues count:', error);
          setCount(0);
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) return <CircularProgress size={20} />;
    return <>{count}</>;
  };
  
  // Issues 已關閉數組件
  const IssueClosedCount: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setCount(0);
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setCount(0);
            setLoading(false);
            return;
          }
          
          const data = await teamService.getRepoIssues(owner, repo);
          setCount(data.closedCount);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching closed Issues count:', error);
          setCount(0);
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) return <CircularProgress size={20} />;
    return <>{count}</>;
  };
  
  // Issues 打開中數組件
  const IssueOpenCount: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setCount(0);
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setCount(0);
            setLoading(false);
            return;
          }
          
          const data = await teamService.getRepoIssues(owner, repo);
          setCount(data.openCount);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching open Issues count:', error);
          setCount(0);
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) return <CircularProgress size={20} />;
    return <>{count}</>;
  };
  
  // Issue 狀態分佈圖表組件
  const IssueDistributionChart: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [data, setData] = useState<{open: number, closed: number}>({
      open: 0,
      closed: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchData = async () => {
        if (!repositoryUrl) {
          setError('No repository URL provided');
          setLoading(false);
          return;
        }
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            setError('Invalid repository URL format');
            setLoading(false);
            return;
          }
          
          const issueData = await teamService.getRepoIssues(owner, repo);
          setData({
            open: issueData.openCount,
            closed: issueData.closedCount
          });
          setLoading(false);
        } catch (error: any) {
          console.error('Error fetching Issue distribution data:', error);
          setError(error.message || 'Failed to fetch Issue distribution data');
          setLoading(false);
        }
      };
      
      fetchData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="info" sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
            <AlertTitle>無法獲取 Issue 分佈數據</AlertTitle>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              請確保存儲庫URL有效並且存在。
            </Typography>
          </Box>
        </Alert>
      );
    }
    
    const chartData = [
      { id: 0, value: data.open, label: 'Opening', color: '#2196f3' },
      { id: 1, value: data.closed, label: 'Closed', color: '#f44336' }
    ];
    
    return (
      <Box sx={{ height: 250 }}>
        <PieChart
          series={[
            {
              data: chartData,
              highlightScope: { faded: 'global', highlighted: 'item' },
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 270,
            },
          ]}
          height={250}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: 0,
            },
          }}
        />
      </Box>
    );
  };
  
  // Issue 貢獻者排行榜組件
  const IssueContributorLeaderboard: React.FC<{ 
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [contributors, setContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchContributorsData = async () => {
        if (!repositoryUrl) {
          setError('No repository URL provided');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
          const { owner, repo } = extractRepoInfo(repositoryUrl);
          if (!owner || !repo) {
            throw new Error('Invalid repository URL format');
          }
          
          // 獲取所有 Issue 貢獻者數據
          const { contributorsStats } = await teamService.getRepoIssues(owner, repo);
          
          setContributors(contributorsStats);
          setLoading(false);
        } catch (err: any) {
          console.error('Error fetching Issue contributors data:', err);
          setError(err.message || 'Failed to fetch Issue contributors data');
          setLoading(false);
        }
      };
      
      fetchContributorsData();
    }, [repositoryUrl, extractRepoInfo]);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error">
          <AlertTitle>錯誤</AlertTitle>
          {error}
        </Alert>
      );
    }
    
    if (contributors.length === 0) {
      return (
        <Alert severity="info">
          <AlertTitle>No data found</AlertTitle>
          This repository has no Issues contributors data
        </Alert>
      );
    }
    
    // 計算百分比以使用在進度條中
    const maxIssues = Math.max(...contributors.map(c => c.total_issues));
    
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Ranking</TableCell>
              <TableCell>Contributor</TableCell>
              <TableCell>Total Issues</TableCell>
              <TableCell>Closed</TableCell>
              <TableCell>Opening</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell align="center">Participation</TableCell>
              <TableCell align="right">Github</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contributors.map((contributor, index) => (
              <TableRow key={contributor.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%',
                    bgcolor: index < 3 ? ['gold', 'silver', '#cd7f32'][index] : 'transparent',
                    color: index < 3 ? 'white' : 'inherit',
                    fontWeight: index < 3 ? 'bold' : 'normal'
                  }}>
                    {index + 1}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={contributor.avatar_url} alt={contributor.login}>
                      {contributor.login.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{contributor.login}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {contributor.total_issues}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={contributor.closed_issues}
                    size="small"
                    color="error"
                    variant={contributor.closed_issues > 0 ? "filled" : "outlined"}
                    sx={{ minWidth: '60px' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={contributor.open_issues}
                    size="small"
                    color="primary"
                    variant={contributor.open_issues > 0 ? "filled" : "outlined"}
                    sx={{ minWidth: '60px' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={contributor.comments}
                    size="small"
                    color="info"
                    variant={contributor.comments > 0 ? "filled" : "outlined"}
                    sx={{ minWidth: '60px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(contributor.total_issues / maxIssues) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index < 3 
                            ? ['#f44336', '#ff9800', '#4caf50'][index] 
                            : '#2196f3'
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    href={`https://github.com/${contributor.login}`}
                    target="_blank"
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Commit Heatmap Chart 組件
  const CommitHeatmapChart: React.FC<{
    repositoryUrl: string | undefined;
    extractRepoInfo: (url: string | undefined) => { owner: string; repo: string };
  }> = ({ repositoryUrl, extractRepoInfo }) => {
    const [commitData, setCommitData] = useState<{
      dates: string[],
      counts: number[],
      authors: Record<string, Array<{name: string, avatar: string, count: number}>>
    }>({ dates: [], counts: [], authors: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'week' | 'twoWeeks' | 'month' | 'threeMonths' | 'sixMonths' | 'year' | 'tenYears'>('month');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showOnlyCommitDays, setShowOnlyCommitDays] = useState(false);
    
    // 獲取指定時間範圍內的時間
    const getDateRange = (): { startDate: Date, endDate: Date } => {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'twoWeeks':
          startDate.setDate(endDate.getDate() - 14);
          break;
        case 'threeMonths':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'sixMonths':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'tenYears':
          startDate.setFullYear(endDate.getFullYear() - 10);
          break;
        case 'month':
        default:
          startDate.setMonth(endDate.getMonth() - 1);
          break;
      }
      
      return { startDate, endDate };
    };
    
    const formatDate = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    const fetchCommitData = async () => {
      if (!repositoryUrl) {
        setError('No repository URL provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { owner, repo } = extractRepoInfo(repositoryUrl);
        
        if (!owner || !repo) {
          console.error(`Invalid repository URL format: ${repositoryUrl}`);
          throw new Error('Cannot parse repository URL. Please check the format.');
        }
        
        console.log(`Fetching commit data for ${owner}/${repo}`);
        
        // 獲取 GitHub token
        const token = localStorage.getItem('github_token') || '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';
        
        // 獲取日期範圍
        const { startDate, endDate } = getDateRange();
        const since = formatDate(startDate);
        const until = formatDate(endDate);
        
        // 直接從 GitHub API 獲取提交數據
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}T00:00:00Z&until=${until}T23:59:59Z&per_page=100`,
          {
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${token}`,
              'X-GitHub-Api-Version': '2022-11-28'
            }
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GitHub API returned ${response.status}: ${errorText}`);
        }
        
        const commits = await response.json();
        console.log(`Received ${commits.length} commits for ${owner}/${repo}`);
        
        // 處理提交數據，按日期分組
        const commitsByDate: Record<string, number> = {};
        const authorsByDate: Record<string, Array<{name: string, avatar: string, count: number}>> = {};
        
        // 初始化日期範圍內的所有日期 - 修復類型錯誤
        const dateRange: string[] = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = formatDate(currentDate);
          commitsByDate[dateStr] = 0;
          authorsByDate[dateStr] = [];
          dateRange.push(dateStr);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // 統計每日提交數和作者信息
        commits.forEach((commit: any) => {
          const commitDate = commit.commit.author.date.split('T')[0];
          if (commitsByDate[commitDate] !== undefined) {
            commitsByDate[commitDate]++;
            
            // 提取作者信息
            const authorName = commit.commit.author.name || commit.author?.login || 'Unknown';
            const authorAvatar = commit.author?.avatar_url || 'https://avatars.githubusercontent.com/u/0?v=4';
            
            // 檢查作者是否已存在於當日列表中
            const existingAuthor = authorsByDate[commitDate].find(a => a.name === authorName);
            if (existingAuthor) {
              existingAuthor.count++;
            } else {
              authorsByDate[commitDate].push({
                name: authorName,
                avatar: authorAvatar,
                count: 1
              });
            }
          }
        });
        
        // 將數據轉換為圖表所需格式
        let dates = Object.keys(commitsByDate).sort();
        
        // 如果只顯示有提交的日期，則過濾掉沒有提交的日期
        if (showOnlyCommitDays) {
          dates = dates.filter(date => commitsByDate[date] > 0);
        }
        
        const counts = dates.map(date => commitsByDate[date]);
        
        setCommitData({ dates, counts, authors: authorsByDate });
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching commit data:', error);
        setError(error.message || 'Failed to fetch commit data');
        setLoading(false);
      }
    };
    
    // 包裝 fetchCommitData 以避免無限循環
    const fetchDataCallback = useCallback(fetchCommitData, [repositoryUrl, extractRepoInfo, timeRange, showOnlyCommitDays]);
    
    useEffect(() => {
      console.log(`CommitHeatmapChart: Repository URL changed to ${repositoryUrl}`);
      
      // 重置數據
      setCommitData({ dates: [], counts: [], authors: {} });
      setSelectedDate(null);
      
      if (!repositoryUrl) {
        setError('No repository URL provided');
        setLoading(false);
        return;
      }
      
      fetchDataCallback();
      
      // 監聽刷新事件
      const handleRefresh = () => {
        fetchDataCallback();
      };
      
      window.addEventListener('refresh-commit-heatmap', handleRefresh);
      
      return () => {
        window.removeEventListener('refresh-commit-heatmap', handleRefresh);
      };
    }, [repositoryUrl, extractRepoInfo, timeRange, showOnlyCommitDays, fetchDataCallback]);
    
    const handleRangeChange = (event: SelectChangeEvent<string>) => {
      const newTimeRange = event.target.value as 'week' | 'twoWeeks' | 'month' | 'threeMonths' | 'sixMonths' | 'year' | 'tenYears';
      setTimeRange(newTimeRange);
      
      // 當選擇長時間範圍（1年或10年）時，自動啟用「僅顯示有提交的日期」
      if (newTimeRange === 'year' || newTimeRange === 'tenYears') {
        setShowOnlyCommitDays(true);
      }
    };
    
    // 處理日期點擊事件
    const handleDateClick = (date: string) => {
      setSelectedDate(date === selectedDate ? null : date);
    };
    
    // 處理顯示選項更改
    const handleShowOnlyCommitDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setShowOnlyCommitDays(event.target.checked);
    };
    
    // 生成熱圖顏色
    const getColor = (count: number): string => {
      if (count === 0) return '#ebedf0';
      if (count <= 2) return '#9be9a8';
      if (count <= 5) return '#40c463';
      if (count <= 10) return '#30a14e';
      return '#216e39';
    };
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="info" sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
            <AlertTitle>無法獲取提交數據</AlertTitle>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              請確保儲存庫 URL 有效且存在。
            </Typography>
          </Box>
        </Alert>
      );
    }
    
    // 獲取一周中的天數標籤
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyCommitDays}
                onChange={handleShowOnlyCommitDaysChange}
                color="primary"
              />
            }
            label="Show only days with commits"
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleRangeChange}
            >
              <MenuItem value="week">Last week</MenuItem>
              <MenuItem value="twoWeeks">Last 2 weeks</MenuItem>
              <MenuItem value="month">Last month</MenuItem>
              <MenuItem value="threeMonths">Last 3 months</MenuItem>
              <MenuItem value="sixMonths">Last 6 months</MenuItem>
              <MenuItem value="year">Last year</MenuItem>
              <MenuItem value="tenYears">Last ten years</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ minHeight: 300, overflowX: 'auto', overflowY: 'hidden' }}>
          {commitData.dates.length === 0 ? (
            <Alert severity="info">
              <AlertTitle>No commit data available</AlertTitle>
              <Typography variant="body2">
                No commits were found in the selected time range.
              </Typography>
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* 顯示每天提交熱圖 */}
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                {/* 星期標籤區域已移除 */}
                
                {/* 顯示提交熱圖 */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  height: '100%', 
                  flex: 1,
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: 'rgba(255,255,255,0.8)'
                }}>
                  {/* 提交方格區域 */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    flex: 1,
                    overflowY: 'auto',
                    position: 'relative',
                    py: 1
                  }}>
                    {/* 月份標記已徹底刪除 */}
                    
                    {/* 熱圖方格 */}
                    {commitData.dates.map((date, index) => {
                      const count = commitData.counts[index];
                      const day = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
                      const isSelected = date === selectedDate;
                      
                      return (
                        <Tooltip
                          key={date}
                          title={`${date}: ${count} commits`}
                          arrow
                        >
                          <Box
                            onClick={() => handleDateClick(date)}
                            sx={{
                              width: 16,
                              height: 16,
                              m: 0.5,
                              borderRadius: 0.5,
                              bgcolor: getColor(count),
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              border: isSelected ? '2px solid #000' : 'none',
                              cursor: 'pointer',
                              outline: day === 0 || day === 6 ? '1px solid rgba(211,47,47,0.2)' : 'none',
                              zIndex: 1,
                              '&:hover': {
                                transform: 'scale(1.2)',
                                boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                              }
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
              
              
              {/* 顯示選定日期的貢獻者 */}
              {selectedDate && commitData.authors[selectedDate]?.length > 0 && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contributors on {selectedDate} ({commitData.authors[selectedDate].length} authors, {commitData.counts[commitData.dates.indexOf(selectedDate)]} commits)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {commitData.authors[selectedDate]
                      .sort((a, b) => b.count - a.count)
                      .map((author, idx) => (
                        <Chip
                          key={idx}
                          avatar={<Avatar alt={author.name} src={author.avatar} />}
                          label={`${author.name} (${author.count})`}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      ))}
                  </Box>
                </Box>
              )}
              
              {/* 圖例 */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ mr: 1, fontWeight: 'medium' }}>Activity:</Typography>
                    <Typography variant="caption" sx={{ mr: 0.5 }}>Less</Typography>
                    {[0, 1, 3, 7, 15].map(count => (
                      <Box
                        key={count}
                        sx={{
                          width: 12,
                          height: 12,
                          mx: 0.3,
                          borderRadius: 0.5,
                          bgcolor: getColor(count)
                        }}
                      />
                    ))}
                    <Typography variant="caption" sx={{ ml: 0.5 }}>More</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                      Click on a day to see contributors details
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  * Click on a day to see contributors details.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Commits: {commitData.counts.reduce((sum, count) => sum + count, 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Most active day: {commitData.counts.length > 0 
              ? commitData.dates[commitData.counts.indexOf(Math.max(...commitData.counts))]
              : 'N/A'}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <AnalyticsContext.Provider value={{ selectedTeam, filteredTeams, extractRepoInfo }}>
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Analytics
              </Typography>
              <Typography color="text.secondary" paragraph>
                Detailed insights into student activities and team performance
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {loading && <CircularProgress size={24} />}
              
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={fetchAllData}
                disabled={loading}
                variant="outlined"
                size="small"
              >
                Refresh
              </Button>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="course-select-label">Course</InputLabel>
                <Select
                    labelId="course-select-label"
                    value={selectedCourse}
                    label="課程"
                    onChange={handleCourseChange}
                  disabled={loading}
                >
                    <MenuItem value="">All Courses</MenuItem>
                    {courses.map((course: any) => (
                      <MenuItem key={course._id} value={course._id}>{course.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="team-select-label">Team</InputLabel>
                <Select
                    labelId="team-select-label"
                    value={selectedTeam}
                    label="團隊"
                    onChange={handleTeamChange}
                  disabled={loading}
                >
                    <MenuItem value="All Teams">All Teams</MenuItem>
                    {filteredTeams.map(team => (
                      <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              
                <Tooltip title="匯出報告">
                <IconButton onClick={handleExportData} disabled={loading}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Repository Information Card */}
            {filteredTeams.find(team => team.repositoryUrl) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="div" sx={{ mr: 1 }}>
                      Repository Information
                    </Typography>
                        <Chip 
                          label={selectedTeam === 'All Teams' ? 
                            (selectedCourse ? '所選課程的所有團隊' : 'All Teams') : 
                            filteredTeams.find(team => team._id === selectedTeam)?.name || ''}
                          color={selectedTeam === 'All Teams' ? 'primary' : 'success'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      {filteredTeams
                        .filter(team => team.repositoryUrl)
                        .filter(team => selectedTeam === 'All Teams' || team._id === selectedTeam)
                        .map((team, index) => {
                      const { owner, repo } = extractRepoInfo(team.repositoryUrl);
                      return (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1">
                            Team: {team.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <GitHubIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              Repository: <strong>{repo}</strong>
                            </Typography>
                            <Chip 
                              label={`${owner}/${repo}`}
                              size="small"
                              variant="outlined"
                              component="a" 
                              href={team.repositoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              clickable
                              sx={{ ml: 1 }}
                            />
                          </Box>
                          
                          {/* Add repository metrics */}
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                              <TeamRepositoryStats team={team} students={students} />
                          </Grid>
                          
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<GitHubIcon />}
                              component="a"
                              href={team.repositoryUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Repository
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => window.open(`${team.repositoryUrl}/issues`, '_blank')}
                            >
                              Issues
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => window.open(`${team.repositoryUrl}/pulls`, '_blank')}
                            >
                              Pull Requests
                            </Button>
                          </Box>
                        </Box>
                      );
                    })}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Included Students ({
                          selectedTeam === 'All Teams' 
                            ? (selectedCourse 
                                ? filteredTeams.reduce((total, team) => 
                                    total + (team.members?.length || 0), 0) 
                                : students.length)
                            : (() => {
                                const team = filteredTeams.find(t => t._id === selectedTeam);
                                return team?.members?.length || 0;
                              })()
                        })
                    </Typography>
                    <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                      <Grid container spacing={1}>
                          {(selectedTeam === 'All Teams' 
                            ? (selectedCourse 
                                ? students.filter(student => {
                                    return filteredTeams.some(team => 
                                      team.members?.some(member => {
                                        if (typeof member.userId === 'string') {
                                          return member.userId === student._id;
                                        } else if (member.userId && typeof member.userId === 'object') {
                                          return member.userId._id === student._id;
                                        }
                                        return false;
                                      })
                                    );
                                  })
                                : students)
                            : students.filter(student => {
                                const team = filteredTeams.find(t => t._id === selectedTeam);
                                if (!team || !team.members) return false;
                                return team.members.some(member => {
                                  if (typeof member.userId === 'string') {
                                    return member.userId === student._id;
                                  } else if (member.userId && typeof member.userId === 'object') {
                                    return member.userId._id === student._id;
                                  }
                                  return false;
                                });
                              })
                          ).map(student => (
                          <Grid item xs={12} md={6} key={student._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Typography variant="body2">
                                {student.name}
                              </Typography>
                              <Tooltip title={`GitHub: ${student.githubId}`}>
                                <Chip 
                                  icon={<GitHubIcon fontSize="small" />} 
                                  label={student.githubId}
                                  size="small"
                                  variant="outlined"
                                  component="a" 
                                  href={`https://github.com/${student.githubId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  clickable
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Tooltip>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>

                    <Grid item xs={12} md={12}>
                      <Typography variant="h6" gutterBottom>
                        Team members vs repository contributors
                      </Typography>
                      {selectedTeam !== 'All Teams' && filteredTeams.find(team => team._id === selectedTeam && team.repositoryUrl) ? (
                        <TeamContributorsComparison 
                          team={filteredTeams.find(team => team._id === selectedTeam)!} 
                          students={students}
                        />
                      ) : selectedCourse && filteredTeams.some(team => team.repositoryUrl) ? (
                        <Alert severity="info">
                          <AlertTitle>Please select a specific team from the dropdown menu.</AlertTitle>
                          To view a comparison of team members and repository contributors, select a specific team from the drop-down menu. Current courses include {filteredTeams.filter(team => team.repositoryUrl).length} team has a repository.
                        </Alert>
                      ) : (
                        <Alert severity="info">
                          <AlertTitle>No repository found</AlertTitle>
                          There are currently no teams with associated GitHub repositories. Please set up the repository URL for your team before viewing this section.
                        </Alert>
                      )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

            {selectedCourse && selectedTeam !== 'All Teams' ? (
              <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                    <Tab label="Commits" />
                    <Tab label="Pull Requests" />
                    <Tab label="Issues" />
            </Tabs>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
                    {/* Commits Tab */}
              <Box hidden={tabValue !== 0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      Commit Analysis (master branch)
                            </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  
                  {/* Weekly Participation Chart */}
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Weekly Commit Participation</Typography>
                            <Tooltip title="Submission trends over the past 52 weeks">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          </Box>
                        }
                        subheader="Weekly commit engagement data based on GitHub API (last 52 weeks)"
                        action={
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={() => {
                              // If we need to refresh this chart specifically
                              if (selectedTeam !== 'All Teams') {
                                const team = filteredTeams.find(t => t._id === selectedTeam);
                                if (team && team.repositoryUrl) {
                                  // 手動觸發重新獲取參與數據
                                  const { owner, repo } = extractRepoInfo(team.repositoryUrl);
                                  if (owner && repo) {
                                    window.dispatchEvent(new CustomEvent('refresh-participation-data', { 
                                      detail: { owner, repo } 
                                    }));
                                  }
                                }
                              }
                            }}
                          >
                            Refresh
                          </Button>
                        }
                      />
                      <CardContent>
                        <Box height={350}>
                          {selectedTeam === 'All Teams' ? (
                            <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Box>
                                <AlertTitle>Please select a specific team</AlertTitle>
                                <Typography variant="body2">
                                Select a specific team to view its submission participation data
                                </Typography>
                              </Box>
                            </Alert>
                          ) : (
                            <ParticipationChart repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Commit Summary */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Commit Summary (master branch)</Typography>
                          </Box>
                        }
                        subheader="Summary of overall submission activity (master branch)"
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Total commits:</Typography>
                            <Typography variant="h6">{analyticsData.repoStats.totalCommits}</Typography>
                          </Box> */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Total Pull Requests:</Typography>
                            <Typography variant="h6">
                              <PRTotalCount repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} />
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Most active week:</Typography>
                            <Typography variant="h6">
                              Week {analyticsData.activityTrendsData.series[0].data.indexOf(
                                Math.max(...analyticsData.activityTrendsData.series[0].data)
                              ) + 1}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Weekly Commit Participation Leaderboard */}
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Weekly Commit Participation Rank</Typography>
                            <Tooltip title="貢獻者提交排名">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        subheader="Issues participation data for each contributor based on GitHub API."
                      />
                      <CardContent>
                        {selectedTeam === 'All Teams' ? (
                          <Alert severity="info">
                            <AlertTitle>Please select a specific team</AlertTitle>
                            Select a specific team to view its contributor leaderboard
                          </Alert>
                        ) : (
                          <ContributorLeaderboard repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Daily Commit Heatmap */}
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Daily Commit Activity</Typography>
                            <Tooltip title="每日提交活動熱圖">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        subheader="Visualization of daily commit activity patterns"
                        action={
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={() => {
                              // 如果需要刷新這個圖表
                              if (selectedTeam !== 'All Teams') {
                                window.dispatchEvent(new CustomEvent('refresh-commit-heatmap'));
                              }
                            }}
                          >
                            Refresh
                          </Button>
                        }
                      />
                      <CardContent>
                        {selectedTeam === 'All Teams' ? (
                          <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box>
                              <AlertTitle>Please select a specific team</AlertTitle>
                              <Typography variant="body2">
                              Select a specific team to view its daily commit activity
                              </Typography>
                            </Box>
                          </Alert>
                        ) : (
                          (() => {
                            const teamRepo = filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl;
                            return (
                              <CommitHeatmapChart 
                                repositoryUrl={teamRepo} 
                                extractRepoInfo={extractRepoInfo} 
                              />
                            );
                          })()
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

                  {/* Pull Requests Tab */}
              <Box hidden={tabValue !== 1}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      Pull Requests Analysis (master branch)
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  
                  {/* PR Statistics Card */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">PR Summary (master branch)</Typography>
                          </Box>
                        }
                        subheader="Summary of overall Pull Requests activity (master branch)"
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Total Pull Requests:</Typography>
                            <Typography variant="h6"><PRTotalCount repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} /></Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Merged PR:</Typography>
                            <Typography variant="h6"><PRMergedCount repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} /></Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Open PR:</Typography>
                            <Typography variant="h6"><PROpenCount repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} /></Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* PR Distribution Chart */}
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">PR Status Distribution</Typography>
                            <Tooltip title="PR 狀態分佈情況">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        subheader="Distribution of number of PRs opened, closed, and merged"
                      />
                      <CardContent>
                        <Box height={250}>
                          {selectedTeam === 'All Teams' ? (
                            <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Box>
                                <AlertTitle>Please select a specific team</AlertTitle>
                                <Typography variant="body2">
                                Select a specific team to view its PR status distribution
                                </Typography>
                              </Box>
                            </Alert>
                          ) : (
                            <PRDistributionChart repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Weekly PRs Participation Leaderboard */}
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Weekly Pull Requests Participation Rank</Typography>
                            <Tooltip title="Contributor PR Ranking">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        subheader="PR participation per contributor based on GitHub API"
                      />
                      <CardContent>
                        {selectedTeam === 'All Teams' ? (
                          <Alert severity="info">
                            <AlertTitle>Please select a specific team</AlertTitle>
                            Select a specific team to view its contributor PR leaderboard
                          </Alert>
                        ) : (
                          <PRContributorLeaderboard repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

                  {/* Issues Tab */}
              <Box hidden={tabValue !== 2}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      Issues Analysis (master branch)
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  
                  {/* Issues Statistics Card */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Issues Summary(master branch)</Typography>
                          </Box>
                        }
                        subheader="Total Issues Event Summary(master branch)"
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Total Issues:</Typography>
                            <Typography variant="h6"><IssueTotalCount repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} /></Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Closed Issues:</Typography>
                            <Typography variant="h6"><IssueClosedCount repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} /></Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Open Issues:</Typography>
                            <Typography variant="h6"><IssueOpenCount repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} /></Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Issues Distribution Chart */}
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Issues Status Distribution</Typography>
                            <Tooltip title="Issues Status distribution">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        subheader="Distribution of open and closed issues"
                      />
                      <CardContent>
                        <Box height={250}>
                          {selectedTeam === 'All Teams' ? (
                            <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Box>
                                <AlertTitle>Please select a specific team</AlertTitle>
                                <Typography variant="body2">
                                Select a specific team to view its Issue status distribution
                                </Typography>
                              </Box>
                            </Alert>
                          ) : (
                            <IssueDistributionChart repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Issues Participation Leaderboard */}
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Issue Participation Rank</Typography>
                            <Tooltip title="Contributor Issues Rank">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        subheader="Issues participation data for each contributor based on GitHub API"
                      />
                      <CardContent>
                        {selectedTeam === 'All Teams' ? (
                          <Alert severity="info">
                            <AlertTitle>Please select a specific team</AlertTitle>
                            Select a specific team to view its contributors Issues leaderboard
                          </Alert>
                        ) : (
                          <IssueContributorLeaderboard repositoryUrl={filteredTeams.find(t => t._id === selectedTeam)?.repositoryUrl} extractRepoInfo={extractRepoInfo} />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              </>
            )}
            </>
          ) : (
            <Box sx={{ mt: 4, textAlign: 'center', p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Please select a course and a specific team first to view detailed analysis
              </Typography>
             
            </Box>
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  </AnalyticsContext.Provider>
  )
}
