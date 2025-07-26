# NeoBoard 🚀

A modern, full-stack message board application built with React, TypeScript, Node.js, and MongoDB. NeoBoard provides a sleek, responsive interface for creating boards, threads, and engaging in discussions.

![NeoBoard](https://img.shields.io/badge/NeoBoard-v1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## ✨ Features

### 🎯 Core Features
- **Modern UI/UX**: Clean, responsive design with dark theme and gradient accents
- **Real-time Discussions**: Create and participate in threaded conversations
- **Board Management**: Organize discussions into categorized boards
- **User Authentication**: Secure JWT-based authentication system
- **Anonymous Posting**: Support for both authenticated and anonymous users
- **Image Support**: Upload and share images in threads and posts
- **Mobile Responsive**: Optimized for all device sizes

### 🔧 Technical Features
- **Full-Stack TypeScript**: End-to-end type safety
- **RESTful API**: Well-structured backend with Express.js
- **Database Integration**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, and JWT authentication
- **Modern Build Tools**: Vite for fast development and building
- **Code Quality**: ESLint configuration for consistent code style

## 🏗️ Architecture

```
NeoBoard/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── boards/        # Board-related components
│   │   ├── threads/       # Thread management components
│   │   ├── posts/         # Post components
│   │   ├── layout/        # Layout components (Header, etc.)
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service layer
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js application
│   ├── config/            # Database and app configuration
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB/Mongoose models
│   └── routes/            # API route handlers
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-chan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neoboard
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Frontend API URL
   VITE_API_URL=http://localhost:3001/api
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This command starts both the backend server (port 3001) and frontend development server (port 5173) concurrently.

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Board Endpoints
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create a new board (authenticated)
- `GET /api/boards/:id` - Get specific board details
- `PUT /api/boards/:id` - Update board (authenticated)
- `DELETE /api/boards/:id` - Delete board (authenticated)

### Thread Endpoints
- `GET /api/threads` - Get threads (with board filter)
- `POST /api/threads` - Create a new thread (authenticated)
- `GET /api/threads/:id` - Get specific thread with posts
- `PUT /api/threads/:id` - Update thread (authenticated)
- `DELETE /api/threads/:id` - Delete thread (authenticated)

### Post Endpoints
- `GET /api/posts` - Get posts (with thread filter)
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update post (authenticated)
- `DELETE /api/posts/:id` - Delete post (authenticated)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start both frontend and backend in development mode
npm run server       # Start only the backend server
npm run build        # Build the frontend for production
npm run preview      # Preview the production build

# Code Quality
npm run lint         # Run ESLint
```

### Project Structure Details

#### Frontend (`/src`)
- **Components**: Modular React components organized by feature
- **Hooks**: Custom hooks for state management and API calls
- **Services**: API communication layer
- **Types**: TypeScript interfaces and type definitions

#### Backend (`/server`)
- **Models**: MongoDB schemas using Mongoose
- **Routes**: Express.js route handlers
- **Middleware**: Authentication, error handling, and security middleware
- **Config**: Database connection and app configuration

### Database Schema

#### User Model
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isAnonymous: boolean;
  joinDate: string;
  postCount: number;
}
```

#### Board Model
```typescript
interface Board {
  id: string;
  name: string;
  description: string;
  category: string;
  threadCount: number;
  postCount: number;
  lastActivity: string;
  isNSFW: boolean;
}
```

#### Thread Model
```typescript
interface Thread {
  id: string;
  boardId: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  lastReply: string;
  replyCount: number;
  isSticky: boolean;
  isLocked: boolean;
  images: string[];
  tags?: string[];
}
```

#### Post Model
```typescript
interface Post {
  id: string;
  threadId: string;
  content: string;
  author: User;
  createdAt: string;
  replyTo?: string;
  images: string[];
  isOP?: boolean;
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet**: Security headers for Express.js
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: Content sanitization

## 🎨 UI/UX Features

- **Dark Theme**: Modern dark interface with cyan/blue accents
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: ARIA labels and keyboard navigation support
- **Animations**: Smooth transitions and hover effects

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service

3. **Set environment variables** in your hosting platform:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   ```

### Backend Deployment (Railway/Heroku/DigitalOcean)

1. **Set environment variables** on your hosting platform
2. **Deploy the server code**
3. **Ensure MongoDB Atlas is accessible** from your hosting provider

### Environment Variables for Production

```env
# Production Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neoboard

# JWT Configuration
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# API URL for frontend
VITE_API_URL=https://your-api-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all linting passes before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide React** for the beautiful icons
- **MongoDB** for the flexible database solution
- **Vite** for the lightning-fast build tool

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Advanced search functionality
- [ ] User profiles and avatars
- [ ] Moderation tools
- [ ] Thread bookmarking
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] API rate limiting per user
- [ ] Advanced image handling
- [ ] Thread archiving

---

**Built with ❤️ by the NeoBoard team**
