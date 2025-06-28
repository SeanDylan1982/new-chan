import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      isAnonymous: false
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAnonymous: user.isAnonymous,
        joinDate: user.joinDate,
        postCount: user.postCount
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last seen
    await user.updateLastSeen();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAnonymous: user.isAnonymous,
        joinDate: user.joinDate,
        postCount: user.postCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Anonymous login
router.post('/anonymous', async (req, res) => {
  try {
    const anonymousUsername = `Anonymous_${Date.now()}`;
    
    const user = new User({
      username: anonymousUsername,
      isAnonymous: true
    });

    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: 'Anonymous',
        email: '',
        isAnonymous: user.isAnonymous,
        joinDate: user.joinDate,
        postCount: user.postCount
      }
    });
  } catch (error) {
    console.error('Anonymous login error:', error);
    res.status(500).json({ error: 'Anonymous login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.isAnonymous ? 'Anonymous' : user.username,
        email: user.email,
        isAnonymous: user.isAnonymous,
        joinDate: user.joinDate,
        postCount: user.postCount
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    // Update last seen
    if (req.user) {
      await req.user.updateLastSeen();
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;