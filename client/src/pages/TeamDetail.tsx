import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ListItemIcon
} from '@mui/material'
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  MergeType as MergeTypeIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon
} from '@mui/icons-material'
import { LineChart, PieChart } from '@mui/x-charts'
import Sidebar from '../components/Sidebar'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { teamService, courseService } from '../services/api'
import ErrorPage from './ErrorPage'
import { getGithubAvatarUrl } from '../utils/github'
import { TeamDetails } from '../types/team'
import { formatLastActive } from '../utils/dateFormat'

// Available Student
interface AvailableStudent {
  _id: string;
  name: string;
  email: string;
  githubId: string;
}

export default function TeamDetail() {
  const { id } = useParams()
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courseName, setCourseName] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'7days' | '14days' | 'all'>('7days')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [changeLeaderDialogOpen, setChangeLeaderDialogOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newLeaderId, setNewLeaderId] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      setLoading(true);
      try {
        if (!id) {
          throw new Error('Team ID is required');
        }
        const data = await teamService.getTeamDetails(id);
        console.log('Team details data:', data);
        setTeam(data);
        setError(null);
        
        // Check if course ID exists
        if (data?.course) {
          // If course is an object and has a name property, use it directly
          if (typeof data.course === 'object' && data.course.name) {
            setCourseName(data.course.name);
          } 
          // Otherwise, use course ID to get course details
          else {
            const courseId = typeof data.course === 'object' ? data.course._id : data.course;
            try {
              const courseData = await courseService.getCourseById(courseId);
              setCourseName(courseData.name);
            } catch (courseErr) {
              console.error('Error fetching course details:', courseErr);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching team details:', err);
        setError(err.message || 'Failed to load team details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const activityData = useMemo(() => {
    if (!team?.analytics?.commitActivity) return [];
    
    // Copy array and reverse to make time from left to right
    let filteredActivity = [...team.analytics.commitActivity];
    
    // Filter data based on selected time range
    if (timeRange === '7days') {
      filteredActivity = filteredActivity.slice(0, 7);
    } else if (timeRange === '14days') {
      filteredActivity = filteredActivity.slice(0, 14);
    }
    
    // Reverse array to make time from left to right
    return filteredActivity.reverse().map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      commits: item.count
    }));
  }, [team, timeRange]);

  const contributionData = useMemo(() => {
    if (!team?.memberStats) return []
    
    return team.memberStats.map(member => ({
      id: member.userId._id,
      label: member.userId.name,
      value: member.contribution.commits,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }))
  }, [team])

  const getMailtoLink = () => {
    if (!team || !team.memberStats) return '#'
    
    const emails = team.memberStats
      .map(member => member.userId.email)
      .join(',')
    return `mailto:${emails}?subject=Regarding ${team.name}&body=Hello team,`
  }

  const handleExportData = () => {
    if (!team) return
    
    const data = {
      teamName: team.name,
      repository: team.repositoryUrl,
      members: team.memberStats.map(member => ({
        name: member.userId.name,
        email: member.userId.email,
        role: member.role,
        commits: member.contribution.commits,
        additions: member.contribution.additions,
        deletions: member.contribution.deletions,
        lastActive: member.contribution.lastCommit
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${team.name.toLowerCase()}-stats.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    if (!team) return;
    
    // Prepare CSV headers
    const headers = ['Name', 'Email', 'Role', 'Commits', 'PRs', 'Last Active'];
    
    // Prepare data rows
    const rows = team.memberStats.map(member => [
      member.userId.name,
      member.userId.email,
      member.role,
      member.contribution.commits,
      member.contribution.prs || 0,
      member.contribution.lastCommit ? new Date(member.contribution.lastCommit).toLocaleDateString() : 'N/A'
    ]);
    
    // Add total row for team
    rows.push([
      'TOTAL',
      '',
      '',
      team.analytics?.totalCommits || 0,
      team.analytics?.totalPRs || 0,
      ''
    ]);
    
    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        // Handle fields with commas, wrap them in quotes
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${team.name.replace(/[^\w\s]/gi, '')}_team_stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    
    // Check if confirm text matches team name
    if (deleteConfirmText !== team.name) {
      setDeleteError('Team name does not match');
      return;
    }
    
    try {
      // Call API to delete team
      await teamService.deleteTeam(team._id);
      // Redirect to team list page
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting team:', error);
      setDeleteError('Failed to delete team');
    }
  };

  // Calculate percentage change compared to last week
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Add stats data calculation in useMemo
  const statsData = useMemo(() => {
    if (!team?.analytics) {
      return {
        commits: { total: 0, change: 0 },
        issues: { total: 0, change: 0 },
        prs: { total: 0, change: 0 },
        reviews: { total: 0, change: 0 }
      };
    }

    // Get commits for this week and last week
    const commitActivity = team.analytics.commitActivity || [];
    const thisWeekCommits = commitActivity.slice(0, 7).reduce((sum, day) => sum + day.count, 0);
    const lastWeekCommits = commitActivity.slice(7, 14).reduce((sum, day) => sum + day.count, 0);
    
    return {
      commits: { 
        total: team.analytics.totalCommits || 0, 
        change: calculatePercentChange(thisWeekCommits, lastWeekCommits)
      },
      issues: { 
        total: team.analytics.issues || 0, 
        // change: calculatePercentChange(team.analytics.issues, Math.max(1, team.analytics.issues * 0.9))
      },
      prs: { 
        total: team.analytics.totalPRs || 0, 
        // change: calculatePercentChange(team.analytics.totalPRs, Math.max(1, team.analytics.totalPRs * 0.85))
      },
      reviews: { 
        total: team.analytics.reviews || 0, 
        // change: calculatePercentChange(team.analytics.reviews, Math.max(1, team.analytics.reviews * 0.8))
      }
    };
  }, [team]);

  // Modify recentActivity data calculation
  const recentActivity = useMemo(() => {
    if (!team?.recentActivity || !team?.memberStats) return [];
    
    // Create mapping from GitHub ID to team member
    const memberMap = new Map();
    team.memberStats.forEach(member => {
      if (member.userId.githubId) {
        memberMap.set(member.userId.githubId.toLowerCase(), {
          id: member.userId._id,
          name: member.userId.name,
          email: member.userId.email,
          avatar: getGithubAvatarUrl(member.userId.githubId)
        });
      }
      // Use email as backup matching method
      if (member.userId.email) {
        memberMap.set(member.userId.email.toLowerCase(), {
          id: member.userId._id,
          name: member.userId.name,
          email: member.userId.email,
          avatar: getGithubAvatarUrl(member.userId.githubId)
        });
      }
    });
    
    // Process recent activity data, match team members
    return team.recentActivity.map(activity => {
      // Try matching team member by GitHub ID or email
      const githubId = activity.author.githubId?.toLowerCase();
      const email = activity.author.email?.toLowerCase();
      
      // Find matching team member
      const teamMember = 
        (githubId && memberMap.get(githubId)) || 
        (email && memberMap.get(email)) ||
        null;
      
      return {
        type: 'commit',
        id: activity.id,
        user: teamMember ? teamMember.name : activity.author.name,
        githubId: activity.author.githubId,
        date: new Date(activity.author.date),
        message: activity.message,
        url: activity.url,
        avatar: teamMember ? teamMember.avatar : (activity.author.avatar || getGithubAvatarUrl(activity.author.githubId || ''))
      };
    });
  }, [team]);

  // Replace teamProgress function
  const teamProgress = useMemo(() => {
    if (!team || !team.analytics) return {
      issues: { total: 0, change: 0 },
      prs: { total: 0, change: 0 },
      reviews: { total: 0, change: 0 }
    };

    // Safely get values
    const issuesValue = team.analytics?.issues ?? 0;
    const prsValue = team.analytics?.totalPRs ?? 0;
    const reviewsValue = team.analytics?.reviews ?? 0;

    // Safe calculation of percentage change
    const safeCalculateChange = (current: number, previous: number): number => {
      if (previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      issues: { 
        total: issuesValue, 
        change: safeCalculateChange(issuesValue, Math.max(1, issuesValue * 0.9))
      },
      prs: { 
        total: prsValue, 
        change: safeCalculateChange(prsValue, Math.max(1, prsValue * 0.85))
      },
      reviews: { 
        total: reviewsValue, 
        change: safeCalculateChange(reviewsValue, Math.max(1, reviewsValue * 0.8))
      }
    };
  }, [team]);

  // Add team member contribution data calculation
  const memberContributions = useMemo(() => {
    if (!team?.memberStats) return {
      commits: [],
      prs: []
    };
    
    // Calculate contribution percentage for each member
    const totalCommits = team.memberStats.reduce((sum, member) => sum + member.contribution.commits, 0);
    const totalPRs = team.memberStats.reduce((sum, member) => sum + (member.contribution.prs || 0), 0);
    
    // Assign a color to each member
    const memberColors = {};
    team.memberStats.forEach((member, index) => {
      memberColors[member.userId._id] = `hsl(${(index * 360) / team.memberStats.length}, 70%, 50%)`;
    });

    // Calculate contribution percentage for each member
    const commitContributions = team.memberStats
      .filter(member => member.contribution.commits > 0)
      .map(member => ({
        id: member.userId._id,
        name: member.userId.name,
        value: member.contribution.commits,
        percentage: totalCommits ? Math.round((member.contribution.commits / totalCommits) * 100) : 0,
        color: memberColors[member.userId._id]
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    const prContributions = team.memberStats
      .filter(member => (member.contribution.prs || 0) > 0)
      .map(member => ({
        id: member.userId._id,
        name: member.userId.name,
        value: member.contribution.prs || 0,
        percentage: totalPRs ? Math.round(((member.contribution.prs || 0) / totalPRs) * 100) : 0,
        color: memberColors[member.userId._id]
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    return {
      commits: commitContributions,
      prs: prContributions
    };
  }, [team]);

  const fetchAvailableStudents = async () => {
    try {
      if (!id) {
        throw new Error('Team ID is required');
      }
      const students = await teamService.getAvailableStudents(id);
      setAvailableStudents(students);
      setActionError('');
    } catch (error: any) {
      console.error('Error fetching available students:', error);
      setActionError('Failed to load available students');
    }
  };

  const handleAddMember = async () => {
    if (!selectedStudentId || !team) return;
    
    try {
      setActionError('');
      
      // Call API to add member
      await teamService.addTeamMember(team._id, selectedStudentId);
      
      // Show success message
      setActionSuccess('Member added successfully');
      
      // Close dialog and reload team data
      setAddMemberDialogOpen(false);
      setSelectedStudentId('');
      
      // Reload team data
      const updatedTeam = await teamService.getTeamDetails(team._id);
      setTeam(updatedTeam);
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding team member:', error);
      setActionError('Failed to add member');
    }
  };

  const handleChangeLeader = async () => {
    if (!newLeaderId || !team) return;
    
    try {
      setActionError('');
      
      // Call API to change team leader
      await teamService.changeTeamLeader(team._id, newLeaderId);
      
      // Show success message
      setActionSuccess('Team leader changed successfully');
      
      // Close dialog and reload team data
      setChangeLeaderDialogOpen(false);
      setNewLeaderId('');
      
      // Reload team data
      const updatedTeam = await teamService.getTeamDetails(team._id);
      setTeam(updatedTeam);
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (error) {
      console.error('Error changing team leader:', error);
      setActionError('Failed to change team leader');
    }
  };

  // Remove member function
  const handleRemoveMember = async (memberId: string) => {
    try {
      if (!id) {
        throw new Error('Team ID is required');
      }
      
      await teamService.removeTeamMember(id, memberId);
      
      // Reload team data
      const updatedTeam = await teamService.getTeamDetails(id);
      setTeam(updatedTeam);
      
      setActionSuccess('Member removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (error: any) {
      console.error('Error removing team member:', error);
      setActionError(error.message || 'Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Team not found
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'grey.100' }}>
        {/* Header */}
        <Paper sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" component="h1" sx={{ mr: 2 }}>
                {team.name}
              </Typography>
              <Chip
                label={team.exists !== false ? 'Active' : 'Repository Not Found'}
                color={team.exists !== false ? 'success' : 'error'}
                size="small"
              />
            </Box>
            <Typography color="text.secondary" gutterBottom>
              {/*Get Course Name from backend using api */}
              Course : {courseName}
            </Typography>
            <Typography color="text.secondary">
              Repository: <Link href={team.repositoryUrl} target="_blank" underline="hover">
                {team.repositoryUrl}
              </Link>
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ px: 4, py: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                color="inherit"
                href="/"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Home
              </Link>
              <Link color="inherit" href="/teams">
                Teams
              </Link>
              <Typography color="text.primary">Team Alpha</Typography>
            </Breadcrumbs>
          </Box>
        </Paper>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <CodeIcon />
                  </Avatar>
                  <Typography variant="h6">Total Commits</Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {statsData.commits.total}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={`${statsData.commits.change > 0 ? '+' : ''}${statsData.commits.change}%`}
                    color={statsData.commits.change >= 0 ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    vs last week
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <BugReportIcon />
                  </Avatar>
                  <Typography variant="h6">Issues Closed</Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {statsData.issues.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* <Chip 
                    label={`${statsData.issues.change > 0 ? '+' : ''}${statsData.issues.change}%`}
                    color={statsData.issues.change >= 0 ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    vs last week
                  </Typography> */}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <MergeTypeIcon />
                  </Avatar>
                  <Typography variant="h6">Pull Requests</Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {statsData.prs.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* <Chip 
                    label={`${statsData.prs.change > 0 ? '+' : ''}${statsData.prs.change}%`}
                    color={statsData.prs.change >= 0 ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    vs last week
                  </Typography> */}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Typography variant="h6">Code Reviews</Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {statsData.reviews.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* <Chip 
                    label={`${statsData.reviews.change > 0 ? '+' : ''}${statsData.reviews.change}%`}
                    color={statsData.reviews.change >= 0 ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    vs last week
                  </Typography> */}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Activity Timeline</Typography>
                  <Box>
                    <Button 
                      variant={timeRange === '7days' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => setTimeRange('7days')}
                      sx={{ mr: 1 }}
                    >
                      Last 7 Days
                    </Button>
                    <Button 
                      variant={timeRange === '14days' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => setTimeRange('14days')}
                      sx={{ mr: 1 }}
                    >
                      Last 14 Days
                    </Button>
                    <Button 
                      variant={timeRange === 'all' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => setTimeRange('all')}
                    >
                      All
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ height: 280 }}>
                  {activityData.length > 0 ? (
                    <LineChart
                      series={[{ data: activityData.map(d => d.commits), label: 'Commits' }]}
                      xAxis={[{ 
                        scaleType: 'band', 
                        data: activityData.map(d => d.date),
                        tickLabelStyle: {
                          angle: 45,
                          textAnchor: 'start',
                          fontSize: 12
                        }
                      }]}
                      height={280}
                      margin={{ left: 40, right: 40, top: 20, bottom: 80 }}
                      slotProps={{
                        legend: {
                          direction: 'row',
                          position: { vertical: 'bottom', horizontal: 'middle' },
                          padding: { top: 40, bottom: 0 },
                          itemMarkWidth: 8,
                          itemMarkHeight: 8,
                          labelStyle: {
                            fontSize: 12
                          }
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <Typography color="text.secondary">No activity data available</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Member Contribution
                </Typography>
                <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {memberContributions.commits.length > 0 ? (
                    <PieChart
                      series={[
                        {
                          data: memberContributions.commits,
                          highlightScope: { faded: 'global', highlighted: 'item' },
                          faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          arcLabel: (item) => `${item.name}`
                        }
                      ]}
                      height={260}
                      margin={{ top: 10, bottom: 70, left: 10, right: 10 }}
                      slotProps={{
                        legend: {
                          direction: 'row',
                          position: { vertical: 'bottom', horizontal: 'middle' },
                          padding: { top: 60, bottom: 0 },
                          itemMarkWidth: 8,
                          itemMarkHeight: 8,
                          labelStyle: {
                            fontSize: 12
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography color="text.secondary">No contribution data available</Typography>
                  )}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contribution Legend
                  </Typography>
                  <Grid container spacing={1}>
                    {memberContributions.commits.map(member => (
                      <Grid item xs={6} key={member.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: member.color,
                              mr: 1 
                            }} 
                          />
                          <Typography variant="caption" noWrap>
                            {member.name}: {member.percentage}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Team Members Table */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Team Members</Typography>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={() => {
                    setActionError('');
                    setNewLeaderId('');
                    setChangeLeaderDialogOpen(true);
                  }}
                  sx={{ mr: 2 }}
                >
                  Change Leader
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => {
                    setActionError('');
                    setSelectedStudentId('');
                    fetchAvailableStudents();
                    setAddMemberDialogOpen(true);
                  }}
                >
                  Add Member
                </Button>
              </Box>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Commits</TableCell>
                  <TableCell>PRs</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {team?.memberStats && team.memberStats.map((member) => (
                  <TableRow key={member.userId._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ mr: 2 }} 
                          src={getGithubAvatarUrl(member.userId.githubId)}
                        />
                        <Box>
                          <Typography variant="body2">{member.userId.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.userId.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.role}</Typography>
                    </TableCell>
                    <TableCell>{member.contribution.commits}</TableCell>
                    <TableCell>{member.contribution.prs || 0}</TableCell>
                    <TableCell>{formatLastActive(member.contribution.lastCommit || '')}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.contribution.lastCommit ? 'Active' : 'Inactive'}
                        size="small"
                        color={member.contribution.lastCommit ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {member.role !== 'leader' && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveMember(member.userId._id)}
                          title="Remove member"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* Activity Feed and Progress */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {recentActivity.length > 0 ? (
                    <List>
                      {recentActivity.map((activity, index) => (
                        <React.Fragment key={activity.id || index}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar src={activity.avatar} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Link href={activity.url} target="_blank" underline="hover">
                                  {activity.user}
                                </Link>
                              }
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {activity.message}
                                  </Typography>
                                  <br />
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(activity.date).toLocaleString()}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <Typography color="text.secondary">No recent activity</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Team Progress
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Commits Distribution</Typography>
                    <Typography variant="body2">{team?.analytics?.totalCommits || 0} total</Typography>
                  </Box>
                  
                  {memberContributions.commits.length > 0 ? (
                    <>
                      <Box sx={{ height: 20, display: 'flex', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                        {memberContributions.commits.map(member => (
                          <Box 
                            key={member.id}
                            sx={{ 
                              height: '100%', 
                              width: `${member.percentage}%`, 
                              bgcolor: member.color,
                              minWidth: 5
                            }} 
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ mt: 1 }}>
                        {memberContributions.commits.map(member => (
                          <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: member.color,
                                mr: 1 
                              }} 
                            />
                            <Typography variant="caption" sx={{ mr: 1 }}>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.percentage}% ({member.value})
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No commit data available
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pull Requests Distribution</Typography>
                    <Typography variant="body2">{team?.analytics?.totalPRs || 0} total</Typography>
                  </Box>
                  
                  {memberContributions.prs.length > 0 ? (
                    <>
                      <Box sx={{ height: 20, display: 'flex', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                        {memberContributions.prs.map(member => (
                          <Box 
                            key={member.id}
                            sx={{ 
                              height: '100%', 
                              width: `${member.percentage}%`, 
                              bgcolor: member.color,
                              minWidth: 5
                            }} 
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ mt: 1 }}>
                        {memberContributions.prs.map(member => (
                          <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: member.color,
                                mr: 1 
                              }} 
                            />
                            <Typography variant="caption" sx={{ mr: 1 }}>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.percentage}% ({member.value})
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No PR data available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Export Data Button */}
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setDeleteConfirmText('');
                setDeleteError('');
                setDeleteDialogOpen(true);
              }}
            >
              Delete Team
            </Button>
            
            <Box>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportCSV}
                sx={{ mr: 2 }}
              >
                Export CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportData}
              >
                Export JSON
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-team-dialog-title"
      >
        <DialogTitle id="delete-team-dialog-title">
          Delete Team
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. This will permanently delete the team 
            <strong> {team?.name}</strong> and all associated data.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Please type <strong>{team?.name}</strong> to confirm.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            error={!!deleteError}
            helperText={deleteError}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteTeam} 
            color="error"
            disabled={deleteConfirmText !== team?.name}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {actionSuccess}
        </Alert>
      )}

      <Dialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        aria-labelledby="add-member-dialog-title"
      >
        <DialogTitle id="add-member-dialog-title">
          Add Team Member
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a student to add to the team.
          </DialogContentText>
          
          {actionError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {actionError}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="student-select-label">Student</InputLabel>
            <Select
              labelId="student-select-label"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              label="Student"
            >
              {availableStudents.map((student) => (
                <MenuItem key={student._id} value={student._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ mr: 2, width: 24, height: 24 }} 
                      src={getGithubAvatarUrl(student.githubId)}
                    />
                    <ListItemText 
                      primary={student.name} 
                      secondary={student.email} 
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/students" 
              color="primary"
              target="_blank"
            >
              Create New Student
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddMember} 
            color="primary"
            disabled={!selectedStudentId}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={changeLeaderDialogOpen}
        onClose={() => setChangeLeaderDialogOpen(false)}
        aria-labelledby="change-leader-dialog-title"
      >
        <DialogTitle id="change-leader-dialog-title">
          Change Team Leader
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a team member to be the new team leader.
          </DialogContentText>
          
          {actionError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {actionError}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="leader-select-label">New Leader</InputLabel>
            <Select
              labelId="leader-select-label"
              value={newLeaderId}
              onChange={(e) => setNewLeaderId(e.target.value)}
              label="New Leader"
            >
              {team?.memberStats
                .filter(member => member.role !== 'leader')
                .map((member) => (
                  <MenuItem key={member.userId._id} value={member.userId._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ mr: 2, width: 24, height: 24 }} 
                        src={getGithubAvatarUrl(member.userId.githubId)}
                      />
                      <ListItemText 
                        primary={member.userId.name} 
                        secondary={member.userId.email}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeLeaderDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleChangeLeader} 
            color="primary"
            disabled={!newLeaderId}
          >
            Change
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 