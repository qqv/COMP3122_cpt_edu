import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ITeam extends Document {
  name: string
  // description: string
  repositoryUrl: string
  members: {
    userId: Types.ObjectId
    role: 'leader' | 'member'
  }[]
  course: mongoose.Types.ObjectId
  inviteCode: string
  createdAt: Date
  updatedAt: Date
}

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    // description: String,
    repositoryUrl: {
      type: String,
      default: ''
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true
        },
        role: {
          type: String,
          enum: ['leader', 'member'],
          default: 'member'
        }
      }
    ],
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    inviteCode: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<ITeam>('Team', teamSchema) 