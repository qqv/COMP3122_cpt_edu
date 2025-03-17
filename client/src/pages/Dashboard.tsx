import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Code as CodeIcon,
  MergeType as MergeTypeIcon,
  BugReport as BugReportIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { BarChart, LineChart } from "@mui/x-charts";
import Sidebar from "../components/Sidebar";
import { PieChart } from "@mui/x-charts";

// 课程数据
const courses = [
  {
    id: "COMP3421",
    name: "Software Engineering",
    instructor: "Dr. Wong, Jane",
    project: "Smart Campus App",
    groups: 10,
    students: 45,
    deadline: "April 30, 2025",
  },
  {
    id: "COMP3356",
    name: "Mobile Application Development",
    instructor: "Dr. Chen, Robert",
    project: "Health Tracking App",
    groups: 8,
    students: 32,
    deadline: "May 15, 2025",
  },
  {
    id: "COMP3278",
    name: "Database Management Systems",
    instructor: "Prof. Liu, Sarah",
    project: "E-commerce Database",
    groups: 12,
    students: 48,
    deadline: "April 20, 2025",
  },
];

// 团队数据
const teams = [
  {
    name: "Team Alpha",
    members: 5,
    commits: 142,
    issues: 38,
    prs: 24,
    progress: 85,
    status: "On Track",
    lastActivity: "2 hours ago",
  },
  {
    name: "Team Beta",
    members: 4,
    commits: 98,
    issues: 27,
    prs: 15,
    progress: 72,
    status: "On Track",
    lastActivity: "1 day ago",
  },
  {
    name: "Team Gamma",
    members: 5,
    commits: 165,
    issues: 42,
    prs: 21,
    progress: 90,
    status: "On Track",
    lastActivity: "5 hours ago",
  },
  {
    name: "Team Delta",
    members: 4,
    commits: 87,
    issues: 19,
    prs: 8,
    progress: 45,
    status: "Warning",
    lastActivity: "3 days ago",
  },
  {
    name: "Team Epsilon",
    members: 5,
    commits: 32,
    issues: 7,
    prs: 3,
    progress: 15,
    status: "At Risk",
    lastActivity: "1 week ago",
  },
];

// 学生表现数据
const students = [
  {
    name: "Chan, David",
    avatar: "/api/placeholder/40/40",
    status: "Active",
    progress: 92,
    role: "Team Lead",
  },
  {
    name: "Wong, Sarah",
    avatar: "/api/placeholder/40/40",
    status: "Active",
    progress: 88,
    role: "Developer",
  },
  {
    name: "Lam, Kevin",
    avatar: "/api/placeholder/40/40",
    status: "Warning",
    progress: 42,
    role: "Developer",
  },
  {
    name: "Ng, Michael",
    avatar: "/api/placeholder/40/40",
    status: "Inactive",
    progress: 15,
    role: "Developer",
  },
  {
    name: "Chen, Emily",
    avatar: "/api/placeholder/40/40",
    status: "Active",
    progress: 78,
    role: "Developer",
  },
];

// 最近活动数据
const recentActivities = [
  {
    user: "Chan, David",
    action: "pushed 3 commits to Team Alpha/main",
    time: "Today at 10:32 AM",
    avatar: "/api/placeholder/32/32",
  },
  {
    user: "Wong, Sarah",
    action: "closed issue #42: UI Navigation Bug",
    time: "Today at 9:15 AM",
    avatar: "/api/placeholder/32/32",
  },
  {
    user: "Chen, Emily",
    action: "created pull request #24: Add user authentication",
    time: "Yesterday at 4:23 PM",
    avatar: "/api/placeholder/32/32",
  },
  {
    user: "Li, Jason",
    action: "merged pull request #21: Implement database models",
    time: "Yesterday at 2:45 PM",
    avatar: "/api/placeholder/32/32",
  },
  {
    user: "Lam, Kevin",
    action: "commented on issue #35: API integration issue",
    time: "2 days ago",
    avatar: "/api/placeholder/32/32",
  },
];

// 活动分布数据
const activityDistribution = {
  data: [45, 25, 15, 10, 5],
  labels: ["Commits", "Issues", "Pull Requests", "Comments", "Reviews"],
  colors: ["#1976d2", "#2e7d32", "#9c27b0", "#ed6c02", "#d32f2f"],
};

