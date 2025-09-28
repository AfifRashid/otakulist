import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { db, initDb } from './lib/db.js';
import animeRouter from './routes/anime.js';
import statsRouter from './routes/stats.js';
import jikanRouter from './routes/jikan.js';

import client from 'prom-client';
import onFinished from 'on-finished';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// === Prometheus metrics ===
// Collect default Node.js process metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics();

// Histogram for HTTP request latency and counts
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP latency in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

// Middleware to record metrics for all routes
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method });
  onFinished(res, () => {
    end({ route: req.route?.path || req.path, code: res.statusCode });
  });
  next();
});

// Expose /metrics for Prometheus to scrape
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
// === End Prometheus metrics ===

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
