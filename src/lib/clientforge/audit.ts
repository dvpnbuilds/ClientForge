import { useEffect, useSyncExternalStore } from 'react';
import { VALID_ACTION_TYPES } from './types';
import type { ActionLog, ActionType, AuditActor, AuditStatus, LogEntityType } from './types';

const VALID_ACTORS: AuditActor[] = ['system', 'user', 'ai'];
const VALID_STATUSES: AuditStatus[] = ['success', 'warning', 'blocked', 'pending'];

let _logs: ActionLog[] = [];
let _fetchInitiated = false;
const listeners = new Set<() => void>();

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isActionType(value: unknown): value is ActionType {
  return VALID_ACTION_TYPES.includes(value as ActionType);
}

function isLogEntityType(value: unknown): value is LogEntityType {
  return value === 'lead' || value === 'draft' || value === 'document' || value === 'chat';
}

function isAuditActor(value: unknown): value is AuditActor {
  return VALID_ACTORS.includes(value as AuditActor);
}

function isAuditStatus(value: unknown): value is AuditStatus {
  return VALID_STATUSES.includes(value as AuditStatus);
}

function sanitizeLog(value: unknown): ActionLog | null {
  if (!isObject(value)) return null;

  const {
    id,
    type,
    label,
    detail,
    entityType,
    entityId,
    entityLabel,
    actor,
    status,
    trustBadges,
    relatedLeadId,
    input,
    output,
    timestamp,
    durationMs,
  } = value;

  if (!isString(id) || !isActionType(type) || !isString(label) || !isString(detail)) return null;
  if (!isLogEntityType(entityType) || !isString(entityId) || !isString(entityLabel)) return null;
  if (!isString(timestamp)) return null;

  const entry: ActionLog = {
    id,
    type,
    label,
    detail,
    entityType,
    entityId,
    entityLabel,
    timestamp,
  };

  if (isAuditActor(actor)) entry.actor = actor;
  if (isAuditStatus(status)) entry.status = status;
  if (Array.isArray(trustBadges) && trustBadges.every(isString)) entry.trustBadges = trustBadges;
  if (isString(relatedLeadId)) entry.relatedLeadId = relatedLeadId;
  if (isString(input)) entry.input = input;
  if (isString(output)) entry.output = output;
  if (typeof durationMs === 'number' && Number.isFinite(durationMs)) entry.durationMs = durationMs;

  return entry;
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function loadFromDb(): Promise<void> {
  if (_fetchInitiated) return;
  _fetchInitiated = true;
  try {
    const res = await fetch('/api/audit');
    if (!res.ok) return;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return;
    const fetched = data.map(sanitizeLog).filter((l): l is ActionLog => l !== null);
    // Keep any in-memory logs not yet flushed to DB (written before this fetch returned)
    const fetchedIds = new Set(fetched.map((l) => l.id));
    const localOnly = _logs.filter((l) => !fetchedIds.has(l.id));
    _logs = [...fetched, ...localOnly].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    );
    emitChange();
  } catch {
    // Keep in-memory state on network failure
  }
}

// Kept for backwards compatibility — no-op, loading is now async via useAuditLogs
export function hydrateDynamicLogs(): ActionLog[] {
  return _logs;
}

export function useAuditLogs(): ActionLog[] {
  useEffect(() => {
    void loadFromDb();
  }, []);

  return useSyncExternalStore(subscribe, () => _logs, () => []);
}

export interface LogActionInput {
  type: ActionType;
  label: string;
  detail: string;
  entityType: LogEntityType;
  entityId: string;
  entityLabel: string;
  actor?: AuditActor;
  status?: AuditStatus;
  trustBadges?: string[];
  relatedLeadId?: string;
  input?: string;
  output?: string;
  durationMs?: number;
}

export function logAction(opts: LogActionInput): ActionLog {
  const entry: ActionLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: 'system',
    status: 'success',
    ...opts,
  };

  _logs = [..._logs, entry];
  emitChange();

  // Fire-and-forget — in-memory update is already applied above
  fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(() => {
    // Best-effort persist. Log is already in memory for this session.
  });

  return entry;
}

export function getAllDynamicLogs(): ActionLog[] {
  return [..._logs];
}

export function getLogsForEntity(entityId: string): ActionLog[] {
  return _logs.filter((log) => log.entityId === entityId);
}

export function getLogsForLead(leadId: string): ActionLog[] {
  return _logs.filter((log) => log.relatedLeadId === leadId || log.entityId === leadId);
}

export function getRecentDynamicLogs(n: number): ActionLog[] {
  return [..._logs].slice(-n).reverse();
}

export function clearDynamicLogs(): void {
  _logs = [];
  _fetchInitiated = true; // block re-fetch until DELETE confirms
  emitChange();

  fetch('/api/audit', { method: 'DELETE' })
    .then((res) => {
      if (res.ok) _fetchInitiated = false; // allow fresh load next mount
    })
    .catch(() => {
      _fetchInitiated = false;
    });
}
