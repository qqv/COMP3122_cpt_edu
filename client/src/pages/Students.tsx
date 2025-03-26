import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  InputAdornment,
  Chip,
  IconButton,
  Pagination,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  InputLabel,
  CircularProgress,
  Tooltip,
  Input,
  Menu,
  MenuItem
} from '@mui/material'
import {
  Search as SearchIcon,
  GitHub as GitHubIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  MergeType as MergeIcon,
  Comment as CommentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material'
import { studentService } from '../services/api'
import { getGithubAvatarUrl } from '../utils/github'

interface Student {
  _id: string;
  name: string;
  email: string;
  githubId: string;
  team?: string;
  activity?: {
    commits: number;
    issues: number;
    pullRequests: number;
    comments: number;
    lastActive: string;
    activityLevel?: 'high' | 'medium' | 'low' | 'unknown';
  };
}

// 活动级别评估函数
const getActivityLevel = (commits: number, issues: number, pullRequests: number, comments: number): 'high' | 'medium' | 'low' | 'unknown' => {
  if (commits === 0 && issues === 0 && pullRequests === 0 && comments === 0) {
    return 'unknown';
  }
  
  const total = commits + issues + pullRequests + comments;
  
  if (total >= 20) {
    return 'high';
  } else if (total >= 5) {
    return 'medium';
  } else {
    return 'low';
  }
};

// 活动级别颜色
const activityLevelColors = {
  high: '#4caf50',
  medium: '#ff9800',
  low: '#f44336',
  unknown: '#9e9e9e'
};

export default function Students() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const rowsPerPage = 15

  const [openSingleDialog, setOpenSingleDialog] = useState(false)
  const [openBatchDialog, setOpenBatchDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    githubId: ''
  })
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 添加临时消息状态
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // 用于清除临时消息
  const clearMessageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 显示临时消息的函数
  const showTemporaryMessage = (type: 'success' | 'error' | 'info', text: string, duration = 5000) => {
    setMessage({ type, text });
    
    if (clearMessageTimeout.current) {
      clearTimeout(clearMessageTimeout.current);
    }
    
    clearMessageTimeout.current = setTimeout(() => {
      setMessage(null);
      clearMessageTimeout.current = null;
    }, duration);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.githubId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  )

  const handleAddSingleStudent = () => {
    setOpenSingleDialog(true)
  }

  const handleAddMultipleStudents = () => {
    setOpenBatchDialog(true)
  }

  const handleClose = () => {
    setOpenSingleDialog(false)
    setOpenBatchDialog(false)
    setNewStudent({ name: '', email: '', githubId: '' })
  }

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Input validation
      if (!newStudent.name || !newStudent.email || !newStudent.githubId) {
        // 改为在表格上方显示错误消息
        showTemporaryMessage('error', 'All fields are required');
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStudent.email)) {
        // 改为在表格上方显示错误消息
        showTemporaryMessage('error', 'Please enter a valid email address');
        setLoading(false);
        return;
      }

      console.log('Submitting student data:', newStudent);
      
      // Check server connection first
      const isServerConnected = await fetch('http://localhost:5000/api/students')
        .then(() => true)
        .catch(() => false);
      
      if (!isServerConnected) {
        // 改为在表格上方显示错误消息
        showTemporaryMessage('error', 'Cannot connect to server. Please make sure the backend server is running.');
        setLoading(false);
        return;
      }
      
      // Create student - wrap this in a separate try/catch to handle specific API errors
      try {
        const createdStudent = await studentService.createStudent(newStudent);
        console.log('Student created successfully:', createdStudent);
        
        // Add student to local state immediately to show instant feedback
        setStudents(prevStudents => [...prevStudents, createdStudent]);
        
        // Also refresh from server to ensure we have latest data
        try {
          const allStudents = await studentService.getAllStudents();
          if (Array.isArray(allStudents)) {
            setStudents(allStudents);
          } else {
            // Fallback to search
            const { students } = await studentService.searchStudents(' ');
            setStudents(students);
          }
        } catch (refreshError) {
          console.error('Error refreshing student list:', refreshError);
          // Continue with the locally updated state if refresh fails
        }
        
        // Close dialog and reset form
        handleClose();
        
        // Show success message
        showTemporaryMessage('success', `Student ${newStudent.name} added successfully`);
      } catch (createError: any) {
        console.error('Failed to create student:', createError);
        
        // Check for specific error types
        const errorMessage = createError.message || '';
        
        // 改为在表格上方显示错误消息
        if (errorMessage.includes('email') && errorMessage.toLowerCase().includes('exists')) {
          showTemporaryMessage('error', 'A student with this email already exists');
          handleClose(); // 关闭对话框
        } else if (errorMessage.includes('githubId') && errorMessage.toLowerCase().includes('exists')) {
          showTemporaryMessage('error', 'A student with this GitHub ID already exists');
          handleClose(); // 关闭对话框
        } else if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('exists')) {
          showTemporaryMessage('error', 'This student already exists in the database');
          handleClose(); // 关闭对话框
        } else if (errorMessage.includes('Cannot connect to server')) {
          showTemporaryMessage('error', 'Cannot connect to server. Please make sure the backend server is running.');
          handleClose(); // 关闭对话框
        } else {
          showTemporaryMessage('error', errorMessage || 'Failed to create student');
          handleClose(); // 关闭对话框
        }
      }
    } catch (err: any) {
      console.error('General error in handleSubmit:', err);
      // 改为在表格上方显示错误消息
      showTemporaryMessage('error', 'An unexpected error occurred. Please try again.');
      handleClose(); // 关闭对话框
    } finally {
      setLoading(false);
    }
  }

  const [batchData, setBatchData] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // 處理CSV文件上傳
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCsvFile(event.target.files[0]);
    }
  };

  // 讀取CSV文件內容
  const readCsvFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          resolve(e.target.result as string);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // 批量添加學生
  const handleBatchSubmit = async () => {
    try {
      if (!csvFile) {
        showTemporaryMessage('error', 'Please upload a CSV file');
        return;
      }

      setLoading(true);
      
      // 讀取CSV文件內容
      const csvContent = await readCsvFile(csvFile);
      
      // 解析CSV格式的數據
      const lines = csvContent.trim().split('\n');
      const parsedStudents: Array<{name: string, email: string, githubId: string}> = [];
      const errors: string[] = [];
      
      // 檢查是否有標題行（第一行）
      let startIndex = 0;
      if (lines.length > 0) {
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('name') && firstLine.includes('email') && firstLine.includes('githubid')) {
          // 這是標題行，從第二行開始處理
          startIndex = 1;
          console.log('Detected header row in CSV, starting from line 2');
        }
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map(part => part.trim());
        
        // 跳過空行
        if (parts.every(part => !part)) {
          continue;
        }
        
        if (parts.length < 3) {
          errors.push(`Line ${i + 1}: Invalid format, expecting name, email, githubId`);
          continue;
        }

        const [name, email, githubId] = parts;
        
        // 基本驗證
        if (!name || !email || !githubId) {
          errors.push(`Line ${i + 1}: Missing required fields`);
          continue;
        }

        // 電子郵件驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`Line ${i + 1}: Invalid email format for ${email}`);
          continue;
        }

        parsedStudents.push({ name, email, githubId });
      }

      if (errors.length > 0) {
        // 顯示所有錯誤的詳細信息
        const errorMessage = `${errors.length} error${errors.length > 1 ? 's' : ''} found in data:\n${errors.join('\n')}`;
        console.error('CSV validation errors:', errors);
        showTemporaryMessage('error', errorMessage);
        setLoading(false);
        return;
      }

      if (parsedStudents.length === 0) {
        showTemporaryMessage('error', 'No valid student data found in the CSV file');
        setLoading(false);
        return;
      }
      
      console.log('Parsed students data:', parsedStudents);

      // 批量创建学生
      let successCount = 0;
      const batchErrors: string[] = [];

      for (const student of parsedStudents) {
        try {
          await studentService.createStudent(student);
          successCount++;
        } catch (err: any) {
          const errorMessage = err.message || 'Unknown error';
          batchErrors.push(`Failed to add student ${student.name}: ${errorMessage}`);
        }
      }

      // 刷新学生列表
      try {
        const allStudents = await studentService.getAllStudents();
        if (Array.isArray(allStudents)) {
          setStudents(allStudents);
        } else {
          const { students } = await studentService.searchStudents(' ');
          setStudents(students);
        }
      } catch (refreshError) {
        console.error('Error refreshing student list after batch insert:', refreshError);
      }

      // 关闭对话框并清空批量数据
      handleClose();
      setCsvFile(null);

      // 显示结果消息
      if (successCount === parsedStudents.length) {
        showTemporaryMessage('success', `Successfully added ${successCount} students`);
      } else if (successCount > 0) {
        showTemporaryMessage('info', `Added ${successCount} of ${parsedStudents.length} students. Some students could not be added.`);
        console.error('Batch creation errors:', batchErrors);
      } else {
        showTemporaryMessage('error', 'Failed to add any students');
        console.error('Batch creation errors:', batchErrors);
      }
    } catch (err) {
      console.error('Error in batch submit:', err);
      showTemporaryMessage('error', 'An unexpected error occurred during batch processing');
    } finally {
      setLoading(false);
    }
  };

  // 處理學生刪除
  const handleDeleteDialogOpen = (student: Student) => {
    setSelectedStudent(student);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      await studentService.deleteStudent(selectedStudent._id);
      
      // 從狀態中移除學生
      setStudents(prevStudents => prevStudents.filter(s => s._id !== selectedStudent._id));
      
      // 顯示成功消息
      showTemporaryMessage('success', `Student ${selectedStudent.name} deleted successfully`);
      
      // 關閉對話框
      handleDeleteDialogClose();
    } catch (error: any) {
      console.error('Failed to delete student:', error);
      showTemporaryMessage('error', error.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  // 處理更多選項菜單
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, student: Student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        console.log('Fetching students...');
        
        // First try to get all students directly
        try {
          const allStudents = await studentService.getAllStudents();
          console.log('All students fetch response:', allStudents);
          if (Array.isArray(allStudents)) {
            // 获取每个学生的活动数据，使用真实GitHub数据
            const studentsWithActivity = await Promise.all(
              allStudents.map(async (student) => {
                try {
                  // 获取学生活动数据 - 真实数据或0值
                  const activity = await studentService.getStudentActivity(student.githubId);
                  
                  // 计算活动级别 - 基于贡献数据
                  const activityLevel = getActivityLevel(
                    activity.commits || 0,
                    activity.issues || 0,
                    activity.pullRequests || 0,
                    activity.comments || 0
                  );
                  
                  return {
                    ...student,
                    team: activity.team, // 使用API返回的真实团队，可能为null
                    activity: {
                      ...activity,
                      activityLevel
                    }
                  };
                } catch (error) {
                  console.error(`Error fetching activity for student ${student.name}:`, error);
                  // 如果获取失败，使用0值
                  return {
                    ...student,
                    team: null,
                    activity: {
                      commits: 0,
                      issues: 0,
                      pullRequests: 0,
                      comments: 0,
                      lastActive: null,
                      activityLevel: 'unknown'
                    }
                  };
                }
              })
            );
            
            setStudents(studentsWithActivity);
            setError(null);
            setLoading(false);
            return; // Exit if successful
          }
        } catch (directError) {
          console.error('Direct getAllStudents failed:', directError);
          // Continue to the fallback method
        }
        
        // Fallback to search method
        const { students } = await studentService.searchStudents(' ');
        console.log('Fetched students via search:', students);
        if (Array.isArray(students)) {
          // 使用相同的方法获取学生活动数据
          const studentsWithActivity = await Promise.all(
            students.map(async (student) => {
              try {
                // 获取学生活动数据 - 真实数据或0值
                const activity = await studentService.getStudentActivity(student.githubId);
                
                // 计算活动级别
                const activityLevel = getActivityLevel(
                  activity.commits || 0,
                  activity.issues || 0,
                  activity.pullRequests || 0,
                  activity.comments || 0
                );
                
                return {
                  ...student,
                  team: activity.team, // 使用API返回的真实团队，可能为null
                  activity: {
                    ...activity,
                    activityLevel
                  }
                };
              } catch (error) {
                console.error(`Error fetching activity for student ${student.name}:`, error);
                // 如果获取失败，使用0值
                return {
                  ...student,
                  team: null,
                  activity: {
                    commits: 0,
                    issues: 0,
                    pullRequests: 0,
                    comments: 0,
                    lastActive: null,
                    activityLevel: 'unknown'
                  }
                };
              }
            })
          );
          
          setStudents(studentsWithActivity);
          setError(null);
        } else {
          console.error('Unexpected students data format:', students);
          setError('Invalid data format received from server');
        }
      } catch (err: any) {
        console.error('Error fetching students:', err);
        if (err.message.includes('Cannot connect to server')) {
          setError('Cannot connect to server. Please make sure the backend server is running.');
        } else {
          setError(err.message || 'Failed to fetch students');
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Students
              </Typography>
              <TextField
                placeholder="Search students..."
                size="small"
                sx={{ width: 300 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={handleAddSingleStudent}
                  sx={{ borderColor: 'primary.main', fontSize: '0.875rem' }}
                >
                  Add single student
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<GroupAddIcon />} 
                  onClick={handleAddMultipleStudents}
                  sx={{ borderColor: 'grey.400', fontSize: '0.875rem' }}
                >
                  Add Batch Student
                </Button>
              </Box>
            </Box>

            {/* 状态消息提示 */}
            {message && (
              <Paper 
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: message.type === 'success' ? 'success.light' : 
                           message.type === 'error' ? 'error.light' : 'info.light',
                  color: message.type === 'success' ? 'success.contrastText' : 
                         message.type === 'error' ? 'error.contrastText' : 'info.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2
                }}
              >
                <Typography>
                  {message.text}
                </Typography>
              </Paper>
            )}

            <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <TableContainer sx={{ 
                height: '70vh' // 使用視窗高度的百分比
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Team</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Commits</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Issues</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Pull Requests</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Comments</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: '12px 16px' }}>Last Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="error">{error}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : paginatedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStudents.map((student) => (
                        <TableRow key={student._id} sx={{ 
                          borderBottom: '1px solid #f0f0f0',
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                        }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar src={getGithubAvatarUrl(student.githubId)} alt={student.name} />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {student.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <GitHubIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {student.githubId}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleMenuOpen(e, student)}
                                sx={{ ml: 'auto' }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>{student.team || 'No Team'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CodeIcon fontSize="small" color="action" />
                              <Typography>{student.activity?.commits || 0}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BugIcon fontSize="small" color="action" />
                              <Typography>{student.activity?.issues || 0}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MergeIcon fontSize="small" color="action" />
                              <Typography>{student.activity?.pullRequests || 0}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CommentIcon fontSize="small" color="action" />
                              <Typography>{student.activity?.comments || 0}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={student.activity?.activityLevel || 'unknown'} 
                              size="small"
                              sx={{ 
                                backgroundColor: activityLevelColors[student.activity?.activityLevel || 'unknown'],
                                color: 'white',
                                textTransform: 'capitalize'
                              }}
                              icon={
                                student.activity?.activityLevel === 'high' ? (
                                  <TrendingUpIcon fontSize="small" sx={{ color: 'white' }} />
                                ) : student.activity?.activityLevel === 'low' ? (
                                  <TrendingDownIcon fontSize="small" sx={{ color: 'white' }} />
                                ) : undefined
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {student.activity?.lastActive ? new Date(student.activity.lastActive).toLocaleString() : 'No Record'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
              <Pagination
                count={Math.ceil(filteredStudents.length / rowsPerPage)}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size="medium"
              />
            </Box>
          </Container>
        </Box>
      </Box>
      <Dialog open={openSingleDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="GitHub ID"
                value={newStudent.githubId}
                onChange={(e) => setNewStudent({ ...newStudent, githubId: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GitHubIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit" disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openBatchDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); handleBatchSubmit(); }}>
          <DialogTitle>Batch Add Students</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a CSV file with student data (name, email, githubId), one student per line
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                Select CSV File
                <Input
                  type="file"
                  sx={{ display: 'none' }}
                  inputProps={{ accept: '.csv' }}
                  onChange={handleFileChange}
                />
              </Button>
              {csvFile && (
                <Typography variant="body2" color="primary">
                  Selected file: {csvFile.name}
                </Typography>
              )}
              <Box sx={{ mt: 2, width: '100%', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Example CSV format:
                </Typography>
                <Typography variant="caption" component="pre" sx={{ display: 'block', fontFamily: 'monospace' }}>
                <div>name	email	                     githubId</div>
                <div>Alice	alice.wong@example.com	      alicewong123</div>
                <div>Bob 	bob.chen@example.com	      bobchen456</div>

                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !csvFile}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Processing...' : 'Import Students'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 學生操作菜單 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          if (selectedStudent) handleDeleteDialogOpen(selectedStudent);
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Student
        </MenuItem>
      </Menu>

      {/* 刪除確認對話框 */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete student "{selectedStudent?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteStudent} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 