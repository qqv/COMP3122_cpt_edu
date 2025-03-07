import mongoose from 'mongoose'
import User from '../models/user'
import Student from '../models/student'
import Course from '../models/course'
import Team from '../models/team'
import { config } from '../config'
import bcrypt from 'bcrypt'

const initializeDb = async () => {
  try {
    await mongoose.connect(config.mongodb.uri)
    console.log('Connected to MongoDB')

    // 完全删除集合，而不仅仅是文档
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    const collections = await db.listCollections().toArray()
    
    for (const collection of collections) {
      if (['users', 'students', 'teams', 'courses'].includes(collection.name)) {
        await db.dropCollection(collection.name)
        console.log(`Dropped collection: ${collection.name}`)
      }
    }

    // 创建用户（教师、助教等）
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash('admin123', saltRounds)

    const lecturer = await User.create({
      name: 'Dr. Wong, Jane',
      email: 'jane.wong@example.com',
      password: hashedPassword,
      role: 'lecturer'
    })

    const tutor = await User.create({
      name: 'Mr. Lee, John',
      email: 'john.lee@example.com',
      password: hashedPassword,
      role: 'tutor'
    })

    const assistant = await User.create({
      name: 'Ms. Zhang, Lucy',
      email: 'lucy.zhang@example.com',
      password: hashedPassword,
      role: 'assistant'
    })

    // 创建学生
    const students = await Student.insertMany([
      {
        name: 'Master, Fake',
        email: 'david.chan@example.com',
        githubId: 'qqv'
      },
      {
        name: 'Master, Real',
        email: 'sarah.wong@example.com',
        githubId: 'Chris12420'
      },
      {
        name: 'Master, Computing',
        email: 'jason.li@example.com',
        githubId: 'James030913'
      },
      {
        name: 'Master, AI',
        email: 'emily.chen@example.com',
        githubId: 'lyxsq99'
      },
      {
        name: 'Zhang, Michael',
        email: 'michael.zhang@example.com',
        githubId: 'mzhang-student'
      },
      {
        name: 'Wang, Alex',
        email: 'alex.wang@example.com',
        githubId: 'awang-student'
      }
    ])

    // 创建课程
    const course = await Course.create({
      name: 'COMP3421 - Software Engineering',
      description: 'Learn modern software engineering principles and practices',
      teacher: lecturer._id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      status: 'active'
    })

    // 创建团队
    await Team.insertMany([
      {
        name: 'Team Alpha',
        repositoryUrl: 'https://github.com/qqv/cpt_edu/',
        members: [
          { userId: students[0]._id, role: 'leader' },
          { userId: students[1]._id, role: 'member' },
          { userId: students[2]._id, role: 'member' },
          { userId: students[3]._id, role: 'member' },
        ],
        course: course._id
      },
      {
        name: 'Team Beta',
        repositoryUrl: 'https://github.com/comp3421-2024/team-beta',
        members: [
          { userId: students[4]._id, role: 'leader' },
          { userId: students[5]._id, role: 'member' }
        ],
        course: course._id
      }
    ])

    console.log('Database initialized successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initializeDb() 