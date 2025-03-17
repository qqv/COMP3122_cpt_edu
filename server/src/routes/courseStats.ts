import { Router } from "express";
import Course from "../models/course";
import Team from "../models/team";
import { AppError } from "../middleware/error";

const router = Router();

// Mock data for GitHub stats - in a real app, this would connect to GitHub API
const fetchGitHubStats = async (courseId: string) => {
  // This would be replaced with actual GitHub API calls using the GitHub token
  return {
    totalCommits: Math.floor(Math.random() * 1000),
    totalIssues: Math.floor(Math.random() * 100),
    totalPullRequests: Math.floor(Math.random() * 50),
    issueBreakdown: {
      open: Math.floor(Math.random() * 30),
      closed: Math.floor(Math.random() * 70),
    },
    prBreakdown: {
      open: Math.floor(Math.random() * 15),
      merged: Math.floor(Math.random() * 25),
      closed: Math.floor(Math.random() * 10),
    },
  };
};

router.get("/all", async (req, res, next) => {
  try {
    // Get all courses
    const courses = await Course.find()
      .populate("teachers", "name email role")
      .lean();

    // Get all teams
    const teams = await Team.find().lean();

    // Calculate the number of teams and students for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Find all teams that belong to this course
        const courseTeams = teams.filter(
          (team) =>
            team.course && team.course.toString() === course._id.toString()
        );

        // Calculate the number of teams
        const teamsCount = courseTeams.length;

        // Calculate the number of students (unique)
        const uniqueStudentIds = new Set();
        courseTeams.forEach((team) => {
          team.members.forEach((member) => {
            uniqueStudentIds.add(member.userId.toString());
          });
        });

        return {
          ...course,
          stats: {
            teams: teamsCount,
            students: uniqueStudentIds.size,
          },
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: coursesWithStats,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(`Error fetching courses stats: ${error.message}`, 500));
    } else {
      next(new AppError("Unknown error", 500));
    }
  }
});

router.get("/:courseId", async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    // Fetch GitHub statistics
    const gitHubStats = await fetchGitHubStats(courseId);

    // Get course details
    const courseDetails = {
      _id: course._id,
      name: course.name,
      code: course.code,
      description: course.description,
      startDate: course.startDate,
      endDate: course.endDate,
      status: course.status,
    };

    // Return combined data
    res.status(200).json({
      status: "success",
      data: {
        course: courseDetails,
        stats: gitHubStats,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(`Error fetching course stats: ${error.message}`, 500));
    } else {
      next(new AppError("Unknown error", 500));
    }
  }
});

export default router;
