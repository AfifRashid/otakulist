import request from 'supertest';
import app from '../src/index.js';
import { db } from '../src/lib/db.js';

beforeEach(() => {
  db.exec('DELETE FROM anime');
});

test('creates anime, increments progress, and updates stats totals', async () => {
  const create = await request(app).post('/api/anime').send({ title: 'Naruto', episodes_total: 10, est_ep_minutes: 24 });
  expect(create.status).toBe(201);
  const id = create.body.id;

  const progress = await request(app).patch(`/api/anime/${id}/progress`).send({ delta: 3 });
  expect(progress.status).toBe(200);
  expect(progress.body.eps_watched).toBe(3);

  const stats = await request(app).get('/api/stats');
  expect(stats.status).toBe(200);
  expect(stats.body.total).toBe(1);
  expect(stats.body.hours_watched).toBeCloseTo(1.2, 1); // 3 * 24 / 60 = 1.2
});

test('rejects invalid rating (>10) and accepts a valid rating', async () => {
  const create = await request(app).post('/api/anime').send({ title: 'Bleach' });
  const id = create.body.id;
  const bad = await request(app).patch(`/api/anime/${id}/rating`).send({ rating: 20 });
  expect(bad.status).toBe(400);
  const ok = await request(app).patch(`/api/anime/${id}/rating`).send({ rating: 8 });
  expect(ok.status).toBe(200);
});

test('deletes an anime and it no longer appears in the list', async () => {
  const create = await request(app).post('/api/anime').send({ title: 'Delete Me' });
  const id = create.body.id;
  const del = await request(app).delete(`/api/anime/${id}`);
  expect(del.status).toBe(204);

  const list = await request(app).get('/api/anime');
  expect(list.body.find(a => a.id === id)).toBeUndefined();
});

test('rejects exact duplicate title with 409 Conflict', async () => {
  const a = await request(app).post('/api/anime').send({ title: 'Naruto', episodes_total: 10 });
  expect(a.status).toBe(201);

  const dup = await request(app).post('/api/anime').send({ title: 'Naruto', episodes_total: 220 });
  expect(dup.status).toBe(409);
  expect(dup.body.error).toMatch(/duplicate/i);

  const list = await request(app).get('/api/anime');
  expect(list.body.length).toBe(1);
  expect(list.body[0].title).toBe('Naruto');
});

test('rejects duplicate title case-insensitively (Naruto vs naruto)', async () => {
  const a = await request(app).post('/api/anime').send({ title: 'Naruto' });
  expect(a.status).toBe(201);

  const dup = await request(app).post('/api/anime').send({ title: 'naruto' });
  expect(dup.status).toBe(409);
  expect(dup.body.error).toMatch(/duplicate/i);
});

test('sets progress by absolute value and marks status "watching"', async () => {
  const create = await request(app).post('/api/anime')
    .send({ title: 'Naruto', episodes_total: 100, est_ep_minutes: 24 });
  expect(create.status).toBe(201);
  const id = create.body.id;

  const set80 = await request(app).patch(`/api/anime/${id}/progress`)
    .send({ value: 80 });
  expect(set80.status).toBe(200);
  expect(set80.body.eps_watched).toBe(80);
  expect(set80.body.status).toBe('watching');

  const list = await request(app).get('/api/anime');
  const naruto = list.body.find(a => a.id === id);
  expect(naruto.eps_watched).toBe(80);
  expect(naruto.status).toBe('watching');
});

test('marks anime "done" when progress equals total and clamps overflows', async () => {
  const create = await request(app).post('/api/anime')
    .send({ title: 'OPM', episodes_total: 12 });
  const id = create.body.id;

  const full = await request(app).patch(`/api/anime/${id}/progress`)
    .send({ value: 12 });
  expect(full.status).toBe(200);
  expect(full.body.eps_watched).toBe(12);
  expect(full.body.status).toBe('done');

  const over = await request(app).patch(`/api/anime/${id}/progress`)
    .send({ value: 999 });
  expect(over.status).toBe(200);
  expect(over.body.eps_watched).toBe(12);
  expect(over.body.status).toBe('done');
});

test('handles unknown total: accepts non-negative progress and updates status', async () => {
  const create = await request(app).post('/api/anime')
    .send({ title: 'Unknown Total' }); // episodes_total defaults to 0
  const id = create.body.id;

  const set5 = await request(app).patch(`/api/anime/${id}/progress`)
    .send({ value: 5 });
  expect(set5.status).toBe(200);
  expect(set5.body.eps_watched).toBe(5);
  expect(set5.body.status).toBe('watching');

  const reset0 = await request(app).patch(`/api/anime/${id}/progress`)
    .send({ value: 0 });
  expect(reset0.status).toBe(200);
  expect(reset0.body.eps_watched).toBe(0);
  expect(reset0.body.status).toBe('planned');
});

test('sets a rating, then clears it (null), and persists both changes', async () => {
  const create = await request(app).post('/api/anime')
    .send({ title: 'Death Note', episodes_total: 37 });
  expect(create.status).toBe(201);
  const id = create.body.id;

  const rate8 = await request(app).patch(`/api/anime/${id}/rating`)
    .send({ rating: 8 });
  expect(rate8.status).toBe(200);
  expect(rate8.body.rating).toBe(8);

  let list = await request(app).get('/api/anime');
  expect(list.body.find(a => a.id === id).rating).toBe(8);

  const clear = await request(app).patch(`/api/anime/${id}/rating`)
    .send({ rating: null });
  expect(clear.status).toBe(200);
  expect(clear.body.rating).toBeNull();

  list = await request(app).get('/api/anime');
  expect(list.body.find(a => a.id === id).rating).toBeNull();
});