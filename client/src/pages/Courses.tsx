import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Code as CodeIcon,
  Style as StyleIcon
} from '@mui/icons-material'
import Sidebar from '../components/Sidebar'
import { courseService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface Course {
  _id: string;
  name: string;
  description: string;
  code: string;
  students?: number;
  teams?: number;
  createdAt: string;
  startDate: string;
  endDate: string;
}

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await courseService.getAllCourses()
      setCourses(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course)
      setFormData({
        name: course.name,
        description: course.description || '',
        code: course.code,
        startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''
      })
    } else {
      setEditingCourse(null)
      setFormData({
        name: '',
        description: '',
        code: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse._id, formData)
      } else {
        const response = await courseService.createCourse(formData)
        console.log('Create course response:', response)
      }
      setDialogOpen(false)
      fetchCourses()
    } catch (err: any) {
      console.error('Create/Update course error:', err)
      setError(err.message || 'Failed to save course')
    }
  }

  const handleDelete = async (course: Course) => {
    setCourseToDelete(course)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!courseToDelete) return

    try {
      await courseService.deleteCourse(courseToDelete._id)
      setDeleteConfirmOpen(false)
      setCourseToDelete(null)
      fetchCourses()
    } catch (err: any) {
      setError(err.message || 'Failed to delete course')
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'grey.100' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Courses
            </Typography>
            {user?.role === 'lecturer' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Course
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Students</TableCell>
                  <TableCell align="center">Teams</TableCell>
                  <TableCell align="center">Created</TableCell>
                  {user?.role === 'lecturer' && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <StyleIcon color="primary" />
                          <Typography variant="body1">{course.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={course.code} size="small" />
                      </TableCell>
                      <TableCell>{course.description}</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<GroupIcon />}
                          label={course.students || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<CodeIcon />}
                          label={course.teams || 0}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </TableCell>
                      {user?.role === 'lecturer' && (
                        <TableCell align="right">
                          <Tooltip title="Edit course">
                            <IconButton onClick={() => handleOpenDialog(course)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete course">
                            <IconButton 
                              onClick={() => handleDelete(course)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>

        {/* Course Form Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Course Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Course Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                margin="normal"
                required
                helperText="A unique identifier for the course"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.code}
            >
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the course "{courseToDelete?.name}"? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
} 