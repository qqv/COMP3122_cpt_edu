import { Router } from "express";
import Course from "../models/course";
import Team from "../models/team";
import Student from "../models/student";
import { AppError } from "../middleware/error";
import { GitHubService } from "../services/github.service";

// Define the Contributor interface
interface Contributor {
  githubId: string;
  commits: number;
  additions: number;
  deletions: number;
  lastCommit: string | null;
}

// Define the type for team stats with members array
interface TeamStats {
  _id: any;
  name: string;
  repositoryUrl: string;
  memberCount: number;
  inviteCode: string;
  gitHubStats: {
    commits: number;
    issues: number;
    prs: number;
    exists: boolean;
  };
  members: Array<{
    userId: string;
    role: "leader" | "member";
    user: any;
    contribution: any;
  }>;
  recentCommits?: Array<any>;
}

// Define the course stats interface
interface CourseWithStats {
  _id: any;
  name: string;
  code: string;
  description?: string;
  teachers: any[];
  startDate?: Date;
  endDate?: Date;
  status: string;
  createdAt: Date;
  stats: {
    teams: number;
    students: number;
    github: {
      totalCommits: number;
      totalIssues: number;
      totalPRs: number;
      activeRepos: number;
    };
  };
  teams: TeamStats[];
  recentCommits?: Array<any>;
  lowActiveStudents?: Array<{
    student: any;
    team: {
      id: any;
      name: string;
    };
    commitPercentage: number;
    commits: number;
    teamTotalCommits: number;
  }>;
}
// const contribution = contributors.find(
//   (c : Contributor) => c.githubId === studentInfo?.githubId
// ) || {
//   commits: 0,
//   additions: 0,
//   deletions: 0,
//   lastCommit: null,
// };

const router = Router();

