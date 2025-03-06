import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'

export const validateUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('githubId').trim().notEmpty().withMessage('GitHub ID is required'),
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
] 