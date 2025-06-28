import express from 'express';
import Post from '../models/Post.js';
import Thread from '../models/Thread.js';
import Board from '../models/Board.js';
import User from '../models/User.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get posts for a thread
router.get('/thread/:threadId', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate thread exists
    const thread = await Thread.findOne({ _id: threadId, isActive: true });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const posts = await Post.find({ 
      threadId, 
      isActive: true 
    })
      .populate('author', 'username isAnonymous joinDate postCount')
      .sort({ createdAt: 1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const formattedPosts = posts.map(post => ({
      id: post._id,
      threadId: post.threadId,
      content: post.content,
      author: {
        id: post.author._id,
        username: post.author.username,
        email: '',
        isAnonymous: post.author.isAnonymous,
        joinDate: post.author.joinDate || new Date(),
        postCount: post.author.postCount || 0
      },
      createdAt: post.createdAt,
      replyTo: post.replyTo,
      images: post.images,
      isOP: post.isOP
    }));

    res.json({
      success: true,
      posts: formattedPosts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create new post (reply)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { threadId, content, images = [], replyTo } = req.body;
    const userId = req.user!._id;

    // Validate thread exists and is not locked
    const thread = await Thread.findOne({ _id: threadId, isActive: true });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (thread.isLocked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }

    // Validate replyTo post exists if provided
    if (replyTo) {
      const replyToPost = await Post.findOne({ 
        _id: replyTo, 
        threadId, 
        isActive: true 
      });
      if (!replyToPost) {
        return res.status(404).json({ error: 'Reply target post not found' });
      }
    }

    // Create post
    const post = new Post({
      threadId,
      content,
      author: userId,
      images,
      replyTo: replyTo || null,
      isOP: false
    });

    await post.save();

    // Update thread stats
    await Thread.findByIdAndUpdate(threadId, {
      $inc: { replyCount: 1 },
      lastReply: new Date()
    });

    // Update board stats
    await Board.findByIdAndUpdate(thread.boardId, {
      $inc: { postCount: 1 },
      lastActivity: new Date()
    });

    // Update user post count
    await User.findByIdAndUpdate(userId, {
      $inc: { postCount: 1 }
    });

    // Populate author for response
    await post.populate('author', 'username isAnonymous joinDate postCount');

    res.status(201).json({
      success: true,
      post: {
        id: post._id,
        threadId: post.threadId,
        content: post.content,
        author: {
          id: post.author._id,
          username: post.author.username,
          email: '',
          isAnonymous: post.author.isAnonymous,
          joinDate: post.author.joinDate || new Date(),
          postCount: post.author.postCount || 0
        },
        createdAt: post.createdAt,
        replyTo: post.replyTo,
        images: post.images,
        isOP: post.isOP
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    const userId = req.user!._id;

    const post = await Post.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Update post
    post.content = content;
    await post.save();

    await post.populate('author', 'username isAnonymous joinDate postCount');

    res.json({
      success: true,
      post: {
        id: post._id,
        threadId: post.threadId,
        content: post.content,
        author: {
          id: post.author._id,
          username: post.author.username,
          email: '',
          isAnonymous: post.author.isAnonymous,
          joinDate: post.author.joinDate || new Date(),
          postCount: post.author.postCount || 0
        },
        createdAt: post.createdAt,
        replyTo: post.replyTo,
        images: post.images,
        isOP: post.isOP
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;

    const post = await Post.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Don't allow deleting OP posts (would need to delete entire thread)
    if (post.isOP) {
      return res.status(403).json({ error: 'Cannot delete original post. Delete the thread instead.' });
    }

    // Soft delete post
    post.isActive = false;
    await post.save();

    // Update thread stats
    const thread = await Thread.findById(post.threadId);
    if (thread) {
      await Thread.findByIdAndUpdate(post.threadId, {
        $inc: { replyCount: -1 }
      });

      // Update board stats
      await Board.findByIdAndUpdate(thread.boardId, {
        $inc: { postCount: -1 }
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;