router.get("/all", async (req, res, next) => {
  try {
    // Get all courses
    const courses = await Course.find()
      .populate("teachers", "name email role")
      .lean();

    // Get all teams with populated user data
    const teams = await Team.find().populate("members.userId").lean();

    // Get all students and create a map for quick lookup
    const students = await Student.find().lean();
    const studentMap = new Map();
    students.forEach((student) => {
      studentMap.set(student._id.toString(), student);
    });

    // Calculate the number of teams and students for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Find all teams that belong to this course
        const courseTeams = teams.filter(
          (team) =>
            team.course && team.course.toString() === course._id.toString()
        );
        console.log(courseTeams);
        // Calculate the number of teams
        const teamsCount = courseTeams.length;

        // Calculate the number of students (unique)
        const uniqueStudentIds = new Set();
        courseTeams.forEach((team) => {
          team.members.forEach((member) => {
            uniqueStudentIds.add(member.userId);
          });
        });

        // Get GitHub stats for all teams in this course
        let totalCommits = 0;
        let totalIssues = 0;
        let totalPRs = 0;
        let activeRepos = 0;

        // Array to collect all recent commits across teams in this course
        let allCourseCommits: any[] = [];

        // Array to collect low active students
        let lowActiveStudents: Array<{
          student: any;
          team: {
            id: any;
            name: string;
          };
          commitPercentage: number;
          commits: number;
          teamTotalCommits: number;
        }> = [];

        // Process teams with GitHub stats
        const teamsWithStats = await Promise.all(
          courseTeams.map(async (team) => {
            let teamStats: TeamStats = {
              _id: team._id,
              name: team.name,
              repositoryUrl: team.repositoryUrl,
              memberCount: team.members.length,
              inviteCode: team.inviteCode,
              gitHubStats: {
                commits: 0,
                issues: 0,
                prs: 0,
                exists: false,
              },
              members: [],
            };

            // Only process teams with repository URLs
            if (
              team.repositoryUrl &&
              team.repositoryUrl.includes("github.com")
            ) {
              try {
                const [owner, repo] = team.repositoryUrl
                  .replace("https://github.com/", "")
                  .split("/");

                if (owner && repo) {
                  try {
                    const stats = await GitHubService.getRepoStats(owner, repo);

                    // Get contributors data
                    const contributors =
                      await GitHubService.getRepoContributors(owner, repo);

                    // Get recent commits
                    const recentCommits = await GitHubService.getRecentCommits(
                      owner,
                      repo,
                      10
                    );

                    // Calculate total team commits
                    const teamTotalCommits = contributors.reduce(
                      (total, contributor) => total + contributor.commits,
                      0
                    );

                    // Add member details with contribution information
                    teamStats.members = team.members.map((member) => {
                      const userId = member.userId._id
                        ? member.userId._id.toString()
                        : member.userId.toString();
                      const studentInfo = studentMap.get(userId);

                      // Find the contribution information of the student
                      const contribution = contributors.find(
                        (c) => c.githubId === studentInfo?.githubId
                      ) || {
                        commits: 0,
                        additions: 0,
                        deletions: 0,
                        lastCommit: null,
                      };

                      // Calculate commit percentage for this student
                      const commitPercentage =
                        teamTotalCommits > 0
                          ? (contribution.commits / teamTotalCommits) * 100
                          : 0;

                      // Check if this is a low active student (less than 5% of team commits)
                      if (
                        teamTotalCommits > 0 &&
                        commitPercentage < 5 &&
                        studentInfo
                      ) {
                        lowActiveStudents.push({
                          student: studentInfo,
                          team: {
                            id: team._id,
                            name: team.name,
                          },
                          commitPercentage,
                          commits: contribution.commits,
                          teamTotalCommits,
                        });
                      }

                      return {
                        userId: userId,
                        role: member.role as "leader" | "member",
                        user: studentInfo,
                        contribution,
                        commitPercentage,
                      };
                    });

                    teamStats.gitHubStats = {
                      commits: stats.commits || 0,
                      issues: stats.issues || 0,
                      prs: stats.prs || 0,
                      exists: stats.exists || false,
                    };

                    // Add recent commits to team stats
                    teamStats.recentCommits = recentCommits;

                    // Add these commits to the course's collection with team info
                    if (recentCommits && recentCommits.length > 0) {
                      // Add team information to each commit
                      const commitsWithTeamInfo = recentCommits.map(
                        (commit) => ({
                          ...commit,
                          team: {
                            id: team._id,
                            name: team.name,
                          },
                        })
                      );

                      // Add to the course's collection
                      allCourseCommits = [
                        ...allCourseCommits,
                        ...commitsWithTeamInfo,
                      ];
                    }

                    if (stats.exists) {
                      totalCommits += stats.commits || 0;
                      totalIssues += stats.issues || 0;
                      totalPRs += stats.prs || 0;
                      activeRepos++;
                    }
                  } catch (githubError) {
                    console.error(
                      `GitHub API error for ${owner}/${repo}:`,
                      githubError
                    );
                    // Keep default values for gitHubStats
                  }
                }
              } catch (parseError) {
                console.error(
                  `Error parsing repository URL for team ${team.name}:`,
                  parseError
                );
              }
            }

            return teamStats;
          })
        );

        // Sort all commits by date (newest first)
        allCourseCommits.sort((a, b) => {
          const dateA = new Date(a.author.date).getTime();
          const dateB = new Date(b.author.date).getTime();
          return dateB - dateA; // Sort in descending order (newest first)
        });

        // Limit to most recent 20 commits for the course overview
        const recentCourseCommits = allCourseCommits.slice(0, 20);

        return {
          ...course,
          stats: {
            teams: teamsCount,
            students: uniqueStudentIds.size,
            github: {
              totalCommits,
              totalIssues,
              totalPRs,
              activeRepos,
            },
          },
          // Add the teams with GitHub stats for this course to the response
          teams: teamsWithStats,
          // Add recent commits for the entire course
          recentCommits: recentCourseCommits,
          // Add low active students
          lowActiveStudents: lowActiveStudents,
        };
      })
    );

    res.status(200).json({
      // status: "success",
      courses: coursesWithStats,
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
