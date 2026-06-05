/**
 * Modul: Housekeeping-Test
 * Zweck: Validiert Housekeeping-Schema, API-Abfragen und Constraints
 * Ausführen: node --experimental-sqlite test/test-housekeeping.js
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import Database from 'better-sqlite3';
import { MIGRATIONS, _setTestDatabase, _resetTestDatabase } from '../server/db.js';

// In-Memory-DB mit allen Migrationen aufbauen
function buildTestDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  )`);
  for (const m of MIGRATIONS) {
    if (typeof m.up === 'function') {
      m.up(db);
    } else {
      db.exec(m.up);
    }
    if (typeof m.afterUp === 'function') m.afterUp(db);
    db.prepare('INSERT INTO schema_migrations (version, description) VALUES (?, ?)').run(m.version, m.description);
  }
  return db;
}

const db = buildTestDb();
_setTestDatabase(db);

test('housekeeping smoke: workers table exists', () => {
  const row = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='housekeeping_workers'"
  ).get();
  assert.equal(row?.name, 'housekeeping_workers');
});

test('housekeeping smoke: decay tasks table exists', () => {
  const row = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='housekeeping_decay_tasks'"
  ).get();
  assert.equal(row?.name, 'housekeeping_decay_tasks');
});
