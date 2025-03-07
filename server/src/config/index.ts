import dotenv from 'dotenv'
dotenv.config()

export const config = {
  server: {
    port: process.env.PORT || 5000
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/project-tracker'
  },
  github: {
    token: process.env.GITHUB_TOKEN
  }
}

// 添加配置验证
if (!config.github.token) {
  console.error('Missing GITHUB_TOKEN in environment variables')
} 