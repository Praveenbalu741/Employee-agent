# Employee Feedback Agent 🎯

An AI-powered employee feedback management system built with React, Express, and MongoDB. Features real-time sentiment analysis, dashboard analytics, and intelligent feedback categorization powered by Anthropic Claude AI.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.7-blue.svg)

## ✨ Features

- **AI-Powered Analysis**: Automatic sentiment scoring and theme extraction using Claude AI
- **Real-time Dashboard**: Interactive charts and analytics for managers
- **Role-based Access**: Separate interfaces for employees and managers
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Anonymous Feedback**: Optional anonymous submission for employees
- **Urgent Flag Detection**: AI identifies critical feedback requiring immediate attention

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 8** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **React Router 7** - Client-side routing
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Anthropic Claude AI** - Sentiment analysis
- **Winston** - Logging
- **Helmet** - Security headers

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Praveenbalu741/Employee-agent.git
cd Employee-agent
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (choose one option)
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/employee-feedback-agent

# Option 2: MongoDB Atlas (recommended)
# MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/employee-feedback?retryWrites=true&w=majority

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Anthropic Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Email (optional - for notifications)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@employeefeedback.com

# Frontend Origin
CLIENT_ORIGIN=http://localhost:5173
```

#### Frontend Configuration

Create `frontend/.env` file:

```env
VITE_API_SERVER=http://localhost:5000
VITE_API_BASE_URL=/api
```

### 4. Start Development Servers

#### Option 1: Start Both Servers Separately

**Terminal 1 - Backend:**
```bash
npm start
# or for development with auto-reload
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Windows PowerShell Script (Frontend)

```powershell
cd frontend
powershell -ExecutionPolicy Bypass -File start-dev.ps1
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### 6. Login with Demo Accounts

The application seeds default accounts in development mode:

**Employee Account:**
- Email: `employee@example.com`
- Password: `Password123!`

**Manager Account:**
- Email: `manager@example.com`
- Password: `Password123!`

## 📁 Project Structure

```
employee-agent/
├── backend/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   ├── logger.js         # Winston logger setup
│   │   └── seeder.js         # Development data seeding
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth, validation, error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── services/
│   │   ├── aiService.js      # Claude AI integration
│   │   └── emailService.js   # Email notifications
│   ├── .env                  # Environment variables (create this)
│   └── server.js             # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context (auth, etc.)
│   │   ├── utils/            # Helper functions
│   │   └── App.jsx           # Main app component
│   ├── public/               # Static assets
│   ├── .env                  # Frontend environment variables
│   ├── vite.config.js        # Vite configuration
│   └── package.json
├── package.json              # Backend dependencies
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Feedback
- `POST /api/feedback` - Submit feedback (requires auth)
- `GET /api/feedback` - Get user's feedback (requires auth)
- `GET /api/feedback/:id` - Get single feedback (requires auth)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (manager only)
- `GET /api/dashboard/trends` - Get sentiment trends (manager only)
- `GET /api/dashboard/feedback` - Get all feedback (manager only)

### Settings
- `GET /api/settings` - Get app settings (manager only)
- `PUT /api/settings` - Update settings (manager only)

### Health
- `GET /api/health` - Server health check

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication with refresh tokens
- HTTP-only cookies for token storage
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation with Joi
- MongoDB injection prevention

## 🎨 UI Features

- Responsive design for mobile, tablet, and desktop
- Dark mode ready
- Smooth animations with Framer Motion
- Toast notifications for user feedback
- Loading states and error handling
- Accessibility compliant

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free M0 cluster
3. Create database user with read/write permissions
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string and add to `backend/.env`

### Option 2: Local MongoDB

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use default connection string in `backend/.env`

### Option 3: In-Memory Database (Development Only)

If MongoDB is not available, the backend automatically falls back to `mongodb-memory-server`. Data is lost on server restart.

## 📊 AI Integration

The application uses Anthropic's Claude AI for:

- **Sentiment Scoring**: -1.0 (negative) to +1.0 (positive)
- **Theme Extraction**: Automatic categorization
- **Urgent Detection**: Flags critical issues
- **Summary Generation**: Concise feedback summaries

### Supported Themes:
- Workload
- Management
- Culture
- Compensation
- Work-life balance
- Career growth
- Team dynamics
- Communication
- Recognition
- Tools & resources
- Safety

## 🛠️ Development

### Backend Development

```bash
# Start with nodemon (auto-reload)
npm run dev

# Run linter
npm run lint
```

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📦 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in environment
2. Use production MongoDB URI
3. Set secure JWT secrets
4. Configure SMTP for email notifications
5. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - AWS EC2
   - DigitalOcean

### Frontend Deployment

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

### Environment Variables for Production

Update `VITE_API_SERVER` in frontend `.env` to your production API URL.

## 🐛 Troubleshooting

### Frontend won't start
- **PowerShell execution policy**: Run `powershell -ExecutionPolicy Bypass -File start-dev.ps1`
- **Port 5173 in use**: Change port in `vite.config.js`

### Backend connection issues
- **MongoDB not connecting**: Check `MONGODB_URI` in `.env`
- **Port 5000 in use**: Change `PORT` in `.env`

### AI analysis not working
- **Invalid API key**: Verify `ANTHROPIC_API_KEY` in `.env`
- **Fallback mode**: App returns neutral sentiment if AI fails

### Authentication errors
- **Token expired**: Refresh token endpoint handles this automatically
- **CORS errors**: Check `CLIENT_ORIGIN` in backend `.env`

## 📝 License

ISC License - feel free to use this project for learning and development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- [Anthropic Claude AI](https://www.anthropic.com/) for sentiment analysis
- [MongoDB](https://www.mongodb.com/) for database
- [Vite](https://vite.dev/) for blazing fast development
- [React](https://react.dev/) for UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Made with ❤️ for better workplace feedback**
