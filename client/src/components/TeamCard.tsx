import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, CardContent, Box, Typography, Chip, Button, Stack, IconButton,
  Avatar, AvatarGroup, Divider, LinearProgress
} from '@mui/material'
import {
  Email as EmailIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  MergeType as MergeTypeIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material'
import { formatLastActive } from '../utils/dateFormat'
import { getActivityStatus } from '../utils/activity'
import { Team } from '../types/team'
import { getGithubAvatarUrl } from '../utils/github'

interface TeamCardProps {
  team: Team
}

export const TeamCard = ({ team }: TeamCardProps) => {
  const navigate = useNavigate()
  
  if (!team) {
    return null
  }

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

  return (
    <Card sx={{ position: 'relative' }}>
      {!team.exists && (
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
            Repository Not Found
          </Typography>
          <Typography variant="body2" color="white" align="center" mb={2}>
            The repository for this team could not be accessed.
          </Typography>
          <IconButton
            href={getMailtoLink()}
            color="primary"
            sx={{ bgcolor: 'background.paper' }}
          >
            <EmailIcon />
          </IconButton>
        </Box>
      )}
      <CardContent sx={{ opacity: team.exists ? 1 : 0.4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {team.name}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary" gutterBottom>
              {team.description}
            </Typography> */}
          </Box>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3 }}>
          <AvatarGroup max={4} sx={{ mb: 2 }}>
            {team.members?.map((member) => (
              <Avatar 
                key={member.userId?._id} 
                src={getGithubAvatarUrl(member.userId?.githubId)}
                alt={member.userId?.name}
              />
            ))}
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
      </CardContent>
    </Card>
  )
} 