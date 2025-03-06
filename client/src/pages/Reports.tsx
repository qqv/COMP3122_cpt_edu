import React from 'react'
import Sidebar from '../components/Sidebar'
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Stack,
  Chip,
  IconButton
} from '@mui/material'
import {
  Description as FileTextIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material'

// 报告数据
const reports = [
  {
    name: 'Weekly Activity Summary',
    description: 'Summary of all team activities for the past week',
    created: '2023-04-15',
    type: 'Automated',
    format: 'PDF',
    canRefresh: true
  },
  {
    name: 'Team Comparison Report',
    description: 'Detailed comparison of team performance metrics',
    created: '2023-04-10',
    type: 'Custom',
    format: 'Excel',
    canRefresh: false
  },
  {
    name: 'Student Contribution Analysis',
    description: 'Analysis of individual student contributions',
    created: '2023-04-05', 
    type: 'Custom',
    format: 'PDF',
    canRefresh: false
  },
  {
    name: 'Deadline Fighters Report',
    description: 'Identifies students who commit mostly near deadlines',
    created: '2023-04-01',
    type: 'Automated',
    format: 'PDF',
    canRefresh: true
  },
  {
    name: 'Free Riders Detection',
    description: 'Identifies potential free riders in teams',
    created: '2023-03-28',
    type: 'Automated',
    format: 'PDF',
    canRefresh: true
  }
]

export default function Reports() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Reports
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
              >
                New Report
              </Button>
            </Stack>
          </Box>

          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.name} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FileTextIcon color="primary" />
                        <Typography>{report.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell>{report.created}</TableCell>
                    <TableCell>
                      <Chip 
                        label={report.type}
                        color={report.type === 'Automated' ? 'info' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{report.format}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {report.canRefresh && (
                          <IconButton size="small">
                            <RefreshIcon />
                          </IconButton>
                        )}
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
} 