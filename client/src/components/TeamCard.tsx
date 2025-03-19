import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, CardContent, Box, Typography, Chip, Button, Stack, IconButton,
  Avatar, AvatarGroup, Divider, LinearProgress, Alert, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar,
  ListItemText
} from '@mui/material'
import {
  Email as EmailIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  MergeType as MergeTypeIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { formatLastActive } from '../utils/dateFormat'
import { getActivityStatus } from '../utils/activity'
import { Team } from '../types/team'
import { getGithubAvatarUrl } from '../utils/github'

interface TeamCardProps {
  team: Team
  onCopyInvite: (inviteCode: string) => void
  onEmailLeader: () => void
}

export const TeamCard = ({ team, onCopyInvite, onEmailLeader }: TeamCardProps) => {
  const navigate = useNavigate()
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  
  if (!team) {
    return null
  }

  // Check if the team has a valid repository URL
  const hasValidRepo = team.repositoryUrl && team.repositoryUrl.trim() !== '';

  // Check which members have no commits - only check if repository exists and is valid
  const membersWithoutCommits = (team.exists && hasValidRepo) ? team.members.filter(member => {
    // Check if there is contribution data
    if (member.contribution) {
      return member.contribution.commits === 0;
    }
    // If there is no contribution data, consider it as no commit
    return true;
  }) : [];

  // Only show warning if repository exists, is valid, and there are members without commits
  const hasInactiveMembers = membersWithoutCommits.length > 0 && team.exists && hasValidRepo;

  const getTeamStatus = () => {
    if (!team.exists) {
      return {
        color: '#F44336',
        label: 'Inactive',
        value: 0
      }
    }
    return getActivityStatus(team.lastActive)
  }

  const status = getTeamStatus()

  const getMailtoLink = () => {
    const emails = team.members.map(member => member.userId.email).join(',')
    return `mailto:${emails}?subject=Repository Not Found - ${team.name}&body=Your team repository (${team.repositoryUrl}) could not be found. Please ensure it exists and is accessible.`
  }

  const getInactiveMembersMailtoLink = () => {
    const emails = membersWithoutCommits.map(member => {
      const memberInfo = member.user || member.userId;
      return memberInfo.email;
    }).join(',');
    
    const subject = encodeURIComponent(`Inactive Team Members - ${team.name}`);
    const body = encodeURIComponent(
      `Dear team members,\n\nWe noticed that the following GitHub IDs are not found in the commit history of your team repository:\n` +
      membersWithoutCommits.map(member => {
        const memberInfo = member.user || member.userId;
        return `- ${memberInfo.name} (${memberInfo.githubId})`;
      }).join('\n') +
      `\n\nPlease ensure that you are using the correct GitHub account for your commits.`
    );
    
    return `mailto:${emails}?subject=${subject}&body=${body}`;
  }

  return (
    <Card sx={{ position: 'relative' }}>
      {/* Repository does not exist or not set - show overlay */}
      {(!hasValidRepo || !team.exists) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            {!hasValidRepo ? 'Repository Not Set' : 'Repository Not Found'}
          </Typography>
          <Typography variant="body2" color="white" align="center" mb={2}>
            {!hasValidRepo 
              ? 'This team has not set up a repository URL yet.' 
              : 'The repository for this team could not be accessed.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Email team leader">
              <IconButton
                color="primary"
                sx={{ bgcolor: 'background.paper' }}
                onClick={onEmailLeader}
              >
                <EmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy invite link">
              <IconButton
                color="primary"
                sx={{ bgcolor: 'background.paper' }}
                onClick={() => onCopyInvite(team.inviteCode)}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      
      {/* Card content */}
      <CardContent sx={{ opacity: (!hasValidRepo || !team.exists) ? 0.4 : 1 }}>
        {/* Team name and warning icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {team.name}
            </Typography>
            {/* Only show warning icon if there are inactive members and the repository exists */}
            {hasInactiveMembers && (
              <Tooltip title="Some team members have no commits">
                <IconButton 
                  color="warning" 
                  size="small"
                  onClick={() => setWarningDialogOpen(true)}
                >
                  <WarningIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <AvatarGroup max={4} sx={{ mb: 2 }}>
            {team.members.map((member) => {
              const memberInfo = member.user || member.userId;
              const isInactive = membersWithoutCommits.some(m => 
                (m.user?._id || m.userId?._id) === (member.user?._id || member.userId?._id)
              );
              
              return (
                <Avatar 
                  key={memberInfo?._id || Math.random().toString()} 
                  src={getGithubAvatarUrl(memberInfo?.githubId)}
                  alt={memberInfo?.name || 'Team member'}
                  sx={isInactive && team.exists ? { border: '2px solid #FFC107' } : {}}
                />
              );
            })}
          </AvatarGroup>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip
            icon={<CodeIcon />}
            label={`${team.commits} commits`}
            size="small"
          />
          <Chip
            icon={<BugReportIcon />}
            label={`${team.issues} issues`}
            size="small"
          />
          <Chip
            icon={<MergeTypeIcon />}
            label={`${team.prs} PRs`}
            size="small"
          />
        </Stack>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={status.value}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': {
                bgcolor: status.color
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Chip
              label={status.label}
              size="small"
              sx={{
                bgcolor: status.color,
                color: 'white'
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Last active: {team.exists ? formatLastActive(team.lastActive) : 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate(`/team/${team._id}`)}
            sx={{ textTransform: 'none' }}
          >
            View Details
          </Button>
        </Box>

        {/* Warning dialog - only show when repository exists but some members have no commits */}
        <Dialog
          open={warningDialogOpen}
          onClose={() => setWarningDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Inactive Team Members Warning
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
              The following team members have no commits in the repository:
            </Typography>
            <List>
              {membersWithoutCommits.map((member) => {
                const memberInfo = member.user || member.userId;
                return (
                  <ListItem key={memberInfo._id}>
                    <ListItemAvatar>
                      <Avatar src={getGithubAvatarUrl(memberInfo.githubId)} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={memberInfo.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            GitHub: {memberInfo.githubId}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Email: {memberInfo.email}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This could indicate that these students are not participating in the project or are using different GitHub accounts.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              startIcon={<EmailIcon />}
              color="primary"
              onClick={() => {
                window.location.href = getInactiveMembersMailtoLink();
              }}
            >
              Email Members
            </Button>
            <Button onClick={() => setWarningDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
} 