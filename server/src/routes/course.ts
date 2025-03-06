import { Router } from 'express'
import Course from '../models/course'
import type { Request, Response } from 'express'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const courses = await Course.find().populate('teacher')
    res.json(courses)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher')
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.json(course)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const course = new Course(req.body)
    await course.save()
    res.status(201).json(course)
  } catch (error) {
    res.status(400).json({ message: 'Error creating course' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.json(course)
  } catch (error) {
    res.status(400).json({ message: 'Error updating course' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.json({ message: 'Course deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course' })
  }
})

export default router 