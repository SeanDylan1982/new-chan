import express from 'express';
import Board from '../models/Board.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all boards
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    console.log('🔍 Fetching boards from database...');
    
    const boards = await Board.find({ isActive: true })
      .populate('createdBy', 'username')
      .sort({ lastActivity: -1 });

    console.log(`📊 Found ${boards.length} boards in database`);
    console.log('📋 Board names:', boards.map(b => b.name));

    const formattedBoards = boards.map(board => ({
      id: board._id.toString(),
      name: board.name,
      description: board.description,
      category: board.category,
      threadCount: board.threadCount,
      postCount: board.postCount,
      lastActivity: board.lastActivity.toISOString(),
      isNSFW: board.isNSFW
    }));

    console.log('✅ Sending formatted boards:', formattedBoards);

    res.json({
      success: true,
      boards: formattedBoards
    });
  } catch (error) {
    console.error('❌ Get boards error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch boards',
      details: error.message 
    });
  }
});

// Get single board
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    console.log('🔍 Fetching board by ID:', req.params.id);
    
    const board = await Board.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('createdBy', 'username');

    if (!board) {
      console.log('❌ Board not found:', req.params.id);
      return res.status(404).json({ error: 'Board not found' });
    }

    // Update board activity
    await board.updateActivity();

    res.json({
      success: true,
      board: {
        id: board._id.toString(),
        name: board.name,
        description: board.description,
        category: board.category,
        threadCount: board.threadCount,
        postCount: board.postCount,
        lastActivity: board.lastActivity.toISOString(),
        isNSFW: board.isNSFW
      }
    });
  } catch (error) {
    console.error('❌ Get board error:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create new board
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description, category, isNSFW } = req.body;
    const userId = req.user!._id;

    console.log('🔄 Creating new board:', { name, description, category, isNSFW });

    // Check if board name already exists
    const existingBoard = await Board.findOne({ 
      name: name.toLowerCase(),
      isActive: true 
    });

    if (existingBoard) {
      return res.status(400).json({ error: 'A board with this name already exists' });
    }

    // Create new board
    const board = new Board({
      name,
      description,
      category,
      isNSFW: isNSFW || false,
      createdBy: userId
    });

    await board.save();
    await board.populate('createdBy', 'username');

    console.log('✅ Board created successfully:', board.name);

    res.status(201).json({
      success: true,
      board: {
        id: board._id.toString(),
        name: board.name,
        description: board.description,
        category: board.category,
        threadCount: board.threadCount,
        postCount: board.postCount,
        lastActivity: board.lastActivity.toISOString(),
        isNSFW: board.isNSFW
      }
    });
  } catch (error) {
    console.error('❌ Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update board (admin only - for now just the creator)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { description, category, isNSFW } = req.body;
    const userId = req.user!._id;

    const board = await Board.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user is the creator (basic authorization)
    if (board.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this board' });
    }

    // Update board
    board.description = description || board.description;
    board.category = category || board.category;
    board.isNSFW = isNSFW !== undefined ? isNSFW : board.isNSFW;

    await board.save();

    res.json({
      success: true,
      board: {
        id: board._id.toString(),
        name: board.name,
        description: board.description,
        category: board.category,
        threadCount: board.threadCount,
        postCount: board.postCount,
        lastActivity: board.lastActivity.toISOString(),
        isNSFW: board.isNSFW
      }
    });
  } catch (error) {
    console.error('❌ Update board error:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete board (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;

    const board = await Board.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user is the creator (basic authorization)
    if (board.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this board' });
    }

    // Soft delete
    board.isActive = false;
    await board.save();

    res.json({
      success: true,
      message: 'Board deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete board error:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

export default router;