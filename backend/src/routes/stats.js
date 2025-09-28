import { Router } from 'express';
import { db } from '../lib/db.js';

const router = Router();

router.get('/', (_req, res) => {
  const totals = db.prepare('SELECT COUNT(*) as count FROM anime').get();
  const watchedMinutes = db.prepare('SELECT SUM(eps_watched * est_ep_minutes) as minutes FROM anime').get();
  const backlog = db.prepare("SELECT COUNT(*) as backlog FROM anime WHERE status = 'planned' AND episodes_total > 0").get();
  const hours = Math.round(((watchedMinutes.minutes || 0) / 60) * 10) / 10;
  res.json({ total: totals.count, hours_watched: hours, backlog: backlog.backlog });
});

export default router;
