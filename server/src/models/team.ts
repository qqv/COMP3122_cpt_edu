import { Schema, model, Types } from 'mongoose'

interface ITeam {
  name: string
  // description: string
  repositoryUrl: string
  members: Array<{
    userId: Types.ObjectId
    role: 'leader' | 'member'
  }>
  course: Types.ObjectId
}

const teamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: true
  },
  // description: String,
  repositoryUrl: {
    type: String,
    required: true
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    }
  }],
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
}, {
  timestamps: true
})

export default model<ITeam>('Team', teamSchema) 