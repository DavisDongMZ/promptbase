const request = require('supertest');
process.env.DB_URL = 'sqlite::memory:';

const { app } = require('../src/app');
const sequelize = require('../src/config/database');

beforeAll(async () => {
  await sequelize.authenticate();
  await request(app).get('/api/migrate');
});

afterAll(async () => {
  await sequelize.close();
});

describe('Prompt API', () => {
  it('creates and retrieves a prompt with tags', async () => {
    const tags = [
      { name: 'tag1', category: 'model' },
      { name: 'tag2', category: 'task' },
    ];
    const createRes = await request(app)
      .post('/prompts')
      .send({ title: 'Hello', body: 'World', tags })
      .expect(201);

    const { id } = createRes.body;

    expect(createRes.body.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining(tags[0]),
        expect.objectContaining(tags[1]),
      ])
    );

    const getRes = await request(app).get(`/prompts/${id}`).expect(200);
    expect(getRes.body.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining(tags[0]),
        expect.objectContaining(tags[1]),
      ])
    );
  });

  it('tracks versions and restores a previous one', async () => {
    const createRes = await request(app)
      .post('/prompts')
      .send({ title: 'v1', body: 'body1' })
      .expect(201);

    const { id } = createRes.body;

    await request(app)
      .put(`/prompts/${id}`)
      .send({ title: 'v2', body: 'body2' })
      .expect(200);

    const versions = await request(app)
      .get(`/prompts/${id}/versions`)
      .expect(200);
    expect(versions.body.length).toBe(2);

    const restoreRes = await request(app)
      .post(`/prompts/${id}/versions/${versions.body[0].id}/restore`)
      .expect(200);
    expect(restoreRes.body.title).toBe('v1');
  });
});
