# NeoBoard Development Guide

This guide covers setting up a development environment, understanding the codebase architecture, and contributing to NeoBoard.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Database Schema](#database-schema)
7. [Testing](#testing)
8. [Code Style and Standards](#code-style-and-standards)
9. [Contributing Guidelines](#contributing-guidelines)

## Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **MongoDB**: Atlas account or local installation
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd new-chan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend dev server on `http://localhost:5173`
   - Backend API server on `http://localhost:3001`

## Project Structure

```
NeoBoard/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── auth/                # Authentication components
│   │   │   └── AuthModal.tsx    # Login/Register modal
│   │   ├── boards/              # Board-related components
│   │   │   ├── BoardCard.tsx    # Individual board display
│   │   │   ├── BoardList.tsx    # List of all boards
│   │   │   ├── BoardView.tsx    # Single board view with threads
│   │   │   └── CreateBoardModal.tsx # Board creation modal
│   │   ├── threads/             # Thread management
│   │   │   ├── ThreadCard.tsx   # Thread preview card
│   │   │   ├── ThreadView.tsx   # Full thread with posts
│   │   │   └── CreateThreadModal.tsx # Thread creation
│   │   ├── posts/               # Post components
│   │   │   └── PostCard.tsx     # Individual post display
│   │   ├── layout/              # Layout components
│   │   │   └── Header.tsx       # Main navigation header
│   │   └── ui/                  # Reusable UI components
│   │       ├── Modal.tsx        # Generic modal component
│   │       └── LoadingSpinner.tsx # Loading indicator
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts          # Authentication state management
│   │   ├── useBoards.ts        # Board data fetching
│   │   └── useThreads.ts       # Thread data fetching
│   ├── services/               # API service layer
│   │   └── api.ts              # HTTP client and API calls
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # All interface definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles and Tailwind imports
├── server/                     # Backend Node.js application
│   ├── config/                # Configuration files
│   │   └── database.ts        # MongoDB connection setup
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # JWT authentication middleware
│   │   └── errorHandler.ts   # Global error handling
│   ├── models/               # MongoDB/Mongoose models
│   │   ├── User.ts          # User data model
│   │   ├── Board.ts         # Board data model
│   │   ├── Thread.ts        # Thread data model
│   │   └── Post.ts          # Post data model
│   ├── routes/              # API route handlers
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── boards.ts       # Board CRUD operations
│   │   ├── threads.ts      # Thread CRUD operations
│   │   └── posts.ts        # Post CRUD operations
│   └── index.ts            # Server entry point and configuration
├── docs/                   # Documentation
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.ts       # Vite build configuration
└── .env                 # Environment variables (not in repo)
```

## Architecture Overview

### Frontend Architecture

NeoBoard uses a modern React architecture with:

- **Component-Based Design**: Modular, reusable components
- **Custom Hooks**: Centralized state management and API calls
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first styling approach
- **Vite**: Fast development and build tooling

### Backend Architecture

The backend follows RESTful API principles with:

- **Express.js**: Web framework for Node.js
- **MongoDB + Mongoose**: Database and ODM
- **JWT Authentication**: Stateless authentication
- **Middleware Pattern**: Modular request processing
- **Error Handling**: Centralized error management

### Data Flow

```
User Interaction → React Component → Custom Hook → API Service → Express Route → Mongoose Model → MongoDB
```

## Frontend Development

### Component Development

#### Creating a New Component

1. **Create Component File**
   ```typescript
   // src/components/example/ExampleComponent.tsx
   import React from 'react';
   
   interface ExampleComponentProps {
     title: string;
     onAction: () => void;
   }
   
   export const ExampleComponent: React.FC<ExampleComponentProps> = ({
     title,
     onAction
   }) => {
     return (
       <div className="bg-gray-800 rounded-lg p-4">
         <h2 className="text-white text-lg font-semibold">{title}</h2>
         <button
           onClick={onAction}
           className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
         >
           Action
         </button>
       </div>
     );
   };
   ```

2. **Add to Index (if needed)**
   ```typescript
   // src/components/example/index.ts
   export { ExampleComponent } from './ExampleComponent';
   ```

#### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow the existing color scheme (gray backgrounds, cyan/blue accents)
- Ensure responsive design with mobile-first approach
- Use consistent spacing and typography

```typescript
// Good styling example
<div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
  <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
  <p className="text-gray-300 text-sm">{description}</p>
</div>
```

### Custom Hooks

#### Creating API Hooks

```typescript
// src/hooks/useExample.ts
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ExampleType } from '../types';

export const useExample = (id?: string) => {
  const [data, setData] = useState<ExampleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/example${id ? `/${id}` : ''}`);
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const createExample = async (data: Partial<ExampleType>) => {
    try {
      const response = await api.post('/example', data);
      setData(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    createExample,
    refetch: () => fetchData()
  };
};
```

### State Management

NeoBoard uses React's built-in state management with custom hooks:

- **Local State**: `useState` for component-specific state
- **Global State**: Custom hooks with context (for auth, etc.)
- **Server State**: Custom hooks for API data fetching

## Backend Development

### Creating API Endpoints

#### Route Structure

```typescript
// server/routes/example.ts
import express from 'express';
import { auth } from '../middleware/auth';
import { Example } from '../models/Example';

const router = express.Router();

// GET /api/example
router.get('/', async (req, res) => {
  try {
    const examples = await Example.find().populate('author', 'username');
    res.json({ success: true, data: examples });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/example (protected)
router.post('/', auth, async (req, res) => {
  try {
    const example = new Example({
      ...req.body,
      author: req.user.id
    });
    await example.save();
    res.status(201).json({ success: true, data: example });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
```

#### Model Creation

```typescript
// server/models/Example.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IExample extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema<IExample>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for performance
ExampleSchema.index({ author: 1, createdAt: -1 });
ExampleSchema.index({ title: 'text', content: 'text' });

export const Example = mongoose.model<IExample>('Example', ExampleSchema);
```

### Middleware Development

#### Authentication Middleware

```typescript
// server/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
```

## Database Schema

### User Model

```typescript
interface IUser {
  username: string;        // Unique username
  email: string;          // Unique email address
  password: string;       // Hashed password
  avatar?: string;        // Profile picture URL
  isAnonymous: boolean;   // Anonymous user flag
  joinDate: Date;         // Registration date
  postCount: number;      // Total posts made
  isActive: boolean;      // Account status
  lastLogin?: Date;       // Last login timestamp
}
```

### Board Model

```typescript
interface IBoard {
  name: string;           // Board name
  description: string;    // Board description
  category: string;       // Board category
  threadCount: number;    // Number of threads
  postCount: number;      // Total posts in board
  lastActivity: Date;     // Last post/thread date
  isNSFW: boolean;       // Adult content flag
  createdBy: ObjectId;   // Creator user ID
  moderators: ObjectId[]; // Moderator user IDs
}
```

### Thread Model

```typescript
interface IThread {
  boardId: ObjectId;      // Parent board
  title: string;          // Thread title
  content: string;        // Original post content
  author: ObjectId;       // Thread creator
  createdAt: Date;        // Creation timestamp
  lastReply: Date;        // Last reply timestamp
  replyCount: number;     // Number of replies
  isSticky: boolean;      // Pinned thread
  isLocked: boolean;      // Locked for replies
  images: string[];       // Attached images
  tags: string[];         // Thread tags
  views: number;          // View count
}
```

### Post Model

```typescript
interface IPost {
  threadId: ObjectId;     // Parent thread
  content: string;        // Post content
  author: ObjectId;       // Post author
  createdAt: Date;        // Creation timestamp
  replyTo?: ObjectId;     // Reply to post ID
  images: string[];       // Attached images
  isOP: boolean;          // Original poster flag
  editedAt?: Date;        // Last edit timestamp
  editedBy?: ObjectId;    // Editor user ID
}
```

## Testing

### Frontend Testing

```typescript
// src/components/__tests__/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleComponent } from '../ExampleComponent';

describe('ExampleComponent', () => {
  it('renders title correctly', () => {
    render(<ExampleComponent title="Test Title" onAction={() => {}} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<ExampleComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

### Backend Testing

```typescript
// server/__tests__/example.test.ts
import request from 'supertest';
import app from '../index';
import { Example } from '../models/Example';

describe('Example API', () => {
  beforeEach(async () => {
    await Example.deleteMany({});
  });

  describe('GET /api/example', () => {
    it('should return all examples', async () => {
      const response = await request(app)
        .get('/api/example')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/example', () => {
    it('should create a new example', async () => {
      const exampleData = {
        title: 'Test Example',
        content: 'Test content'
      };

      const response = await request(app)
        .post('/api/example')
        .set('Authorization', `Bearer ${validToken}`)
        .send(exampleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(exampleData.title);
    });
  });
});
```

## Code Style and Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper typing for function parameters and returns
- Avoid `any` type unless absolutely necessary

### React Guidelines

- Use functional components with hooks
- Implement proper prop typing with interfaces
- Use meaningful component and prop names
- Keep components focused and single-purpose

### Naming Conventions

- **Components**: PascalCase (`UserProfile`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase (`userName`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces**: PascalCase with 'I' prefix (`IUser`)

### Code Organization

- Group related functionality together
- Use barrel exports (index.ts files)
- Keep file sizes reasonable (< 300 lines)
- Separate concerns (logic, UI, styling)

## Contributing Guidelines

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make Changes**
   - Write code following style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/new-feature-name
   ```

### Commit Message Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Pull Request Process

1. Ensure all tests pass
2. Update documentation
3. Add screenshots for UI changes
4. Request review from maintainers
5. Address feedback and make changes
6. Merge after approval

### Development Best Practices

- Write self-documenting code
- Add comments for complex logic
- Use meaningful variable names
- Keep functions small and focused
- Handle errors gracefully
- Optimize for performance
- Consider accessibility
- Test edge cases

## Debugging

### Frontend Debugging

```typescript
// Use React Developer Tools
// Add debug logging
console.log('Component state:', { data, loading, error });

// Use browser debugger
debugger;

// Network debugging
console.log('API call:', { url, method, data });
```

### Backend Debugging

```typescript
// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Database query debugging
mongoose.set('debug', true);

// Error logging
console.error('Database error:', error);
```

## Performance Optimization

### Frontend Optimization

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Use proper dependency arrays in useEffect
- Implement virtual scrolling for large lists

### Backend Optimization

- Add database indexes
- Use connection pooling
- Implement caching strategies
- Optimize database queries
- Use compression middleware

## Security Considerations

- Validate all inputs
- Sanitize user content
- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated
- Use environment variables for secrets
- Implement proper CORS policies

## Support and Resources

- **Documentation**: [Development Guide](./DEVELOPMENT.md)
- **API Reference**: [API Documentation](./API.md)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Community**: [Discord Server](https://discord.gg/neoboard)