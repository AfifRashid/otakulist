import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { db, initDb } from './lib/db.js';
import animeRouter from './routes/anime.js';
import statsRouter from './routes/stats.js';
import jikanRouter from './routes/jikan.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

initDb();

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/anime', animeRouter);
app.use('/api/stats', statsRouter);
app.use('/api', jikanRouter);

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Backend running on :${port}`));
}

export default app;
