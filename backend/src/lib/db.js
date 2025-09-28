import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.TEST_DB || path.join(__dirname, '../../data/otakulist.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS anime (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE COLLATE NOCASE,
      episodes_total INTEGER DEFAULT 0,
      eps_watched INTEGER DEFAULT 0,
      est_ep_minutes INTEGER DEFAULT 24,
      status TEXT NOT NULL CHECK (status IN ('planned','watching','done')),
      rating INTEGER CHECK (rating BETWEEN 1 AND 10),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
