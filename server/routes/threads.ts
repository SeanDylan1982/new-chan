import express from 'express';
import mongoose from 'mongoose';
import Thread from '../models/Thread.js';
import Board from '../models/Board.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get threads for a board
router.get('/board/:boardId', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;
    const { sort = 'activity', page = 1, limit = 20 } = req.query;

    // Validate board exists
    const board = await Board.findOne({ _id: boardId, isActive: true });
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Build sort criteria
    let sortCriteria: any = {};
    switch (sort) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'replies':
        sortCriteria = { replyCount: -1 };
        break;
      case 'activity':
      default:
        sortCriteria = { isSticky: -1, lastReply: -1 };
        break;
    }

    const threads = await Thread.find({ 
      boardId, 
      isActive: true 
    })
      .populate('author', 'username isAnonymous')
      .sort(sortCriteria)
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const formattedThreads = threads.map(thread => ({
      id: thread._id,
      boardId: thread.boardId,
      title: thread.title,
      content: thread.content,
      author: {
        id: thread.author.id,
        username: thread.author.username,
        email: '',
        isAnonymous: thread.author.isAnonymous,
        joinDate: thread.author.joinDate || new Date(),
        postCount: thread.author.postCount || 0
      },
      createdAt: thread.createdAt,
      lastReply: thread.lastReply,
      replyCount: thread.replyCount,
      isSticky: thread.isSticky,
      isLocked: thread.isLocked,
      images: thread.images,
      tags: thread.tags
    }));

    res.json({
      success: true,
      threads: formattedThreads
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// Get single thread
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const thread = await Thread.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('author', 'username isAnonymous joinDate postCount');

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({
      success: true,
      thread: {
        id: thread._id,
        boardId: thread.boardId,
        title: thread.title,
        content: thread.content,
        author: {
          id: thread.author._id,
          username: thread.author.username,
          email: '',
          isAnonymous: thread.author.isAnonymous,
          joinDate: thread.author.joinDate || new Date(),
          postCount: thread.author.postCount || 0
        },
        createdAt: thread.createdAt,
        lastReply: thread.lastReply,
        replyCount: thread.replyCount,
        isSticky: thread.isSticky,
        isLocked: thread.isLocked,
        images: thread.images,
        tags: thread.tags
      }
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// Create new thread
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { boardId, title, content, images = [], tags = [] } = req.body;
    const userId = req.user!._id;

    // Validate board exists
    const board = await Board.findOne({ _id: boardId, isActive: true });
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Create thread
    const thread = new Thread({
      boardId,
      title,
      content,
      author: userId,
      images,
      tags
    });

    await thread.save();

    // Create the original post
    const originalPost = new Post({
      threadId: thread._id,
      content,
      author: userId,
      images,
      isOP: true
    });

    await originalPost.save();

    // Update board stats
    await Board.findByIdAndUpdate(boardId, {
      $inc: { threadCount: 1, postCount: 1 },
      lastActivity: new Date()
    });

    // Update user post count
    await User.findByIdAndUpdate(userId, {
      $inc: { postCount: 1 }
    });

    // Populate author for response
    await thread.populate('author', 'username isAnonymous joinDate postCount');

    res.status(201).json({
      success: true,
      thread: {
        id: thread._id,
        boardId: thread.boardId,
        title: thread.title,
        content: thread.content,
        author: {
          id: thread.author._id,
          username: thread.author.username,
          email: '',
          isAnonymous: thread.author.isAnonymous,
          joinDate: thread.author.joinDate || new Date(),
          postCount: thread.author.postCount || 0
        },
        createdAt: thread.createdAt,
        lastReply: thread.lastReply,
        replyCount: thread.replyCount,
        isSticky: thread.isSticky,
        isLocked: thread.isLocked,
        images: thread.images,
        tags: thread.tags
      }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// Update thread (lock/unlock, sticky/unsticky)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { isSticky, isLocked } = req.body;
    const userId = req.user!._id;

    const thread = await Thread.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user is the author (basic authorization)
    if (thread.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this thread' });
    }

    // Update thread
    if (isSticky !== undefined) thread.isSticky = isSticky;
    if (isLocked !== undefined) thread.isLocked = isLocked;

    await thread.save();

    res.json({
      success: true,
      thread: {
        id: thread._id,
        boardId: thread.boardId,
        title: thread.title,
        content: thread.content,
        author: thread.author,
        createdAt: thread.createdAt,
        lastReply: thread.lastReply,
        replyCount: thread.replyCount,
        isSticky: thread.isSticky,
        isLocked: thread.isLocked,
        images: thread.images,
        tags: thread.tags
      }
    });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({ error: 'Failed to update thread' });
  }
});

// Delete thread (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;

    const thread = await Thread.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user is the author (basic authorization)
    if (thread.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this thread' });
    }

    // Soft delete thread and all its posts
    thread.isActive = false;
    await thread.save();

    await Post.updateMany(
      { threadId: thread._id },
      { isActive: false }
    );

    // Update board stats
    await Board.findByIdAndUpdate(thread.boardId, {
      $inc: { 
        threadCount: -1, 
        postCount: -(thread.replyCount + 1) // +1 for original post
      }
    });

    res.json({
      success: true,
      message: 'Thread deleted successfully'
    });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

export default router;