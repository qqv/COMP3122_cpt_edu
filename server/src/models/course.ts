import mongoose, { Schema, Document } from 'mongoose'

export interface ICourse extends Document {
  name: string;
  code: string;
  description?: string;
  teachers: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  status: string;
  createdAt: Date;
}

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.model<ICourse>('Course', courseSchema) 