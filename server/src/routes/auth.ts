import { Router } from 'express'
import User from '../models/user'
import jwt from 'jsonwebtoken'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

// 登录路由
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
    
    // 验证请求体
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400))
    }
    
    // 查找用户
    const user = await User.findOne({ email }).select('+password')
    
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401))
    }
    
    // 检查用户是否激活
    if (!user.active) {
      return next(new AppError('Your account is inactive. Please contact administrator.', 403))
    }
    
    // 生成 JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    )
    
    // 更新最后登录时间
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })
    
    // 设置 cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1天
    })
    
    // 发送响应
    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    next(new AppError('Login failed', 500))
  }
})

// 登出路由
router.post('/logout', (req: Request, res: Response) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({ status: 'success' })
})

// 获取当前用户信息
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从 cookie 或 Authorization 头获取令牌
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1])
    
    if (!token) {
      return next(new AppError('Not logged in', 401))
    }
    
    // 验证令牌
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // 查找用户
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user || !user.active) {
      return next(new AppError('User not found or inactive', 401))
    }
    
    res.status(200).json(user)
  } catch (error) {
    next(new AppError('Authentication failed', 401))
  }
})

export default router 