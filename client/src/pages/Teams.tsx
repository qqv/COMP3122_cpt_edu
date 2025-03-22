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
  Tooltip,
  Checkbox,
  FormControlLabel,
  TableContainer
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
  Email as EmailIcon,
  CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon
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

interface Team {
  _id: string;
  name: string;
  members: {
    userId: {
      name: string;
      githubId: string;
    };
    role: string;
  }[];
  repositoryUrl: string;
}

const getActivityColor = (index: number) => {
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336'] // 绿、蓝、橙、红
  return colors[index % colors.length]
}

// Add type definition
interface TeamLink {
  teamName: string;
  leaderEmail: string;
  inviteLink: string;
}

// Add course type definition
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedCourseForExport, setSelectedCourseForExport] = useState('');
  const [teamsForExport, setTeamsForExport] = useState<Team[]>([]);
  const [selectedTeamsForExport, setSelectedTeamsForExport] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Extract fetchTeams as a separate function
  const fetchTeams = async () => {
    try {
      const data = await teamService.getTeams()
      setTeams(data)
      setFilteredTeams(data) // Initialize filtered team list
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

  // Add search processing function
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredTeams(teams);
      return;
    }
    
    const filtered = teams.filter(team => 
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      (team.course?.name && team.course.name.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredTeams(filtered);
  };

  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => {
      // Sort by repository existence status first
      if (!a.exists && b.exists) return -1
      if (a.exists && !b.exists) return 1
      
      // If existence status is the same, sort by last activity time
      if (a.exists && b.exists) {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      }
      
      // If neither exists, sort by name
      return a.name.localeCompare(b.name)
    })
  }, [filteredTeams])

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
      
      // Refresh team list
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
      
      // Parse CSV data (assuming format: team name, leader email)
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
      
      // Batch create teams
      const results = await teamService.batchCreateTeams(teams, courseId);
      
      // Refresh team list
      fetchTeams();
      
      // Show created team links
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
        setLeaderSearchResults([]);
        return;
      }
      
      const response = await studentService.searchStudents(leaderSearchQuery);
      console.log('Search response:', response); // Debug log
      
      // Ensure we correctly access the returned data
      if (response && response.students) {
        setLeaderSearchResults(response.students);
      } else {
        setLeaderSearchResults([]);
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error searching for students:', error);
      setLeaderSearchResults([]);
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
      // If no email is found, display an error message
      setSnackbar({
        open: true,
        message: 'Could not find team leader email',
        severity: 'error'
      });
    }
  };

  // 打开导出对话框
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
    // 重置选择
    setSelectedCourseForExport('');
    setTeamsForExport([]);
    setSelectedTeamsForExport([]);
  };

  // 关闭导出对话框
  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
  };

  // 处理课程选择变化
  const handleExportCourseChange = async (courseId: string) => {
    setSelectedCourseForExport(courseId);
    setSelectedTeamsForExport([]);
    
    try {
      const data = await teamService.getTeams();
      if (data) {
        const courseTeams = data.filter(team => team.course?._id === courseId);
        setTeamsForExport(courseTeams);
      }
    } catch (error) {
      console.error('Failed to fetch teams for course:', error);
    }
  };

  // 处理团队选择变化
  const handleTeamSelectionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedTeamsForExport(event.target.value as string[]);
  };

  // 全选/取消全选
  const handleSelectAllTeams = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedTeamsForExport(teamsForExport.map(team => team._id));
    } else {
      setSelectedTeamsForExport([]);
    }
  };

  // 导出团队数据
  const handleExportTeams = async () => {
    if (selectedTeamsForExport.length === 0) return;
    
    setExportLoading(true);
    
    try {
      const data = await teamService.exportTeams(selectedTeamsForExport);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      
      // 将数据转换为 CSV 格式
      const csvContent = convertToCSV(data);
      
      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `teams_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      handleCloseExportDialog();
    } catch (error) {
      console.error('Failed to export teams:', error);
      // 可以添加错误提示
      setSnackbar({
        open: true,
        message: 'Failed to export teams data',
        severity: 'error'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // 将数据转换为 CSV 格式
  const convertToCSV = (data: any[]) => {
    // CSV 头部
    const header = 'Name,Team,Role,Commits,PRs,Team Commits,Issues,Pull Requests,Reviews,Last Active\n';
    
    // 将每一行数据转换为 CSV 格式
    const rows = data.map(row => {
      return `"${row.name}","${row.team}","${row.role}",${row.commits},${row.prs},${row.teamCommits},${row.issues},${row.pullRequests},${row.reviews},"${row.lastActive}"`;
    }).join('\n');
    
    return header + rows;
  };

  const handleOpenBatchDialog = () => {
    setBatchDialogOpen(true);
  };

  const handleCloseBatchDialog = () => {
    setBatchDialogOpen(false);
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5" component="h1" sx={{ mr: 2 }}>
                Teams
              </Typography>
              <TextField
                placeholder="Search teams..."
                size="small"
                value={searchQuery}
                onChange={handleSearch}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                      <SearchIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleOpenExportDialog}
                sx={{ mr: 2 }}
              >
                Bulk Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleOpenBatchDialog}
                sx={{ mr: 2 }}
              >
                Batch Operation
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Team
              </Button>
            </Box>
          </Box>

          {/* Teams Grid */}
          <Grid container spacing={3}>
            {sortedTeams.map(team => (
              <Grid item xs={12} sm={6} md={4} key={team._id}>
                <TeamCard 
                  team={team} 
                  onCopyInvite={handleCopyInviteLink}
                  onEmailLeader={() => handleEmailTeamLeader(team)}
                />
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Create a single team dialog */}
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
                    <List sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                      {leaderSearchResults.map((student) => (
                        <ListItem
                          key={student._id}
                          button
                          onClick={() => {
                            setSelectedLeader(student);
                            setNewTeamLeaderEmail(student.email);
                            setLeaderSearchQuery('');
                            setLeaderSearchResults([]);
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar src={getGithubAvatarUrl(student.githubId)} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={student.name}
                            secondary={student.email}
                            primaryTypographyProps={{ variant: 'body1', component: 'span' }}
                            secondaryTypographyProps={{ component: 'span' }}
                          />
                        </ListItem>
                      ))}
                    </List>
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

        {/* Batch create team dialog */}
        <Dialog 
          open={batchDialogOpen} 
          onClose={handleCloseBatchDialog}
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
            <Button onClick={handleCloseBatchDialog}>Cancel</Button>
            <Button onClick={handleBatchCreateTeams} variant="contained">Create Teams</Button>
          </DialogActions>
        </Dialog>

        {/* Show created team links */}
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
                          // Add a copy success prompt
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
                // Export to CSV
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

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog} maxWidth="md" fullWidth>
          <DialogTitle>Export Teams Data</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
              Select a course and teams to export data as CSV.
            </Typography>
            
            {/* Course Selection */}
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourseForExport}
                label="Course"
                onChange={(e) => handleExportCourseChange(e.target.value as string)}
              >
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Teams Selection */}
            {selectedCourseForExport && teamsForExport.length > 0 && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTeamsForExport.length === teamsForExport.length}
                      onChange={handleSelectAllTeams}
                      indeterminate={selectedTeamsForExport.length > 0 && selectedTeamsForExport.length < teamsForExport.length}
                    />
                  }
                  label="Select All Teams"
                />
                
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">Select</TableCell>
                        <TableCell>Team Name</TableCell>
                        <TableCell>Members</TableCell>
                        <TableCell>Repository</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teamsForExport.map((team) => (
                        <TableRow key={team._id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedTeamsForExport.includes(team._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTeamsForExport([...selectedTeamsForExport, team._id]);
                                } else {
                                  setSelectedTeamsForExport(selectedTeamsForExport.filter(id => id !== team._id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{team.name}</TableCell>
                          <TableCell>{team.members.length}</TableCell>
                          <TableCell>{team.repositoryUrl ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExportDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleExportTeams}
              disabled={selectedTeamsForExport.length === 0 || exportLoading}
              startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
            >
              {exportLoading ? 'Exporting...' : 'Export Selected Teams'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
} 