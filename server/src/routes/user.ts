import { Router } from 'express'
import { validateUser } from '../middleware/validation'
import User, { UserRole } from '../models/user'
import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { authMiddleware, roleMiddleware } from '../middleware/auth'
import { AppError } from '../middleware/error'
import Course from '../models/course'
import mongoose from 'mongoose'

const router = Router()

// Get all users
router.get('/', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First get all courses
    const courses = await Course.find().lean();
    console.log('Fetched courses:', courses);
    
    // Get all users
    const users = await User.find()
      .select('-password')
      .lean();
    console.log('Fetched users:', users);
    
    // Add courses that the user is a teacher for to each user
    const usersWithCourses = users.map(user => ({
      ...user,
      courses: courses.filter(course => 
        // Check if the user is a teacher for the course
        (course.teachers && course.teachers.some(teacherId => 
          teacherId.toString() === user._id.toString()
        ))
      )
    }));
    console.log('Users with courses:', usersWithCourses);

    res.status(200).json(usersWithCourses);
  } catch (error) {
    console.error('Error in fetch users:', error);
    if (error instanceof mongoose.Error) {
      next(new AppError(`Failed to fetch users: ${error.message}`, 500));
    } else {
      next(new AppError('Failed to fetch users', 500));
    }
  }
});

// Get a single user
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user basic information
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get all courses that the user is a teacher for
    const userCourses = await Course.find({
      teachers: user._id
    }).lean();

    // Add course information to user object
    const userWithCourses = {
      ...user,
      courses: userCourses
    };

    res.json(userWithCourses);
  } catch (error) {
    next(new AppError('Failed to fetch user', 500));
  }
});

// Create a new user (only for lecturers)
router.post('/', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, courses } = req.body
    
    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(new AppError('Email already in use', 400))
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password: password || crypto.randomBytes(8).toString('hex'), // Generate random password
      role,
      courses: courses || []
    })
    
    await user.save()
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })
  } catch (error) {
    next(new AppError('Failed to create user', 500))
  }
})

// Update user (only for lecturers)
router.put('/:id', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, courses, active } = req.body
    
    // Do not allow updating password through this route
    if (req.body.password) {
      delete req.body.password
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, courses, active },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return next(new AppError('User not found', 404))
    }
    
    res.status(200).json(user)
  } catch (error) {
    next(new AppError('Failed to update user', 500))
  }
})

// Reset user password (only for lecturers)
router.post('/:id/reset-password', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters', 400));
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Update password directly
    user.password = newPassword;
    
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(new AppError('Failed to reset password', 500));
  }
});

// User reset password
router.post('/reset-password/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body
    
    if (!password || password.length < 8) {
      return next(new AppError('Password must be at least 8 characters', 400))
    }
    
    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')
    
    // Find valid reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    })
    
    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400))
    }
    
    // Update password and clear reset token
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    
    await user.save()
    
    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    next(new AppError('Failed to reset password', 500))
  }
})

// Assign courses to user
router.post('/:id/assign-courses', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courses } = req.body;
    const userId = req.params.id;

    if (!courses || !Array.isArray(courses)) {
      return next(new AppError('Courses array is required', 400));
    }

    // Update teachers array for all related courses
    await Course.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { teachers: userId } }
    );

    // Remove user from unselected courses
    await Course.updateMany(
      { _id: { $nin: courses } },
      { $pull: { teachers: userId } }
    );

    // Get updated course list
    const updatedCourses = await Course.find({
      teachers: userId
    }).lean();

    res.status(200).json({
      message: 'Courses assigned successfully',
      courses: updatedCourses
    });
  } catch (error) {
    next(new AppError('Failed to assign courses', 500));
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' })
  }
})

export default router 