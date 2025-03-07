import { Schema, model } from 'mongoose'

interface IUser {
  name: string
  email: string
  password: string
  role: 'lecturer' | 'tutor' | 'assistant'
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
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['lecturer', 'tutor', 'assistant'],
    default: 'lecturer'
  }
}, {
  timestamps: true
})

export default model<IUser>('User', userSchema) 