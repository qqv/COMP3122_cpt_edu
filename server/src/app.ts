import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { config } from './config'

import userRoutes from './routes/user'
import teamRoutes from './routes/team'
import courseRoutes from './routes/course'
import analyticsRoutes from './routes/analytics'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())

// Database connection
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/analytics', analyticsRoutes)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`)
}) 