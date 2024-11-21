import request from 'supertest';
import { app } from '../app';
import { Server } from 'http';

let server: Server;

beforeAll(() => {
  server = app.listen();
});

afterAll(() => {
  server.close();
});

describe('App Endpoints', () => {
  it('should return HTML content at the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('<h1>Welcome to the Node.js App</h1>');
  });

  it('should return healthy status on /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'UP' });
  });

  it('should return metadata at /metadata', async () => {
    const response = await request(app).get('/metadata');
    expect(response.status).toBe(200);
  });
});
