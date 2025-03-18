import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Check as CheckIcon,
  GitHub as GitHubIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService, studentService } from '../services/api';
import { getGithubAvatarUrl } from '../utils/github';

// Available Student
interface Student {
  _id: string;
  name: string;
  email: string;
  githubId?: string;
}

interface TeamMember {
  userId: Student;
  role: 'leader' | 'member';
}

interface TeamData {
  _id: string;
  name: string;
  repositoryUrl: string;
  members: TeamMember[];
  course: {
    _id: string;
    name: string;
  };
  inviteCode: string;
}

export default function TeamInvite() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Student[]>([]);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Get invite information
  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const response = await teamService.verifyInvite(inviteCode!);
        setTeamData(response.team);
      } catch (err: any) {
        setError(err.message || 'Failed to verify invite code');
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [inviteCode]);
  
  // Submit repository URL
  const handleSubmitRepository = async () => {
    try {
      if (!teamData) return;
      
      if (!repositoryUrl.trim()) {
        setActionError('Repository URL is required');
        return;
      }
      
      // Validate URL format
      if (!repositoryUrl.match(/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/)) {
        setActionError('Invalid GitHub repository URL format');
        return;
      }
      
      // Update repository URL
      await teamService.updateTeamRepository(teamData._id, repositoryUrl);
      
      // Get full team data using verifyInvite
      const response = await teamService.verifyInvite(inviteCode!);
      setTeamData(response.team);
      
      setActionSuccess('Repository URL saved successfully');
      setActionError('');
      setActiveStep(1);  
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error updating repository URL:', error);
      setActionError(error.message || 'Failed to update repository URL');
    }
  };
  
  // Search students
  const handleSearchStudents = async () => {
    try {
      if (!teamData || !searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      const { students } = await studentService.searchStudents(searchQuery);
      console.log('Search results:', students);

      if (!Array.isArray(students)) {
        console.warn('Unexpected response format:', students);
        setSearchResults([]);
        return;
      }

      // Filter out students who are already team members
      const teamMemberIds = teamData.members.map(member => member.userId._id);
      const filteredResults = students.filter(student => 
        !teamMemberIds.includes(student._id)
      );
      
      setSearchResults(filteredResults);
      setActionError('');
    } catch (error: any) {
      console.error('Search error details:', error);
      setActionError(error.message || 'Failed to search students');
      setSearchResults([]);
    }
  };
  
  // Add team member
  const handleAddMember = (student: Student) => {
    // Check if student is already selected
    if (selectedMembers.some(member => member._id === student._id)) {
      setActionError('This student is already selected');
      return;
    }
    
    setSelectedMembers([...selectedMembers, student]);
    setActionError('');
  };
  
  // Remove selected member
  const handleRemoveSelectedMember = (studentId: string) => {
    setSelectedMembers(selectedMembers.filter(student => student._id !== studentId));
  };
  
  // Submit team members
  const handleSubmitMembers = async () => {
    try {
      if (!teamData || selectedMembers.length === 0) {
        setActionError('Please select members to add');
        return;
      }

      for (const student of selectedMembers) {
        try {
          await teamService.addTeamMember(teamData._id, student._id);
        } catch (err) {
          console.error(`Failed to add member ${student.name}:`, err);
          continue;
        }
      }

      // Refresh team data
      const response = await teamService.verifyInvite(inviteCode!);
      setTeamData(response.team);
      
      // Clear selection
      setSelectedMembers([]);
      setSearchResults([]);
      setSearchQuery('');
      
      setActionSuccess('Members added successfully');
    } catch (error: any) {
      setActionError('Some members could not be added. Please try again.');
    }
  };
  
  const handleSubmit = async () => {
    if (!repositoryUrl.trim()) return
    
    setSubmitting(true)
    try {
      await teamService.updateTeamRepository(teamData!._id, repositoryUrl.trim())
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleFinish = () => {
    setSubmitted(true);
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="error">
            Error
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!teamData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="error">
            Error
          </Typography>
          <Typography variant="body1">Team data not found</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Repository Setup Complete!
          </Typography>
          <Typography color="text.secondary" paragraph>
            Your team repository has been successfully linked. You can now start collaborating with your team members.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Repository URL: {repositoryUrl}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Team basic information */}
        {teamData && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              {teamData.name}
            </Typography>
            <Typography color="text.secondary">
              Course: {teamData.course?.name || teamData.course?._id}
            </Typography>
          </Box>
        )}

        {/* Step content */}
        {teamData && (
          <>
            {/* Repository setup step */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Set GitHub Repository
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Please enter your team's GitHub repository URL. This will be used to track your team's progress.
                </Typography>
                
                <TextField
                  label="GitHub Repository URL"
                  fullWidth
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  margin="normal"
                  placeholder="https://github.com/username/repository"
                  InputProps={{
                    startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSubmitRepository}
                    startIcon={<CheckIcon />}
                  >
                    Save and Continue
                  </Button>
                </Box>
              </Box>
            )}

            {/* Member management step */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Add Team Members
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Search for students by name or email and add them to your team.
                </Typography>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    label="Search Students"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter name or email"
                    sx={{ mr: 2 }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleSearchStudents}
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Search Results
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                      {searchResults.length > 0 ? (
                        <List>
                          {searchResults.map((student) => (
                            <ListItem 
                              key={student._id}
                              secondaryAction={
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleAddMember(student)}
                                  title="Add to team"
                                >
                                  <PersonAddIcon />
                                </IconButton>
                              }
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
                      ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            No results found
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Selected Members
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                      {selectedMembers.length > 0 ? (
                        <List>
                          {selectedMembers.map((student) => (
                            <ListItem 
                              key={student._id}
                              secondaryAction={
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleRemoveSelectedMember(student._id)}
                                  title="Remove"
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              }
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
                      ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            No members selected
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Current Team Members
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  {teamData.members && teamData.members.length > 0 ? (
                    <List>
                      {teamData.members.map((member) => (
                        <ListItem key={member.userId._id}>
                          <ListItemAvatar>
                            <Avatar src={getGithubAvatarUrl(member.userId.githubId)} />
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <>
                                {member.userId.name}
                                {member.role === 'leader' && (
                                  <Chip 
                                    label="Leader" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </>
                            }
                            secondary={member.userId.email}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No team members yet
                    </Typography>
                  )}
                </Paper>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setActiveStep(0)}
                  >
                    Back to Repository
                  </Button>
                  
                  <Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleSubmitMembers}
                      sx={{ mr: 2 }}
                      disabled={selectedMembers.length === 0}
                    >
                      Add Selected Members
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleFinish}
                    >
                      Finish Setup
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Error and success prompts */}
        {actionError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {actionError}
          </Alert>
        )}
        
        {actionSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {actionSuccess}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}
