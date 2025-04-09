const request = require('supertest');
const { app, server } = require('../src/REST_api');
const { describe, it, afterEach, afterAll, beforeAll } = require('@jest/globals');

jest.setTimeout(10000);  // Set timeout to 10 seconds (10000 ms)

// Mock console.log to prevent "Server listening on PORT: undefined" from being logged
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll((done) => {
  if (server && server.close) {
    server.close(done); // Ensuring the server is correctly closed after tests
  } else {
    done(); // In case the server is undefined
  }
});

describe('POST /signup', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/signup')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User created');
  });
});

describe('POST /login', () => {
  it('should log in a user', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
  });
});
