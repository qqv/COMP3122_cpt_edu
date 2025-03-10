import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { config } from './config'
import { errorHandler } from './middleware/error'
import './utils/warnings'
import cookieParser from 'cookie-parser'

import userRoutes from './routes/user'
import teamRoutes from './routes/team'
import courseRoutes from './routes/course'
import analyticsRoutes from './routes/analytics'
import studentRoutes from './routes/student'
import authRoutes from './routes/auth'
import settingRoutes from './routes/setting'
import aiRoutes from './routes/ai'

dotenv.config()

// 禁用 punycode 警告
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('punycode')) {
    return
  }
  console.warn(warning)
})

// 在应用启动时检查必要的环境变量
const requiredEnvVars = ['GITHUB_TOKEN', 'MONGODB_URI']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  process.exit(1)
}

const app = express()

// Middleware
// 允许多个源
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',  // Vite 默认端口
  'http://localhost:4173'   // Vite preview 端口
]

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（比如开发工具或 Postman）
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

// Database connection
mongoose.connect(config.mongodb.uri, {
  // 不再需要 useNewUrlParser 和 useUnifiedTopology
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/ai', aiRoutes)

// Error handling
app.use(errorHandler)

// Start server
const PORT = config.server.port || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app 