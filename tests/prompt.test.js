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

  it('searches prompts by keyword and tags', async () => {
    const p1 = await request(app)
      .post('/prompts')
      .send({ title: 'Learn JS', body: 'JavaScript basics', tags: ['code'] })
      .expect(201);
    await request(app)
      .post('/prompts')
      .send({ title: 'Another prompt', body: 'Something else' })
      .expect(201);

    const byKeyword = await request(app)
      .get('/search/prompts?keyword=Learn')
      .expect(200);
    expect(byKeyword.body[0].id).toBe(p1.body.id);

    const byTag = await request(app)
      .get('/search/prompts?tags=js')
      .expect(200);
    expect(byTag.body[0].id).toBe(p1.body.id);
  });

  it('auto generates normalized tags', async () => {
    const res = await request(app)
      .post('/prompts')
      .send({ title: 'Using JavaScript with AI', body: 'text' })
      .expect(201);
    const tagNames = res.body.tags.map((t) => t.name);
    expect(tagNames).toEqual(expect.arrayContaining(['js', 'ai']));
  });

  it('rejects content failing moderation', async () => {
    await request(app)
      .post('/prompts')
      .send({ title: 'Bad', body: 'contains badword here' })
      .expect(400);
  });

  it('creates and retrieves a bundle', async () => {
    const p1 = await request(app)
      .post('/prompts')
      .send({ title: 'B1', body: 'body1' })
      .expect(201);
    const p2 = await request(app)
      .post('/prompts')
      .send({ title: 'B2', body: 'body2' })
      .expect(201);

    const bundleRes = await request(app)
      .post('/bundles')
      .send({
        name: 'bundle1',
        description: 'desc',
        promptIds: [p1.body.id, p2.body.id],
      })
      .expect(201);

    expect(bundleRes.body.prompts.length).toBe(2);

    const getRes = await request(app)
      .get(`/bundles/${bundleRes.body.id}`)
      .expect(200);
    expect(getRes.body.prompts.length).toBe(2);
  });
});
