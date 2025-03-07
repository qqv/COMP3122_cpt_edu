import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  status: string

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  }

  console.error('Error:', err)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
} 