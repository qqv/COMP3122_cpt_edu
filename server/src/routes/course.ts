import { Router } from 'express'
import Course from '../models/course'
import Team from '../models/team'
import { authMiddleware, roleMiddleware } from '../middleware/auth'
import { UserRole } from '../models/user'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

const router = Router()

// Get all courses
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all courses
    const courses = await Course.find().populate('teachers', 'name email role').lean()
    
    // Get all teams
    const teams = await Team.find().lean()
    
    // Calculate the number of teams and students for each course
    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      // Find all teams that belong to this course
      const courseTeams = teams.filter(team => 
        team.course && team.course.toString() === course._id.toString()
      )
      
      // Calculate the number of teams
      const teamsCount = courseTeams.length
      
      // Calculate the number of students (unique)
      const uniqueStudentIds = new Set()
      courseTeams.forEach(team => {
        team.members.forEach(member => {
          uniqueStudentIds.add(member.userId.toString())
        })
      })
      
      return {
        ...course,
        teams: teamsCount,
        students: uniqueStudentIds.size
      }
    }))
    
    res.status(200).json(coursesWithStats)
  } catch (error) {
    console.error('Error fetching courses:', error)
    next(new AppError('Failed to fetch courses', 500))
  }
})

// Get a single course
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findById(req.params.id).populate('teachers', 'name email role')
    
    if (!course) {
      return next(new AppError('Course not found', 404))
    }
    
    // Get all teams that belong to this course
    const teams = await Team.find({ course: course._id }).lean()
    
    // Calculate the number of students (unique)
    const uniqueStudentIds = new Set()
    teams.forEach(team => {
      team.members.forEach(member => {
        uniqueStudentIds.add(member.userId.toString())
      })
    })
    
    const courseWithStats = {
      ...course.toObject(),
      teams: teams.length,
      students: uniqueStudentIds.size,
      teamsList: teams
    }
    
    res.status(200).json(courseWithStats)
  } catch (error) {
    next(new AppError('Failed to fetch course', 500))
  }
})

// Create a course (only for lecturers)
router.post('/', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, description, startDate, endDate } = req.body;
    
    if (!name || !code || !startDate || !endDate) {
      return next(new AppError('Course name, code, start date and end date are required', 400));
    }
    
    // Check if the course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return next(new AppError('Course code already exists', 400));
    }
    
    const course = new Course({
      name,
      code,
      description: description || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdAt: new Date()
    });
    
    await course.save();
    
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    next(new AppError('Failed to create course', 500));
  }
});

// Update a course (only for lecturers)
router.put('/:id', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, description, teachers } = req.body
    
    // If the course code is updated, check if it conflicts with another course
    if (code) {
      const existingCourse = await Course.findOne({ code, _id: { $ne: req.params.id } })
      if (existingCourse) {
        return next(new AppError('Course code already exists', 400))
      }
    }
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code, description, teachers },
      { new: true, runValidators: true }
    )
    
    if (!course) {
      return next(new AppError('Course not found', 404))
    }
    
    res.status(200).json({
      message: 'Course updated successfully',
      course
    })
  } catch (error) {
    next(new AppError('Failed to update course', 500))
  }
})

// Delete a course (only for lecturers)
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    
    if (!course) {
      return next(new AppError('Course not found', 404))
    }
    
    res.status(200).json({
      message: 'Course deleted successfully'
    })
  } catch (error) {
    next(new AppError('Failed to delete course', 500))
  }
})

// Assign teachers to a course (only for lecturers)
router.post('/:id/assign-teachers', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teachers } = req.body
    
    if (!teachers || !Array.isArray(teachers)) {
      return next(new AppError('Teachers array is required', 400))
    }
    
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return next(new AppError('Course not found', 404))
    }
    
    course.teachers = teachers
    await course.save()
    
    res.status(200).json({
      message: 'Teachers assigned successfully',
      teachers: course.teachers
    })
  } catch (error) {
    next(new AppError('Failed to assign teachers', 500))
  }
})

// Get teams for a course
router.get('/:courseId/teams', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.find({ course: req.params.courseId })
      .populate({
        path: 'members.userId',
        select: 'name githubId'
      })
      .lean();
    
    res.json(teams);
  } catch (error) {
    next(new AppError('Failed to fetch teams for course', 500));
  }
});

export default router 