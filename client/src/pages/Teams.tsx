import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Divider,
  TextField,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  MergeType as MergeTypeIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Email as EmailIcon
} from '@mui/icons-material'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { teamService } from '../services/api'
import { formatLastActive } from '../utils/dateFormat'
import { getActivityStatus } from '../utils/activity'
import { TeamCard } from '../components/TeamCard'
import { courseService } from '../services/api'
import { studentService } from '../services/api'
import { getGithubAvatarUrl } from '../utils/github'

const getActivityColor = (index: number) => {
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336'] // 绿、蓝、橙、红
  return colors[index % colors.length]
}

// 添加类型定义
interface TeamLink {
  teamName: string;
  leaderEmail: string;
  inviteLink: string;
}

// 添加课程类型定义
interface Course {
  _id: string;
  name: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeaderEmail, setNewTeamLeaderEmail] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [createError, setCreateError] = useState('');
  const [batchTeamData, setBatchTeamData] = useState('');
  const [createdTeamLinks, setCreatedTeamLinks] = useState<TeamLink[]>([]);
  const [showCreatedLinks, setShowCreatedLinks] = useState(false);
  const [leaderSearchQuery, setLeaderSearchQuery] = useState('');
  const [leaderSearchResults, setLeaderSearchResults] = useState<any[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 将 fetchTeams 提取为独立函数
  const fetchTeams = async () => {
    try {
      const data = await teamService.getTeams()
      setTeams(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setCourseId(coursesData[0]._id);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    
    fetchCourses();
  }, []);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      // 首先按仓库存在状态排序
      if (!a.exists && b.exists) return -1
      if (a.exists && !b.exists) return 1
      
      // 如果存在状态相同，按最后活动时间排序
      if (a.exists && b.exists) {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      }
      
      // 如果都不存在，按名称排序
      return a.name.localeCompare(b.name)
    })
  }, [teams])

  const handleCreateTeam = async () => {
    try {
      if (!newTeamName.trim()) {
        setCreateError('Team name is required');
        return;
      }
      
      if (!newTeamLeaderEmail.trim()) {
        setCreateError('Team leader email is required');
        return;
      }
      
      if (!courseId) {
        setCreateError('Course is required');
        return;
      }
      
      const result = await teamService.createTeam({
        name: newTeamName.trim(),
        leaderEmail: newTeamLeaderEmail.trim(),
        courseId
      });
      
      // 刷新团队列表
      fetchTeams();
      
      // 显示创建的团队链接
      setCreatedTeamLinks([{
        teamName: newTeamName,
        leaderEmail: newTeamLeaderEmail,
        inviteLink: result.inviteLink
      }]);
      
      setShowCreatedLinks(true);
      setCreateDialogOpen(false);
      setNewTeamName('');
      setNewTeamLeaderEmail('');
      setCreateError('');
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create team');
    }
  };

  const handleBatchCreateTeams = async () => {
    try {
      if (!batchTeamData.trim()) {
        setCreateError('Team data is required');
        return;
      }
      
      if (!courseId) {
        setCreateError('Course is required');
        return;
      }
      
      // 解析CSV格式的数据（假设格式为：团队名称,负责人邮箱）
      const teams = batchTeamData
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
          const [name, leaderEmail] = line.split(',').map(item => item.trim());
          return { name, leaderEmail };
        });
      
      if (teams.length === 0) {
        setCreateError('No valid team data found');
        return;
      }
      
      // 批量创建团队
      const results = await teamService.batchCreateTeams(teams, courseId);
      
      // 刷新团队列表
      fetchTeams();
      
      // 显示创建的团队链接
      setCreatedTeamLinks(results);
      setShowCreatedLinks(true);
      setBatchDialogOpen(false);
      setBatchTeamData('');
      setCreateError('');
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create teams');
    }
  };

  const handleSearchLeader = async () => {
    try {
      if (!leaderSearchQuery.trim()) {
        setCreateError('Please enter a search query');
        return;
      }
      
      // 调用API搜索学生
      const results = await studentService.searchStudents(leaderSearchQuery);
      setLeaderSearchResults(results);
      setCreateError('');
    } catch (error: any) {
      setCreateError(error.message || 'Failed to search students');
    }
  };

  const handleSelectLeader = (student: any) => {
    setSelectedLeader(student);
    setNewTeamLeaderEmail(student.email);
    setLeaderSearchResults([]);
  };

  const handleCopyInviteLink = (inviteCode: string) => {
    const inviteLink = `${window.location.origin}/teams/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setSnackbar({
      open: true,
      message: 'Invite link copied to clipboard',
      severity: 'success'
    });
  };

  const handleEmailTeamLeader = (team: any) => {
    const leader = team.members.find((member: any) => member.role === 'leader');
    if (leader && leader.userId && leader.userId.email) {
      const subject = encodeURIComponent('Team Repository Setup');
      const body = encodeURIComponent(`Please set up your team repository for ${team.name}.`);
      window.location.href = `mailto:${leader.userId.email}?subject=${subject}&body=${body}`;
    } else {
      // 如果找不到邮箱，显示错误提示
      setSnackbar({
        open: true,
        message: 'Could not find team leader email',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'grey.100' }}>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Search and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Teams</Typography>
            <Box>
              <Button 
                variant="outlined" 
                onClick={() => setBatchDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Batch Create
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Team
              </Button>
            </Box>
          </Box>

          {/* Teams Grid */}
          <Grid container spacing={3}>
            {sortedTeams.map((team) => (
              <Grid item xs={12} md={6} lg={4} key={team._id}>
                <TeamCard 
                  team={team} 
                  onCopyInvite={handleCopyInviteLink}
                  onEmailLeader={() => handleEmailTeamLeader(team)}
                />
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* 创建单个团队对话框 */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Enter the team details below. An invitation link will be generated for the team leader.
            </DialogContentText>
            
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>
            )}
            
            <TextField
              label="Team Name"
              fullWidth
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              margin="normal"
              required
            />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Team Leader
              </Typography>
              
              {selectedLeader ? (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={getGithubAvatarUrl(selectedLeader.githubId)} 
                    sx={{ mr: 2 }}
                  />
                  <Box>
                    <Typography variant="body1">{selectedLeader.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedLeader.email}
                    </Typography>
                  </Box>
                  <IconButton 
                    sx={{ ml: 'auto' }} 
                    onClick={() => {
                      setSelectedLeader(null);
                      setNewTeamLeaderEmail('');
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ) : (
                <>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      label="Search by name or email"
                      fullWidth
                      value={leaderSearchQuery}
                      onChange={(e) => setLeaderSearchQuery(e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleSearchLeader}
                    >
                      Search
                    </Button>
                  </Box>
                  
                  <TextField
                    label="Or enter email directly"
                    fullWidth
                    value={newTeamLeaderEmail}
                    onChange={(e) => setNewTeamLeaderEmail(e.target.value)}
                    type="email"
                    helperText="If student doesn't exist, a placeholder account will be created"
                  />
                  
                  {leaderSearchResults.length > 0 && (
                    <Paper variant="outlined" sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                      <List dense>
                        {leaderSearchResults.map(student => (
                          <ListItem 
                            key={student._id}
                            button
                            onClick={() => handleSelectLeader(student)}
                          >
                            <ListItemAvatar>
                              <Avatar src={getGithubAvatarUrl(student.githubId)} />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={student.name}
                              secondary={student.email}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </>
              )}
            </Box>
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Course</InputLabel>
              <Select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                label="Course"
              >
                {courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* 批量创建团队对话框 */}
        <Dialog 
          open={batchDialogOpen} 
          onClose={() => setBatchDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Batch Create Teams</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Enter team data in CSV format: Team Name, Leader Email (one team per line)
            </DialogContentText>
            
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>
            )}
            
            <TextField
              label="Team Data"
              fullWidth
              multiline
              rows={10}
              value={batchTeamData}
              onChange={(e) => setBatchTeamData(e.target.value)}
              margin="normal"
              required
              placeholder="Team A, leader.a@example.com
Team B, leader.b@example.com
Team C, leader.c@example.com"
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Course</InputLabel>
              <Select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                label="Course"
              >
                {courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBatchCreateTeams} variant="contained">Create Teams</Button>
          </DialogActions>
        </Dialog>

        {/* 显示创建的团队链接 */}
        <Dialog 
          open={showCreatedLinks} 
          onClose={() => setShowCreatedLinks(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Team Invitation Links</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Share these links with team leaders to complete team setup:
            </DialogContentText>
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team Name</TableCell>
                  <TableCell>Leader Email</TableCell>
                  <TableCell>Invitation Link</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {createdTeamLinks.map((team, index) => (
                  <TableRow key={index}>
                    <TableCell>{team.teamName}</TableCell>
                    <TableCell>{team.leaderEmail}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {team.inviteLink}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => {
                          navigator.clipboard.writeText(team.inviteLink);
                          // 可以添加复制成功的提示
                        }}
                        title="Copy link"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreatedLinks(false)}>Close</Button>
            <Button 
              variant="contained"
              onClick={() => {
                // 导出为CSV
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Team Name,Leader Email,Invitation Link\n" +
                  createdTeamLinks.map(team => 
                    `"${team.teamName}","${team.leaderEmail}","${team.inviteLink}"`
                  ).join("\n");
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "team_invitations.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Export CSV
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
} 