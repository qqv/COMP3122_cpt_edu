import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LockReset as LockResetIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { userService, courseService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AlertColor } from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
// 添加类型定义
interface Course {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  courses: Course[];
  active: boolean;
}

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'tutor',
    password: '',
    courses: [],
    active: true
  });
  const [newPassword, setNewPassword] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  // 添加搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // 检查用户是否有权限访问此页面
  if (user?.role !== 'lecturer') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph>
            You do not have permission to access the user management page.
          </Typography>
          <Typography variant="body1">
            Please contact a lecturer if you need assistance with user management.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  // 获取用户和课程数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, coursesData] = await Promise.all([
          userService.getAllUsers(),
          courseService.getAllCourses()
        ]);
        setUsers(usersData);
        setFilteredUsers(usersData); // 初始化过滤后的用户列表
        setCourses(coursesData);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 添加搜索处理函数
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理多选课程变化
  const handleCourseChange = (e) => {
    setFormData({
      ...formData,
      courses: e.target.value
    });
  };

  // 处理活动状态变化
  const handleActiveChange = (e) => {
    setFormData({
      ...formData,
      active: e.target.checked
    });
  };

  // 打开创建用户对话框
  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      email: '',
      role: 'tutor',
      password: '',
      courses: [],
      active: true
    });
    setCreateDialogOpen(true);
  };

  // 打开编辑用户对话框
  const handleOpenEditDialog = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      courses: user.courses.map(course => course._id),
      active: user.active
    });
    setEditDialogOpen(true);
  };

  // 打开课程分配对话框
  const handleOpenCourseDialog = (user) => {
    setCurrentUser(user);
    setFormData({
      ...formData,
      courses: user.courses.map(course => course._id)
    });
    setCourseDialogOpen(true);
  };

  // 打开密码重置对话框
  const handleOpenResetPasswordDialog = (user) => {
    setCurrentUser(user);
    setNewPassword('');
    setResetPasswordDialogOpen(true);
  };

  // 创建新用户
  const handleCreateUser = async () => {
    try {
      await userService.createUser(formData);
      setCreateDialogOpen(false);
      
      // 刷新用户列表
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
      
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create user',
        severity: 'error'
      });
    }
  };

  // 更新用户
  const handleUpdateUser = async () => {
    try {
      if (!currentUser) return;
      
      await userService.updateUser(currentUser._id, formData);
      setEditDialogOpen(false);
      
      // 刷新用户列表
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
      
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update user',
        severity: 'error'
      });
    }
  };

  // 分配课程
  const handleAssignCourses = async () => {
    try {
      if (!currentUser) return;
      
      await userService.assignCourses(currentUser._id, formData.courses);
      setCourseDialogOpen(false);
      
      // 刷新用户列表
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
      
      setSnackbar({
        open: true,
        message: 'Courses assigned successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to assign courses',
        severity: 'error'
      });
    }
  };

  // 重置密码
  const handleResetPassword = async () => {
    try {
      if (!currentUser) return;
      
      if (!newPassword || newPassword.length < 8) {
        setSnackbar({
          open: true,
          message: 'Password must be at least 8 characters',
          severity: 'error'
        });
        return;
      }
      
      await userService.resetPassword(currentUser._id, newPassword);
      setResetPasswordDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: 'Password reset successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reset password',
        severity: 'error'
      });
    }
  };

  // 关闭提示框
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          bgcolor: 'grey.100'
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" component="h1" sx={{ mr: 2 }}>
                  User Management
                </Typography>
                <TextField
                  placeholder="Search users..."
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    role: 'tutor',
                    password: '',
                    courses: [],
                    active: true
                  });
                  setCreateDialogOpen(true);
                }}
              >
                Add User
              </Button>
            </Box>
          </Paper>
          <Paper sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Courses</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                            color={
                              user.role === 'lecturer'
                                ? 'primary'
                                : user.role === 'ta'
                                ? 'secondary'
                                : user.role === 'assistant'
                                ? 'warning'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {user.courses && user.courses.length > 0 ? (
                              user.courses.map((course) => (
                                <Chip
                                  key={course._id}
                                  label={course.name}
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No courses assigned
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(user)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Assign Courses">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenCourseDialog(user)}
                            >
                              <SchoolIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Password">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenResetPasswordDialog(user)}
                            >
                              <LockResetIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {loading ? 'Loading users...' : 'No users found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 创建用户对话框 */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Create New User</DialogTitle>
              <DialogContent>
                <TextField
                  name="name"
                  label="Name"
                  fullWidth
                  margin="normal"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="lecturer">Lecturer</MenuItem>
                    <MenuItem value="ta">Teaching Assistant</MenuItem>
                    <MenuItem value="tutor">Tutor</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={formData.password}
                  onChange={handleInputChange}
                  helperText="Leave blank to generate a random password"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Courses</InputLabel>
                  <Select
                    multiple
                    name="courses"
                    value={formData.courses}
                    onChange={handleCourseChange}
                    label="Courses"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((courseId) => {
                          const course = courses.find((c) => c._id === courseId);
                          return (
                            <Chip key={courseId} label={course ? course.name : courseId} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateUser} variant="contained">
                  Create
                </Button>
              </DialogActions>
            </Dialog>

            {/* 编辑用户对话框 */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Edit User</DialogTitle>
              <DialogContent>
                <TextField
                  name="name"
                  label="Name"
                  fullWidth
                  margin="normal"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="lecturer">Lecturer</MenuItem>
                    <MenuItem value="ta">Teaching Assistant</MenuItem>
                    <MenuItem value="tutor">Tutor</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateUser} variant="contained">
                  Update
                </Button>
              </DialogActions>
            </Dialog>

            {/* 分配课程对话框 */}
            <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Assign Courses</DialogTitle>
              <DialogContent>
                {currentUser && (
                  <Typography variant="subtitle1" gutterBottom>
                    {currentUser.name} ({currentUser.email})
                  </Typography>
                )}
                <FormControl fullWidth margin="normal">
                  <InputLabel>Courses</InputLabel>
                  <Select
                    multiple
                    name="courses"
                    value={formData.courses}
                    onChange={handleCourseChange}
                    label="Courses"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((courseId) => {
                          const course = courses.find((c) => c._id === courseId);
                          return (
                            <Chip key={courseId} label={course ? course.name : courseId} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignCourses} variant="contained">
                  Assign
                </Button>
              </DialogActions>
            </Dialog>

            {/* 重置密码对话框 */}
            <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogContent>
                {currentUser && (
                  <Typography variant="subtitle1" gutterBottom>
                    Reset password for {currentUser.name} ({currentUser.email})
                  </Typography>
                )}
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  helperText="Password must be at least 8 characters"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleResetPassword} variant="contained" color="primary">
                  Reset Password
                </Button>
              </DialogActions>
            </Dialog>

            {/* 提示框 */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
} 