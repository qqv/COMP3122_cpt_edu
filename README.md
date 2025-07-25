# cpt_edu
Collaborative Project Tracker
# Collaborative Project Tracker

A web application to help instructors track student group projects and collaboration through GitHub Classroom integration.

## Overview

This application helps instructors monitor student group activities and contributions in GitHub-based course projects. It provides insights through dashboards and analytics about team progress and individual participation.

## Features

- **Team Progress Tracking**
  - Commit frequency analysis
  - Project board monitoring
  - Issue and PR tracking
  - Code contribution metrics
  - Milestone completion rates

- **Individual Performance Analytics**
  - Student contribution patterns
  - Participation metrics
  - Task completion rates
  - Collaboration indicators

- **Dashboard & Reporting**
  - Visual analytics
  - Exportable reports
  - Real-time activity feeds
  - Customizable metrics

## Tech Stack

### Frontend
- React.js
- Material UI
- Chart.js (for analytics visualization)
- React Query (for data fetching)

### Backend
- Node.js
- Express.js
- MongoDB (for data storage)
- GitHub API integration

## Project Structure

```
collaborative-project-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
│
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── config/            # Configuration files
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- GitHub Account with API access

### Installation

1. Clone the repository
```bash
git clone https://github.com/qqv/cpt_edu.git
cd cpt_edu
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd server
npm install

# Initialize MongoDB
npm run init-db
```

4. Create environment variables (.env)
```bash
# In server/.env
MONGODB_URI=your_mongodb_uri
GITHUB_TOKEN=your_github_token
PORT=5000
NODE_ENV=development

# In client/.env
REACT_APP_API_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api 
```

5. Start the development servers
```bash
# Start backend (from server directory)
cd ./client
npm run dev

# Start frontend (from client directory)
cd ./server
npm run dev
```

## Contributing

### Add a new branch (Optional)
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
