import mongoose, { Schema, Document } from 'mongoose'

export interface ICourse extends Document {
  name: string;
  code: string;
  description?: string;
  teachers: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  status: string;
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
    trim: true
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
})

export default mongoose.model<ICourse>('Course', courseSchema) 