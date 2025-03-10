import { Router } from 'express'
import Course from '../models/course'
import { authMiddleware, roleMiddleware } from '../middleware/auth'
import { UserRole } from '../models/user'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

// 获取所有课程
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await Course.find().populate('teachers', 'name email role').lean()
    res.status(200).json(courses)
  } catch (error) {
    next(new AppError('Failed to fetch courses', 500))
  }
})

// 获取单个课程
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findById(req.params.id).populate('teachers', 'name email role')
    
    if (!course) {
      return next(new AppError('Course not found', 404))
    }
    
    res.status(200).json(course)
  } catch (error) {
    next(new AppError('Failed to fetch course', 500))
  }
})

// 创建课程 (仅限讲师)
router.post('/', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, description, startDate, endDate } = req.body;
    
    if (!name || !code || !startDate || !endDate) {
      return next(new AppError('Course name, code, start date and end date are required', 400));
    }
    
    // 检查课程代码是否已存在
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

// 更新课程 (仅限讲师)
router.put('/:id', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, description, teachers } = req.body
    
    // 如果更新了课程代码，检查是否与其他课程冲突
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

// 删除课程 (仅限讲师)
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

// 分配教师到课程 (仅限讲师)
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

export default router 