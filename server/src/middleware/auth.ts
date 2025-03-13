import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';
import User, { UserRole } from '../models/user';

// Debug mode: set to false to use real authentication
const DEBUG_MODE = false;
const DEBUG_USER = {
  _id: 'debug123',
  name: 'Debug Lecturer',
  email: 'lecturer@example.com',
  role: UserRole.LECTURER
};

// Extend Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If in debug mode, skip authentication
    if (DEBUG_MODE) {
      req.user = DEBUG_USER;
      return next();
    }
    
    // Get token from cookie or Authorization header
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.active) {
      return next(new AppError('User not found or inactive', 401));
    }
    
    // Add user information to request object
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const roleMiddleware = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // If in debug mode, and debug user role is in allowed roles list, then allow access
    if (DEBUG_MODE && roles.includes(DEBUG_USER.role)) {
      return next();
    }
    
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
}; 