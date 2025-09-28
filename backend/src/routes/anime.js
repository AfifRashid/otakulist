import { Router } from 'express';
import { db } from '../lib/db.js';

const router = Router();
/** List anime (optionally filtered by status); ordered A→Z (case-insensitive). */

router.get('/', (req, res) => {
  const status = req.query.status;
  let rows;
  if (status && ['planned','watching','done'].includes(status)) {
    rows = db.prepare(
      "SELECT * FROM anime WHERE status = ? ORDER BY title COLLATE NOCASE ASC"
    ).all(status);
  } else {
    rows = db.prepare(
      "SELECT * FROM anime ORDER BY title COLLATE NOCASE ASC"
    ).all();
  }
  res.json(rows);
});
/** Create anime entry. Enforces unique title; returns 201 with new id. */

router.post('/', (req, res) => {
  const { title, episodes_total = 0, est_ep_minutes = 24, status = 'planned' } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  if (!['planned','watching','done'].includes(status)) return res.status(400).json({ error: 'invalid status' });

  try {
    const stmt = db.prepare(`INSERT INTO anime(title, episodes_total, est_ep_minutes, status)
                             VALUES (?, ?, ?, ?)`);
    const info = stmt.run(title.trim(), episodes_total, est_ep_minutes, status);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'duplicate title not allowed' });
    }
    throw e;
  }
});
/** Update progress. Accepts { delta } for relative or { value } for absolute set. Derives status. */

router.patch('/:id/progress', (req, res) => {
  const id = Number(req.params.id);
  const { delta, value } = req.body;
  const anime = db.prepare('SELECT * FROM anime WHERE id = ?').get(id);
  if (!anime) return res.status(404).json({ error: 'not found' });

  let newCount;
  if (value != null) {
    // absolute set
    const v = Math.max(0, Number(value));
    newCount = (anime.episodes_total && anime.episodes_total > 0)
      ? Math.min(v, anime.episodes_total)
      : v; // if total unknown, allow any non-negative
  } else {
    // default to delta = 1
    const d = Number(delta ?? 1);
    newCount = (anime.eps_watched || 0) + d;
    if (anime.episodes_total && anime.episodes_total > 0) {
      newCount = Math.min(newCount, anime.episodes_total);
    }
    newCount = Math.max(0, newCount);
  }

  // derive status
  let newStatus = 'planned';
  if (anime.episodes_total && anime.episodes_total > 0) {
    newStatus = newCount >= anime.episodes_total ? 'done' : (newCount > 0 ? 'watching' : 'planned');
  } else {
    newStatus = newCount > 0 ? 'watching' : 'planned';
  }

  db.prepare('UPDATE anime SET eps_watched = ?, status = ? WHERE id = ?')
    .run(newCount, newStatus, id);

  res.json({ id, eps_watched: newCount, status: newStatus });
});
/** Set or clear rating. Send null/undefined/'' to clear; otherwise integer 1–10. */

router.patch('/:id/rating', (req, res) => {
  const id = Number(req.params.id);
  const { rating } = req.body;
  const exists = db.prepare('SELECT 1 FROM anime WHERE id = ?').get(id);
  if (!exists) return res.status(404).json({ error: 'not found' });

  // allow clearing rating
  if (rating === null || rating === undefined || rating === '') {
    db.prepare('UPDATE anime SET rating = NULL WHERE id = ?').run(id);
    return res.json({ id, rating: null });
  }

  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 10) {
    return res.status(400).json({ error: 'rating must be integer 1-10 or null' });
  }

  db.prepare('UPDATE anime SET rating = ? WHERE id = ?').run(r, id);
  res.json({ id, rating: r });
});
/** Delete anime by id. Returns 204 on success. */

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT 1 FROM anime WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'not found' });

  db.prepare('DELETE FROM anime WHERE id = ?').run(id);
  res.status(204).send(); // No Content
});

export default router;
