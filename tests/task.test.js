const request = require('supertest');
const app = require('../server');
const { setUp, tearDown, dropCollections } = require('./setup');
const Board = require('../models/Board');

let token;
let user2Token;
let boardId;

beforeAll(async () => {
  await setUp();
});

afterEach(async () => {
  await dropCollections();
});

afterAll(async () => {
  await tearDown();
});

describe('Task API Integration Tests', () => {
  beforeEach(async () => {
    // 1. Create User 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'user1@test.com',
      password: 'password123'
    });
    token = res1.body.token;

    // 2. Create User 2
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      email: 'user2@test.com',
      password: 'password123'
    });
    user2Token = res2.body.token;

    // 3. Create a Board for User 1
    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'User 1 Board' });
    boardId = boardRes.body._id;
  });

  describe('POST /api/tasks', () => {
    it('should create a task in a board owned by the user', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          board: boardId,
          status: 'todo',
          priority: 'high'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('title', 'Test Task');
      expect(res.body).toHaveProperty('board', boardId);
    });

    it('should NOT create a task in a board owned by someone else', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user2Token}`) // User 2 tries to access User 1's board
        .send({
          title: 'Hacker Task',
          board: boardId,
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Access denied to this board');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 1', board: boardId });
    });

    it('should return tasks for an authorized board', async () => {
      const res = await request(app)
        .get(`/api/tasks?boardId=${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(1);
    });

    it('should deny access if another user tries to read the board tasks', async () => {
      const res = await request(app)
        .get(`/api/tasks?boardId=${boardId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});
