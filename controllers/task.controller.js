const { z } = require('zod');
const Groq = require('groq-sdk');
const Task = require('../models/Task');
const Board = require('../models/Board');

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  estimatedEffort: z.string().optional().nullable(),
  board: z.string(),
});

const aiPromptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const checkBoardOwnership = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  return !!board;
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Server error fetching all tasks' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { boardId } = req.query;
    if (!boardId) {
      return res.status(400).json({ message: 'boardId query parameter is required' });
    }

    const hasAccess = await checkBoardOwnership(boardId, req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this board' });
    }

    const tasks = await Task.find({ board: boardId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const validatedData = taskSchema.parse(req.body);

    const hasAccess = await checkBoardOwnership(validatedData.board, req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this board' });
    }

    const task = new Task({
      ...validatedData,
      owner: req.user.userId,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const validatedData = taskSchema.partial().parse(req.body);

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $set: validatedData },
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

exports.suggestEstimate = async (req, res) => {
  try {
    const { title, description } = aiPromptSchema.parse(req.body);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.json({
        estimatedEffort: '2 hours',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reasoning: 'Fallback response: AI key not configured.'
      });
    }

    const groq = new Groq({ apiKey });
    
    const prompt = `
      You are a smart task estimator. Based on the following task title and description, suggest:
      1. Estimated effort (e.g., "2 hours", "1 day", "S", "M", "L").
      2. A reasonable due date relative to today (${new Date().toISOString().split('T')[0]}), in YYYY-MM-DD format.
      3. A short reasoning (1-2 sentences).

      Task Title: ${title}
      Task Description: ${description || 'No description provided.'}

      Return ONLY a valid JSON object with the following keys: "estimatedEffort", "dueDate", "reasoning". Do not wrap it in markdown.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
    });

    let resultText = chatCompletion.choices[0]?.message?.content || '';
    
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    try {
      const resultJson = JSON.parse(resultText);
      res.json({
        estimatedEffort: resultJson.estimatedEffort || 'Unknown',
        dueDate: resultJson.dueDate || new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reasoning: resultJson.reasoning || 'Estimated by AI.',
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', resultText);
      res.status(500).json({ message: 'Failed to parse AI response' });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Suggest estimate error:', error);
    res.status(500).json({ message: 'Server error generating estimate' });
  }
};
