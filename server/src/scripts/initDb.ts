import mongoose from 'mongoose'
import User from '../models/user'
import Course from '../models/course'
import Team from '../models/team'
import { config } from '../config'

const initializeDb = async () => {
  try {
    await mongoose.connect(config.mongodb.uri)
    console.log('Connected to MongoDB')

    // 清除现有数据
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Team.deleteMany({})
    ])

    // 创建教师用户
    const teacher = await User.create({
      name: 'Dr. Wong, Jane',
      email: 'jane.wong@example.com',
      githubId: 'jwong-teacher',
      role: 'teacher'
    })

    // 创建学生用户
    const students = await User.insertMany([
      {
        name: 'Chan, David',
        email: 'david.chan@example.com',
        githubId: 'dchan-student',
        role: 'student'
      },
      {
        name: 'Wong, Sarah',
        email: 'sarah.wong@example.com',
        githubId: 'swong-student',
        role: 'student'
      },
      {
        name: 'Li, Jason',
        email: 'jason.li@example.com',
        githubId: 'jli-student',
        role: 'student'
      },
      {
        name: 'Chen, Emily',
        email: 'emily.chen@example.com',
        githubId: 'echen-student',
        role: 'student'
      },
      {
        name: 'Zhang, Michael',
        email: 'michael.zhang@example.com',
        githubId: 'mzhang-student',
        role: 'student'
      },
      {
        name: 'Wang, Alex',
        email: 'alex.wang@example.com',
        githubId: 'awang-student',
        role: 'student'
      }
    ])

    // 创建课程
    const course = await Course.create({
      name: 'COMP3421 - Software Engineering',
      description: 'Learn modern software engineering principles and practices',
      teacher: teacher._id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      status: 'active'
    })

    // 创建团队
    await Team.insertMany([
      {
        name: 'Team Alpha',
        repositoryUrl: 'https://github.com/comp3421-2024/team-alpha',
        members: [
          { userId: students[0]._id, role: 'leader' },
          { userId: students[1]._id, role: 'member' },
          { userId: students[2]._id, role: 'member' }
        ],
        course: course._id
      },
      {
        name: 'Team Beta',
        repositoryUrl: 'https://github.com/comp3421-2024/team-beta',
        members: [
          { userId: students[3]._id, role: 'leader' },
          { userId: students[4]._id, role: 'member' },
          { userId: students[5]._id, role: 'member' }
        ],
        course: course._id
      }
      // ... 添加更多团队
    ])

    console.log('Database initialized successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initializeDb() 