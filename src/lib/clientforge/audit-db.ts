// src/lib/clientforge/audit-db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { ActionLog } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'audit.db');

function openDb(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id            TEXT PRIMARY KEY,
      type          TEXT NOT NULL,
      label         TEXT NOT NULL,
      detail        TEXT NOT NULL,
      entity_type   TEXT NOT NULL,
      entity_id     TEXT NOT NULL,
      entity_label  TEXT NOT NULL,
      actor         TEXT,
      status        TEXT,
      trust_badges  TEXT,
      related_lead_id TEXT,
      input         TEXT,
      output        TEXT,
      timestamp     TEXT NOT NULL,
      duration_ms   REAL
    )
  `);
  return db;
}

const db = openDb();

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO audit_logs
    (id, type, label, detail, entity_type, entity_id, entity_label,
     actor, status, trust_badges, related_lead_id, input, output,
     timestamp, duration_ms)
  VALUES
    (@id, @type, @label, @detail, @entityType, @entityId, @entityLabel,
     @actor, @status, @trustBadges, @relatedLeadId, @input, @output,
     @timestamp, @durationMs)
`);

export function dbInsertLog(log: ActionLog): void {
  insertStmt.run({
    id: log.id,
    type: log.type,
    label: log.label,
    detail: log.detail,
    entityType: log.entityType,
    entityId: log.entityId,
    entityLabel: log.entityLabel,
    actor: log.actor ?? null,
    status: log.status ?? null,
    trustBadges: log.trustBadges ? JSON.stringify(log.trustBadges) : null,
    relatedLeadId: log.relatedLeadId ?? null,
    input: log.input ?? null,
    output: log.output ?? null,
    timestamp: log.timestamp,
    durationMs: log.durationMs ?? null,
  });
}

export function dbGetAllLogs(): ActionLog[] {
  const rows = db
    .prepare('SELECT * FROM audit_logs ORDER BY timestamp ASC')
    .all() as Record<string, unknown>[];
  return rows.map(rowToLog);
}

export function dbClearAllLogs(): void {
  db.prepare('DELETE FROM audit_logs').run();
}

function rowToLog(row: Record<string, unknown>): ActionLog {
  const log: ActionLog = {
    id: row.id as string,
    type: row.type as ActionLog['type'],
    label: row.label as string,
    detail: row.detail as string,
    entityType: row.entity_type as ActionLog['entityType'],
    entityId: row.entity_id as string,
    entityLabel: row.entity_label as string,
    timestamp: row.timestamp as string,
  };
  if (row.actor) log.actor = row.actor as ActionLog['actor'];
  if (row.status) log.status = row.status as ActionLog['status'];
  if (row.trust_badges) {
    try {
      log.trustBadges = JSON.parse(row.trust_badges as string) as string[];
    } catch {
      // malformed JSON — skip trust_badges
    }
  }
  if (row.related_lead_id) log.relatedLeadId = row.related_lead_id as string;
  if (row.input) log.input = row.input as string;
  if (row.output) log.output = row.output as string;
  if (row.duration_ms != null) log.durationMs = row.duration_ms as number;
  return log;
}
