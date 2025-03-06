export const config = {
  github: {
    token: process.env.GITHUB_TOKEN
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/project-tracker'
  },
  server: {
    port: process.env.PORT || 5000
  }
} 