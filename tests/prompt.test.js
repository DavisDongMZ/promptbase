const request = require('supertest');
process.env.DB_URL = 'sqlite::memory:';

const { app } = require('../src/app');
const sequelize = require('../src/config/database');

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Prompt API', () => {
  it('creates and retrieves a prompt', async () => {
    const createRes = await request(app)
      .post('/prompts')
      .send({ title: 'Hello', body: 'World', tags: ['tag1', 'tag2'] })
      .expect(201);

    const { id } = createRes.body;

    const getRes = await request(app).get(`/prompts/${id}`).expect(200);
    expect(getRes.body).toEqual(
      expect.objectContaining({
        id,
        title: 'Hello',
        body: 'World',
        tags: 'tag1,tag2',
      })
    );
  });
});
