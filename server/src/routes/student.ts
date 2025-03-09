import { Router } from 'express'
import Student from '../models/student'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/error'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const students = await Student.find()
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' })
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.id).lean()
    if (!student) {
      return next(new AppError('Student not found', 404))
    }
    res.status(200).json(student)
  } catch (error) {
    next(new AppError('Error fetching student', 500))
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const student = new Student(req.body)
    await student.save()
    res.status(201).json(student)
  } catch (error) {
    res.status(400).json({ message: 'Error creating student' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json(student)
  } catch (error) {
    res.status(400).json({ message: 'Error updating student' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student' })
  }
})

// 搜索学生
router.post('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body
    
    if (!query || typeof query !== 'string') {
      return next(new AppError('Search query is required', 400))
    }
    
    // 使用正则表达式进行不区分大小写的搜索
    const searchRegex = new RegExp(query, 'i')
    
    // 搜索名称或邮箱匹配的学生
    const students = await Student.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    }).limit(10).lean()
    
    res.status(200).json(students)
  } catch (error) {
    next(new AppError('Error searching students', 500))
  }
})

export default router 