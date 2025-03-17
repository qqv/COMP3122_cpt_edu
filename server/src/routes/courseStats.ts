import express from 'express'
import { getCourseStats } from '../controllers/courseStats'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Route to get course statistics including GitHub data
router.get('/:courseId', authenticate, getCourseStats)

export default router
