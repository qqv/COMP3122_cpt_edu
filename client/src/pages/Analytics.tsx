import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Stack
} from '@mui/material'
import { 
  LineChart,
  BarChart,
  SparkLineChart
} from '@mui/x-charts'

// Fake data
const commitData = {
  xAxis: [{ 
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    scaleType: 'band' as const
  }],
  series: [
    {
      data: [65, 59, 80, 81, 56, 55],
      label: 'Commits',
      color: '#2196f3',
      area: true,
      showMark: false
    }
  ]
}

const issueData = {
  xAxis: [{ 
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    scaleType: 'band' as const
  }],
  series: [
    {
      data: [28, 35, 40, 27, 32, 38],
      label: 'Opened',
      color: '#f44336'
    },
    {
      data: [25, 32, 38, 24, 30, 35],
      label: 'Closed',
      color: '#4caf50'
    }
  ]
}

const teamPerformanceData = {
  xAxis: [{ 
    data: ['Code Quality', 'Collaboration', 'Timeliness', 'Documentation', 'Issue Resolution', 'Code Review'],
    scaleType: 'band' as const
  }],
  series: [
    {
      data: [90, 85, 70, 88, 78, 82],
      label: 'Team A',
      color: '#f44336'
    },
    {
      data: [85, 90, 88, 75, 85, 75],
      label: 'Team B',
      color: '#2196f3'
    }
  ]
}

const topContributors = [
  { name: 'John Doe', commits: 156, prs: 23, issues: 45 },
  { name: 'Jane Smith', commits: 142, prs: 19, issues: 38 },
  { name: 'Mike Johnson', commits: 128, prs: 15, issues: 32 }
]

// First add this new type
type ContributionDay = {
  count: number;
  intensity: 'none' | 'low' | 'medium' | 'high' | 'very-high';
}

// Then update the contribution data
const contributionData = Array.from({ length: 4 }, (_, weekIndex) => 
  Array.from({ length: 7 }, (_, dayIndex): ContributionDay => {
    const count = Math.floor(Math.random() * 10);
    let intensity: ContributionDay['intensity'] = 'none';
    if (count > 8) intensity = 'very-high';
    else if (count > 6) intensity = 'high';
    else if (count > 4) intensity = 'medium';
    else if (count > 0) intensity = 'low';
    return { count, intensity };
  })
);

const activityTrendsData = {
  xAxis: [{ 
    data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    scaleType: 'band' as const
  }],
  series: [
    {
      data: [42, 58, 65, 45, 72, 55],
      label: 'Commits',
      color: '#2196f3'
    },
    {
      data: [25, 32, 28, 35, 40, 30],
      label: 'Pull Requests',
      color: '#4caf50'
    },
    {
      data: [15, 22, 18, 25, 30, 20],
      label: 'Issues',
      color: '#f44336'
    }
  ]
}

export default function Analytics() {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics
          </Typography>
          <Typography color="text.secondary" paragraph>
            Detailed insights into student activities and team performance
          </Typography>

          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Activity" />
              <Tab label="Teams" />
              <Tab label="Students" />
              <Tab label="Trends" />
            </Tabs>
          </Paper>

          <Box hidden={tabValue !== 0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Commit Frequency" />
                  <CardContent sx={{ height: 300 }}>
                    <LineChart
                      height={250}
                      series={commitData.series}
                      xAxis={commitData.xAxis}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Issue Resolution" />
                  <CardContent sx={{ height: 300 }}>
                    <BarChart
                      height={250}
                      series={issueData.series}
                      xAxis={issueData.xAxis}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Contribution Heatmap" />
                  <CardContent>
                    <Box sx={{ 
                      p: 2,
                      maxWidth: '800px',  // 限制最大宽度
                      margin: '0 auto',   // 居中
                      '& .MuiGrid-container': { 
                        justifyContent: 'center'  // Grid 容器居中
                      }
                    }}>
                      {/* Days of week labels */}
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={0.4} /> {/* 减小间距 */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <Grid item xs={1.2} key={day}> {/* 减小格子大小 */}
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              {day}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Weeks */}
                      {contributionData.map((week, weekIndex) => (
                        <Grid container spacing={1} key={weekIndex} sx={{ mb: 0.5 }}> {/* 减小行间距 */}
                          {/* Week label */}
                          <Grid item xs={0.4}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              W{weekIndex + 1}
                            </Typography>
                          </Grid>
                          
                          {/* Days */}
                          {week.map((day, dayIndex) => (
                            <Grid item xs={1.2} key={dayIndex}>
                              <Box
                                sx={{
                                  width: '100%',
                                  paddingTop: '100%',
                                  position: 'relative',
                                  bgcolor: theme => ({
                                    'none': theme.palette.grey[200],
                                    'low': '#9be9a8',
                                    'medium': '#40c463',
                                    'high': '#30a14e',
                                    'very-high': '#216e39'
                                  })[day.intensity],
                                  borderRadius: 0.5,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    opacity: 0.8,
                                    outline: '1px solid',
                                    outlineColor: theme => theme.palette.primary.main
                                  }
                                }}
                                title={`${day.count} contributions on Week ${weekIndex + 1}, ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex]}`}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ))}

                      {/* Legend */}
                      <Box sx={{ 
                        mt: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,  // 减小图例间距
                        justifyContent: 'center'  // 图例居中
                      }}>
                        <Typography variant="caption" color="text.secondary">Less</Typography>
                        {['none', 'low', 'medium', 'high', 'very-high'].map((intensity) => (
                          <Box
                            key={intensity}
                            sx={{
                              width: 16,  // 减小图例方块大小
                              height: 16,
                              bgcolor: theme => ({
                                'none': theme.palette.grey[200],
                                'low': '#9be9a8',
                                'medium': '#40c463',
                                'high': '#30a14e',
                                'very-high': '#216e39'
                              })[intensity as ContributionDay['intensity']],
                              borderRadius: 0.5
                            }}
                          />
                        ))}
                        <Typography variant="caption" color="text.secondary">More</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Box hidden={tabValue !== 1}>
            <Card>
              <CardHeader title="Team Performance Comparison" />
              <CardContent sx={{ height: 400 }}>
                <BarChart
                  height={350}
                  series={teamPerformanceData.series}
                  xAxis={teamPerformanceData.xAxis}
                />
              </CardContent>
            </Card>
          </Box>

          <Box hidden={tabValue !== 2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Top Contributors" />
                  <CardContent>
                    <Stack spacing={2}>
                      {topContributors.map((contributor, index) => (
                        <Box key={index}>
                          <Typography variant="subtitle1">{contributor.name}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {`${contributor.commits} commits, ${contributor.prs} PRs, ${contributor.issues} issues`}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(contributor.commits / topContributors[0].commits) * 100}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Deadline Fighters" />
                  <CardContent>
                    {/* This section will be added later */}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Box hidden={tabValue !== 3}>
            <Card>
              <CardHeader title="Activity Trends" />
              <CardContent sx={{ height: 400 }}>
                <LineChart
                  height={350}
                  series={activityTrendsData.series}
                  xAxis={activityTrendsData.xAxis}
                />
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  )
} 