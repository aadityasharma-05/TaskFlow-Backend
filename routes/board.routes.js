const express = require('express');
const router = express.Router();
const boardController = require('../controllers/board.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// @route GET /api/boards
router.get('/', boardController.getBoards);

// @route POST /api/boards
router.post('/', boardController.createBoard);

// @route GET /api/boards/:id
router.get('/:id', boardController.getBoardById);

// @route PUT /api/boards/:id
router.put('/:id', boardController.updateBoard);

// @route DELETE /api/boards/:id
router.delete('/:id', boardController.deleteBoard);

module.exports = router;
