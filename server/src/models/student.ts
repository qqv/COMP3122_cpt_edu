import { Schema, model } from 'mongoose'

interface IStudent {
  name: string
  email: string
  githubId: string
}

const studentSchema = new Schema<IStudent>({
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
  }
}, {
  timestamps: true
})

export default model<IStudent>('Student', studentSchema) 