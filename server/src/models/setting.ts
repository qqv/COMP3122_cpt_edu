import mongoose, { Schema, Document } from 'mongoose'

export interface ISetting extends Document {
  tokenExpiry: number;  // Token expiry time in hours
  aiEndpoint: string;   // AI API endpoint
  aiToken: string;      // AI API token (encrypted)
  aiModel: string;      // AI model to use
  updatedAt: Date;
}

const settingSchema = new Schema({
  tokenExpiry: {
    type: Number,
    default: 24,  // Default 24 hours
    min: 1,
    max: 720     // Max 30 days
  },
  aiEndpoint: {
    type: String,
    default: 'https://api.openai.com/v1'
  },
  aiToken: {
    type: String,
    default: ''
  },
  aiModel: {
    type: String,
    default: 'gpt-4'
  }
}, {
  timestamps: true
})

export default mongoose.model<ISetting>('Setting', settingSchema) 