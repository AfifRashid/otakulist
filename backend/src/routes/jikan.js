import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

router.get('/search', async (req, res) => {
  if (process.env.JIKAN_ENABLED !== 'true') {
    return res.status(501).json({ error: 'Jikan disabled. Set JIKAN_ENABLED=true to enable.' });
  }
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q required' });
  try {
    const r = await fetch('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(q) + '&limit=5');
    const data = await r.json();
    const mapped = (data.data || []).map(a => ({
      mal_id: a.mal_id,
      title: a.title,
      episodes: a.episodes,
      score: a.score,
      url: a.url,
      image: a.images?.jpg?.image_url
    }));
    res.json(mapped);
  } catch (e) {
    res.status(502).json({ error: 'failed to reach Jikan' });
  }
});

router.get('/features', (_req, res) => {
  res.json({ jikanEnabled: process.env.JIKAN_ENABLED === 'true' });
});

export default router;
