import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export enum UserRole {
  LECTURER = 'lecturer',
  TA = 'ta',
  ASSISTANT = 'assistant',
  TUTOR = 'tutor'
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  lastLogin?: Date
  active: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.TUTOR
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Password hashing middleware
userSchema.pre('save', async function(next) {
  const user = this
  
  // Only rehash if password is modified
  if (!user.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<IUser>('User', userSchema) 