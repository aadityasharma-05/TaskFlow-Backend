const { z } = require('zod');
const Board = require('../models/Board');
const Task = require('../models/Task');

const boardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error fetching boards' });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const validatedData = boardSchema.parse(req.body);
    const board = new Board({
      ...validatedData,
      owner: req.user.userId,
    });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error creating board' });
  }
};

exports.getBoardById = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error fetching board' });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const validatedData = boardSchema.parse(req.body);
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $set: validatedData },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error updating board' });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    // Delete associated tasks
    await Task.deleteMany({ board: req.params.id });
    res.json({ message: 'Board and associated tasks deleted' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error deleting board' });
  }
};
