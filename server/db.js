const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'requests.db');

// Ensure the data directory exists before opening the database file.
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    model TEXT,
    problem TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

const insertRequestStmt = db.prepare(`
  INSERT INTO requests (name, phone, model, problem, created_at)
  VALUES (@name, @phone, @model, @problem, @created_at)
`);

/**
 * Persist a validated lead request.
 * @param {{name: string, phone: string, model: string, problem: string}} data
 * @returns {number} inserted row id
 */
function insertRequest(data) {
  const info = insertRequestStmt.run({
    name: data.name,
    phone: data.phone,
    model: data.model || '',
    problem: data.problem,
    created_at: new Date().toISOString(),
  });
  return info.lastInsertRowid;
}

module.exports = {
  db,
  insertRequest,
};
