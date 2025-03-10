import { Router } from 'express'
import User from '../models/user'
import jwt from 'jsonwebtoken'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

// Login route
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Validate request body
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400))
    }
    
    // Find user
    const user = await User.findOne({ email }).select('+password')
    
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401))
    }
    
    // Check if user is active
    if (!user.active) {
      return next(new AppError('Your account is inactive. Please contact administrator.', 403))
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    )
    
    // Update last login time
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    
    // Send response
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

// Logout route
router.post('/logout', (req: Request, res: Response) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({ status: 'success' })
})

// Get current user information
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1])
    
    if (!token) {
      return next(new AppError('Not logged in', 401))
    }
    
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Find user
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