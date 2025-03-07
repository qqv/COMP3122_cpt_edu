import { Schema, model } from 'mongoose'

interface IUser {
  name: string
  email: string
  githubId: string
  role: 'teacher' | 'student'
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    default: 'student'
  }
}, {
  timestamps: true
})

export default model<IUser>('User', userSchema) 