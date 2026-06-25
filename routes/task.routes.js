const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// @route GET /api/tasks/all
router.get('/all', taskController.getAllTasks);

// @route GET /api/tasks?boardId=...
router.get('/', taskController.getTasks);

// @route POST /api/tasks
router.post('/', taskController.createTask);

// @route PUT /api/tasks/:id
router.put('/:id', taskController.updateTask);

// @route DELETE /api/tasks/:id
router.delete('/:id', taskController.deleteTask);

// @route POST /api/tasks/suggest-estimate
router.post('/suggest-estimate', taskController.suggestEstimate);

module.exports = router;
