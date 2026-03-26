// backend/db.js — SQLite database using sql.js (pure JS, no native compile needed)
const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = process.env.DB_PATH || './data/leads.db';
const dir     = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name  TEXT    NOT NULL,
      last_name   TEXT,
      phone       TEXT    NOT NULL,
      email       TEXT,
      service     TEXT    NOT NULL,
      message     TEXT,
      ip          TEXT,
      status      TEXT    DEFAULT 'new',
      created_at  DATETIME DEFAULT (datetime('now'))
    );
  `);

  _save();
  return db;
}

function _save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function insertLead(lead) {
  db.run(
    `INSERT INTO leads (first_name, last_name, phone, email, service, message, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [lead.firstName, lead.lastName, lead.phone, lead.email, lead.service, lead.message, lead.ip]
  );
  const res = db.exec('SELECT last_insert_rowid() as id');
  const id  = res[0]?.values[0][0];
  _save();
  return id;
}

function getAllLeads() {
  const res = db.exec('SELECT * FROM leads ORDER BY created_at DESC');
  if (!res.length) return [];
  const [{ columns, values }] = res;
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

function updateStatus(id, status) {
  db.run('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
  _save();
}

module.exports = { initDB, insertLead, getAllLeads, updateStatus };
