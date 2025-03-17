import { Request, Response, NextFunction } from 'express'
import Course from '../models/course'
import { AppError } from '../middleware/error'

// Mock data for GitHub stats - in a real app, this would connect to GitHub API
const fetchGitHubStats = async (courseId: string) => {
  // This would be replaced with actual GitHub API calls using the GitHub token
  return {
    totalCommits: Math.floor(Math.random() * 1000),
    totalIssues: Math.floor(Math.random() * 100),
    totalPullRequests: Math.floor(Math.random() * 50),
    issueBreakdown: {
      open: Math.floor(Math.random() * 30),
      closed: Math.floor(Math.random() * 70)
    },
    prBreakdown: {
      open: Math.floor(Math.random() * 15),
      merged: Math.floor(Math.random() * 25),
      closed: Math.floor(Math.random() * 10)
    }
  }
}

export const getCourseStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params
    
    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return next(new AppError('Course not found', 404))
    }
    
    // Fetch GitHub statistics
    const gitHubStats = await fetchGitHubStats(courseId)
    
    // Get course details
    const courseDetails = {
      _id: course._id,
      name: course.name,
      code: course.code,
      description: course.description,
      startDate: course.startDate,
      endDate: course.endDate,
      status: course.status
    }
    
    // Return combined data
    res.status(200).json({
      status: 'success',
      data: {
        course: courseDetails,
        stats: gitHubStats
      }
    })
  } catch (error) {
    next(new AppError(`Error fetching course stats: ${error.message}`, 500))
  }
}
