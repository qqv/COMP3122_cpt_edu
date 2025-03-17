import { Router } from "express";
import Course from "../models/course";
import Team from "../models/team";
import { AppError } from "../middleware/error";
import { GitHubService } from "../services/github.service";

const router = Router();

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

        // Get GitHub stats for all teams in this course
        let totalCommits = 0;
        let totalIssues = 0;
        let totalPRs = 0;
        let activeRepos = 0;

        // Process teams with GitHub stats
        const teamsWithStats = await Promise.all(
          courseTeams.map(async (team) => {
            let teamStats = {
              _id: team._id,
              name: team.name,
              repositoryUrl: team.repositoryUrl,
              memberCount: team.members.length,
              inviteCode: team.inviteCode,
              gitHubStats: {
                commits: 0,
                issues: 0,
                prs: 0,
                exists: false
              }
            };

            // Only process teams with repository URLs
            if (team.repositoryUrl && team.repositoryUrl.includes('github.com')) {
              try {
                const [owner, repo] = team.repositoryUrl
                  .replace('https://github.com/', '')
                  .split('/');
                
                if (owner && repo) {
                  const stats = await GitHubService.getRepoStats(owner, repo);
                  
                  teamStats.gitHubStats = {
                    commits: stats.commits || 0,
                    issues: stats.issues || 0,
                    prs: stats.prs || 0,
                    exists: stats.exists || false
                  };
                  
                  if (stats.exists) {
                    totalCommits += stats.commits || 0;
                    totalIssues += stats.issues || 0;
                    totalPRs += stats.prs || 0;
                    activeRepos++;
                  }
                }
              } catch (error) {
                console.error(`Error fetching GitHub stats for team ${team.name}:`, error);
              }
            }
            
            return teamStats;
          })
        );

        return {
          ...course,
          stats: {
            teams: teamsCount,
            students: uniqueStudentIds.size,
            github: {
              totalCommits,
              totalIssues,
              totalPRs,
              activeRepos
            }
          },
          // Add the teams with GitHub stats for this course to the response
          teams: teamsWithStats,
        };
      })
    );

    res.status(200).json({
      status: "success
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(`Error fetching courses stats: ${error.message}`, 500));
    } else {
      next(new AppError("Unknown error", 500));
    }
  }
});

export default router;
