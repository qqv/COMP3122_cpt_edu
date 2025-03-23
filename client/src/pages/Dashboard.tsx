import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Code as CodeIcon,
  MergeType as MergeTypeIcon,
  BugReport as BugReportIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { BarChart, LineChart } from "@mui/x-charts";
import Sidebar from "../components/Sidebar";
import { PieChart } from "@mui/x-charts";
import { courseService } from "../services/api";

export default function Dashboard() {
  // Generate activity distribution data from current course
  const getActivityDistribution = () => {
    if (!currentCourse || !currentCourse.stats || !currentCourse.stats.github) {
      return {
        data: [1, 0, 0], // At least one non-zero value to prevent chart errors
        labels: ["Commits", "Issues", "Pull Requests"],
        colors: ["#1976d2", "#2e7d32", "#9c27b0"],
      };
    }

    const commits = currentCourse.stats.github.totalCommits || 0;
    const issues = currentCourse.stats.github.totalIssues || 0;
    const prs = currentCourse.stats.github.totalPRs || 0;

    // If all values are zero, add a placeholder to prevent chart errors
    if (commits === 0 && issues === 0 && prs === 0) {
      return {
        data: [1, 0, 0], // At least one non-zero value
        labels: ["No Data", "Issues", "Pull Requests"],
        colors: ["#cccccc", "#2e7d32", "#9c27b0"],
      };
    }

    return {
      data: [commits, issues, prs],
      labels: ["Commits", "Issues", "Pull Requests"],
      colors: ["#1976d2", "#2e7d32", "#9c27b0"],
    };
  };
  // 状态管理
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseStats, setCourseStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理课程变更
  const handleCourseChange = (event) => {
    setSelectedCourseId(event.target.value);
  };

  // 获取当前选中的课程
  const currentCourse = courseStats.find(
    (course) => course._id === selectedCourseId
  );

  // 获取所有课程统计数据
  const fetchCourseStats = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourseStats();
      if (response && response.courses) {
        setCourseStats(response.courses);
        console.log("Course stats fetched:", response.courses);

        // If there are courses in the response, select the first one
        if (response.courses.length > 0) {
          setSelectedCourseId(response.courses[0]._id);
        }
      } else {
        setError("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching course stats:", err);
      setError(err.message || "Failed to fetch course statistics");
    } finally {
      setLoading(false);
    }
  };

  // 在组件加载时获取课程统计数据
  useEffect(() => {
    fetchCourseStats();
  }, []);

  // Generate team commits data from current course
  const getTeamCommitsData = () => {
    if (
      !currentCourse ||
      !currentCourse.teams ||
      currentCourse.teams.length === 0
    ) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0], label: "Total Commits" }],
      };
    }

    const labels = currentCourse.teams.map((team) => team.name);
    const data = currentCourse.teams.map(
      (team) => team.gitHubStats?.commits || 0
    );

    // Ensure we have at least one data point to prevent chart errors
    if (labels.length === 0 || data.every((val) => val === 0)) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0], label: "Total Commits" }],
      };
    }

    return {
      labels,
      datasets: [
        {
          data,
          label: "Total Commits",
        },
      ],
    };
  };

  // Sample low active students data
  const lowActiveStudents = [
    {
      student: {
        _id: "67d7cb2cdd317c59555c3084",
        name: "Master, Real",
        email: "sarah.wong@example.com",
        githubId: "Chris12420",
        __v: 0,
        createdAt: "2025-03-17T07:11:40.306Z",
        updatedAt: "2025-03-17T07:11:40.306Z",
      },
      team: {
        id: "67d7cb2cdd317c59555c308e",
        name: "Team Alpha",
      },
      commitPercentage: 0,
      commits: 0,
      teamTotalCommits: 50,
    },
    {
      student: {
        _id: "67d7cb2cdd317c59555c3086",
        name: "Master, AI",
        email: "emily.chen@example.com",
        githubId: "lyxsq99",
        __v: 0,
        createdAt: "2025-03-17T07:11:40.306Z",
        updatedAt: "2025-03-17T07:11:40.306Z",
      },
      team: {
        id: "67d7cb2cdd317c59555c308e",
        name: "Team Alpha",
      },
      commitPercentage: 0,
      commits: 0,
      teamTotalCommits: 50,
    },
  ];

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
              {currentCourse && (
                <>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton sx={{ display: { sm: "none" } }}>
                      <MenuIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                      {currentCourse.code} - {currentCourse.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {currentCourse.teachers &&
                      currentCourse.teachers.length > 0
                        ? currentCourse.teachers[0].name
                        : "No instructor assigned"}
                    </Typography>
                    <Avatar>
                      {currentCourse.teachers &&
                      currentCourse.teachers.length > 0
                        ? `${currentCourse.teachers[0].name.split(",")[0][0]}${
                            currentCourse.teachers[0].name.split(",")[1]
                              ? currentCourse.teachers[0].name.split(",")[1][1]
                              : ""
                          }`
                        : "NA"}
                    </Avatar>
                  </Stack>
                </>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {currentCourse && (
                <Stack direction="row" spacing={3}>
                  <Typography variant="body2" color="text.secondary">
                    Course Code: {currentCourse.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Teams: {currentCourse.stats.teams}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students: {currentCourse.stats.students}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {currentCourse.status}
                  </Typography>
                </Stack>
              )}
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="course-select-label">Select Course</InputLabel>
                <Select
                  labelId="course-select-label"
                  id="course-select"
                  value={selectedCourseId}
                  label="Select Course"
                  onChange={handleCourseChange}
                  size="small"
                >
                  {courseStats.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "80vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
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
                          {currentCourse
                            ? currentCourse.stats.github.totalCommits
                            : 0}
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
                      <Box
                        sx={{ p: 1.5, bgcolor: "green.50", borderRadius: 2 }}
                      >
                        <BugReportIcon color="success" />
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Issues Closed
                        </Typography>
                        <Typography variant="h5" component="div">
                          {currentCourse
                            ? currentCourse.stats.github.totalIssues
                            : 0}
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
                      <Box
                        sx={{ p: 1.5, bgcolor: "purple.50", borderRadius: 2 }}
                      >
                        <MergeTypeIcon sx={{ color: "purple" }} />
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Pull Requests
                        </Typography>
                        <Typography variant="h5" component="div">
                          {currentCourse
                            ? currentCourse.stats.github.totalPRs
                            : 0}
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
                          {currentCourse
                            ? currentCourse.lowActiveStudents?.length || 0
                            : 0}
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
                    Team Commits Comparison
                  </Typography>
                  <Box sx={{ height: 300, pt: 2 }}>
                    <BarChart
                      series={getTeamCommitsData().datasets}
                      xAxis={[
                        {
                          data: getTeamCommitsData().labels,
                          scaleType: "band",
                        },
                      ]}
                      height={250}
                      colors={["#1976d2"]}
                      tooltip={{ trigger: "item" }}
                      slotProps={{
                        legend: {
                          direction: "row",
                          position: {
                            vertical: "bottom",
                            horizontal: "middle",
                          },
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
                          data: getActivityDistribution()
                            .data.map((value, index) => ({
                              value,
                              label: getActivityDistribution().labels[index],
                              color: getActivityDistribution().colors[index],
                            }))
                            .filter((item) => item.value > 0), // Only include non-zero values
                          innerRadius: 30,
                          paddingAngle: 2,
                          cornerRadius: 4,
                        },
                      ]}
                      height={250}
                      margin={{ top: 10, bottom: 50, left: 20, right: 20 }}
                      tooltip={{ trigger: "item" }}
                      slotProps={{
                        legend: {
                          direction: "row",
                          position: {
                            vertical: "bottom",
                            horizontal: "middle",
                          },
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
                      <TableCell>Last Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentCourse?.teams.map((team) => {
                      // Get the most recent commit for this team
                      const lastActivity =
                        team.recentCommits && team.recentCommits.length > 0
                          ? new Date(team.recentCommits[0].author.date)
                          : null;

                      // Format the last activity date
                      const formattedLastActivity = lastActivity
                        ? lastActivity.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "No activity";

                      return (
                        <TableRow key={team._id}>
                          <TableCell>{team.name}</TableCell>
                          <TableCell>{team.memberCount}</TableCell>
                          <TableCell>{team.gitHubStats.commits}</TableCell>
                          <TableCell>{team.gitHubStats.issues}</TableCell>
                          <TableCell>{team.gitHubStats.prs}</TableCell>
                          <TableCell>{formattedLastActivity}</TableCell>
                        </TableRow>
                      );
                    })}
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
                    <Typography variant="h6">Low Active Students</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students with &lt;5% Contribution (
                      {lowActiveStudents.length})
                    </Typography>
                  </Box>
                  <List sx={{ overflow: "auto", maxHeight: 520 }}>
                    {currentCourse?.lowActiveStudents?.map((item) => (
                      <ListItem key={item.student._id}>
                        <ListItemAvatar>
                          <Avatar>{item.student.name.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="subtitle2">
                                {item.student.name}
                              </Typography>
                              <Box
                                sx={{
                                  ml: 1,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.75rem",
                                  bgcolor: "error.100",
                                  color: "error.700",
                                }}
                              >
                                Low Activity
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
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Commits: {item.commits} /{" "}
                                  {item.teamTotalCommits}
                                </Typography>
                                <Typography variant="body2" color="error.main">
                                  {item.commitPercentage.toFixed(1)}%
                                </Typography>
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Team: {item.team.name} • GitHub:{" "}
                                {item.student.githubId || "Not linked"}
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
                    {currentCourse?.recentCommits?.map((commit, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar src={commit.author.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <Box component="span" sx={{ fontWeight: 600 }}>
                                {commit.author.name}
                              </Box>{" "}
                              committed: {commit.message.split("\n")[0]}
                            </Typography>
                          }
                          secondary={
                            <>
                              {new Date(commit.author.date).toLocaleString()} •{" "}
                              {commit.team.name}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        )}
      </Box>
    </Box>
  );
}
