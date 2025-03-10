import mongoose from 'mongoose'
import User, { UserRole } from '../models/user'
import Student from '../models/student'
import Course from '../models/course'
import Team from '../models/team'
import Setting from '../models/setting'
import { config } from '../config'
import bcrypt from 'bcrypt'

const initializeDb = async () => {
  try {
    await mongoose.connect(config.mongodb.uri)
    console.log('Connected to MongoDB')

    // Clear all related collections data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Student.deleteMany({}),
      Team.deleteMany({}),
      Setting.deleteMany({})
    ])
    console.log('Cleared existing data')

    // Create default settings
    await Setting.create({
      tokenExpiry: 24,
      aiEndpoint: 'https://api.openai.com/v1',
      aiToken: '', // Default empty, user needs to set
      aiModel: 'gpt-4'
    })
    console.log('Created default settings')

    // Create users
    const users = await User.create([
      {
        name: 'Dr. Wong, Jane',
        email: 'jane.wong@example.com',
        password: 'password123',
        role: UserRole.LECTURER
      },
      {
        name: 'Mr. Lee, John',
        email: 'john.lee@example.com',
        password: 'password123',
        role: UserRole.TUTOR
      },
      {
        name: 'Ms. Zhang, Lucy',
        email: 'lucy.zhang@example.com',
        password: 'password123',
        role: UserRole.ASSISTANT
      }
    ])

    // Create students
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

    // Create courses and assign teachers
    const courses = await Course.create([
      {
        name: 'COMP3421 - Software Engineering',
        code: 'COMP3421',
        description: 'Learn modern software engineering principles and practices',
        teachers: [users[0]._id], // Jane Wong as lecturer
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        status: 'active'
      },
      {
        name: 'COMP2432 - Operating Systems',
        code: 'COMP2432',
        description: 'Understanding operating system concepts and implementation',
        teachers: [users[0]._id, users[1]._id], // Jane Wong and John Lee
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        status: 'active'
      }
    ])

    // Create teams
    await Team.insertMany([
      {
        name: 'Team Alpha',
        repositoryUrl: 'https://github.com/qqv/cpt_edu/',
        inviteCode: Math.random().toString(36).substring(2, 10),
        members: [
          { userId: students[0]._id, role: 'leader' },
          { userId: students[1]._id, role: 'member' },
          { userId: students[2]._id, role: 'member' },
          { userId: students[3]._id, role: 'member' },
        ],
        course: courses[0]._id
      },
      {
        name: 'Team Beta',
        repositoryUrl: 'https://github.com/comp3421-2024/team-beta',
        inviteCode: Math.random().toString(36).substring(2, 10),
        members: [
          { userId: students[4]._id, role: 'leader' },
          { userId: students[5]._id, role: 'member' }
        ],
        course: courses[1]._id
      }
    ])

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    await mongoose.disconnect()
  }
}

initializeDb() 