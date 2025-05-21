const request = require('supertest');
const express = require('express');
const postController = require('./postController');

const app = express();
app.use(express.json());

// Mock auth middleware to always pass
app.use((req, res, next) => {
  req.user = { id: 'mockuserid' };
  next();
});

// Mock Post and User models
jest.mock('../models/Post', () => {
  return function () {
    return {
      save: jest.fn().mockResolvedValue({ title: 'Test', content: 'Test content' })
    };
  };
});
jest.mock('../models/User', () => ({
  findById: jest.fn().mockResolvedValue({ id: 'mockuserid', name: 'Test User' })
}));

// Route for testing
app.post('/api/posts', postController.createPost);

describe('POST /api/posts', () => {
  it('should create a post with valid data', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Test', content: 'Test content' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test');
  });
});