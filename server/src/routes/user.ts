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

// 获取所有用户
router.get('/', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 首先获取所有课程
    const courses = await Course.find().lean();
    console.log('Fetched courses:', courses);
    
    // 获取所有用户
    const users = await User.find()
      .select('-password')
      .lean();
    console.log('Fetched users:', users);
    
    // 为每个用户添加其作为教师的课程
    const usersWithCourses = users.map(user => ({
      ...user,
      courses: courses.filter(course => 
        // 检查  teachers 
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

// 获取单个用户
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 获取用户基本信息
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // 获取该用户作为教师的所有课程
    const userCourses = await Course.find({
      teachers: user._id
    }).lean();

    // 将课程信息添加到用户对象中
    const userWithCourses = {
      ...user,
      courses: userCourses
    };

    res.json(userWithCourses);
  } catch (error) {
    next(new AppError('Failed to fetch user', 500));
  }
});

// 创建新用户 (仅限讲师)
router.post('/', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, courses } = req.body
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(new AppError('Email already in use', 400))
    }
    
    // 创建新用户
    const user = new User({
      name,
      email,
      password: password || crypto.randomBytes(8).toString('hex'), // 生成随机密码
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

// 更新用户 (仅限讲师)
router.put('/:id', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, courses, active } = req.body
    
    // 不允许通过此路由更新密码
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

// 重置用户密码 (仅限讲师)
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
    
    // 直接更新密码
    user.password = newPassword;
    
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(new AppError('Failed to reset password', 500));
  }
});

// 用户重置密码
router.post('/reset-password/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body
    
    if (!password || password.length < 8) {
      return next(new AppError('Password must be at least 8 characters', 400))
    }
    
    // 哈希令牌
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')
    
    // 查找有效的重置令牌
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    })
    
    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400))
    }
    
    // 更新密码并清除重置令牌
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    
    await user.save()
    
    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    next(new AppError('Failed to reset password', 500))
  }
})

// 分配课程给用户
router.post('/:id/assign-courses', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courses } = req.body;
    const userId = req.params.id;

    if (!courses || !Array.isArray(courses)) {
      return next(new AppError('Courses array is required', 400));
    }

    // 更新所有相关课程的 teachers 数组
    await Course.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { teachers: userId } }
    );

    // 从未选中的课程中移除该用户
    await Course.updateMany(
      { _id: { $nin: courses } },
      { $pull: { teachers: userId } }
    );

    // 获取更新后的课程列表
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