export default function Dashboard() {
  // 状态管理
  const [selectedCourse, setSelectedCourse] = useState(courses[0].id);

  // 处理课程变更
  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  // 获取当前选中的课程
  const currentCourse = courses.find((course) => course.id === selectedCourse);

  // 图表数据
  // 图表数据
  const progressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        data: [5, 15, 25, 30, 45, 60],
        label: "Team Alpha",
      },
      // ... 其他团队数据
    ],
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          bgcolor: "grey.100",
        }}
      >
        {/* Header */}
        <Paper sx={{ position: "sticky", top: 0, zIndex: 1 }}>
          <Box sx={{ px: 4, py: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton sx={{ display: { sm: "none" } }}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h5" component="h1">
                  {currentCourse.id} - {currentCourse.name}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {currentCourse.instructor}
                </Typography>
                <Avatar>
                  {currentCourse.instructor.split(" ")[0][0]}
                  {currentCourse.instructor.split(" ")[1][0]}
                </Avatar>
              </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack direction="row" spacing={3}>
                <Typography variant="body2" color="text.secondary">
                  Course Project: {currentCourse.project}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Groups: {currentCourse.groups}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Students: {currentCourse.students}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deadline: {currentCourse.deadline}
                </Typography>
              </Stack>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="course-select-label">Select Course</InputLabel>
                <Select
                  labelId="course-select-label"
                  id="course-select"
                  value={selectedCourse}
                  label="Select Course"
                  onChange={handleCourseChange}
                  size="small"
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.id} - {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={3}>
            {/* Total Commits Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, bgcolor: "blue.50", borderRadius: 2 }}>
                      <CodeIcon color="primary" />
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Total Commits
                      </Typography>
                      <Typography variant="h5" component="div">
                        892
                      </Typography>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        +15% from last week
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Issues Closed Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, bgcolor: "green.50", borderRadius: 2 }}>
                      <BugReportIcon color="success" />
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Issues Closed
                      </Typography>
                      <Typography variant="h5" component="div">
                        156
                      </Typography>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        +8% from last week
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Pull Requests Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, bgcolor: "purple.50", borderRadius: 2 }}>
                      <MergeTypeIcon sx={{ color: "purple" }} />
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Pull Requests
                      </Typography>
                      <Typography variant="h5" component="div">
                        78
                      </Typography>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        +12% from last week
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Teams at Risk Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, bgcolor: "red.50", borderRadius: 2 }}>
                      <WarningIcon color="error" />
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Teams at Risk
                      </Typography>
                      <Typography variant="h5" component="div">
                        2
                      </Typography>
                      <Typography
                        variant="body2"
                        color="error.main"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        1 with low activity
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Team Progress
                </Typography>
                <Box sx={{ height: 300, pt: 2 }}>
                  <LineChart
                    series={progressData.datasets}
                    xAxis={[{ data: progressData.labels, scaleType: "band" }]}
                    height={250}
                    slotProps={{
                      legend: {
                        direction: "row",
                        position: { vertical: "bottom", horizontal: "middle" },
                        padding: 0,
                        itemMarkWidth: 8,
                        itemMarkHeight: 8,
                        markGap: 5,
                        itemGap: 12,
                        labelStyle: {
                          fontSize: 11,
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Activity Distribution
                </Typography>
                <Box sx={{ height: 300, pt: 2 }}>
                  <PieChart
                    series={[
                      {
                        data: activityDistribution.data.map((value, index) => ({
                          value,
                          label: activityDistribution.labels[index],
                          color: activityDistribution.colors[index],
                        })),
                        innerRadius: 30,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    height={250}
                    margin={{ top: 10, bottom: 50, left: 20, right: 20 }}
                    slotProps={{
                      legend: {
                        direction: "row",
                        position: { vertical: "bottom", horizontal: "middle" },
                        padding: { top: 20, bottom: 0, left: 0, right: 0 },
                        itemMarkWidth: 8,
                        itemMarkHeight: 8,
                        markGap: 5,
                        itemGap: 12,
                        labelStyle: {
                          fontSize: 11,
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Team Comparison Table */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Team Comparison
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Commits</TableCell>
                    <TableCell>Issues</TableCell>
                    <TableCell>PRs</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Last Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.name}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.members}</TableCell>
                      <TableCell>{team.commits}</TableCell>
                      <TableCell>{team.issues}</TableCell>
                      <TableCell>{team.prs}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={team.progress}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {team.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{team.lastActivity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          {/* Student Performance and Recent Activity */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: "100%", minHeight: 600 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Student Performance</Typography>
                  <Typography variant="body2" color="text.secondary">
                    All Students ({students.length})
                  </Typography>
                </Box>
                <List sx={{ overflow: "auto", maxHeight: 520 }}>
                  {students.map((student) => (
                    <ListItem key={student.name}>
                      <ListItemAvatar>
                        <Avatar src={student.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="subtitle2">
                              {student.name}
                            </Typography>
                            <Box
                              sx={{
                                ml: 1,
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                bgcolor:
                                  student.status === "Active"
                                    ? "success.100"
                                    : student.status === "Warning"
                                    ? "warning.100"
                                    : "error.100",
                                color:
                                  student.status === "Active"
                                    ? "success.700"
                                    : student.status === "Warning"
                                    ? "warning.700"
                                    : "error.700",
                              }}
                            >
                              {student.status}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <Box sx={{ flexGrow: 1, mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={student.progress}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: "grey.100",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor:
                                        student.progress > 75
                                          ? "success.main"
                                          : student.progress > 50
                                          ? "primary.main"
                                          : student.progress > 25
                                          ? "warning.main"
                                          : "error.main",
                                    },
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {student.progress}%
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {student.role}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: "100%", minHeight: 600 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Recent Activity</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 24 Hours
                  </Typography>
                </Box>
                <List sx={{ overflow: "auto", maxHeight: 520 }}>
                  {recentActivities.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar src={activity.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              {activity.user}
                            </Box>{" "}
                            {activity.action}
                          </Typography>
                        }
                        secondary={activity.time}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
