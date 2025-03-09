import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';
import User, { UserRole } from '../models/user';

// 调试模式：可以设置为 false 来使用真实的身份验证
const DEBUG_MODE = false;
const DEBUG_USER = {
  _id: 'debug123',
  name: 'Debug Lecturer',
  email: 'lecturer@example.com',
  role: UserRole.LECTURER
};

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 如果处于调试模式，跳过身份验证
    if (DEBUG_MODE) {
      req.user = DEBUG_USER;
      return next();
    }
    
    // 从 cookie 或 Authorization 头获取令牌
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return next(new AppError('Authentication required', 401));
    }
    
    // 验证令牌
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.active) {
      return next(new AppError('User not found or inactive', 401));
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const roleMiddleware = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 如果处于调试模式，且调试用户角色在允许的角色列表中，则允许访问
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