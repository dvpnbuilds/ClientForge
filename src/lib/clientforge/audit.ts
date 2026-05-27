import { useEffect, useSyncExternalStore } from 'react';
import type { ActionLog, ActionType, AuditActor, AuditStatus, LogEntityType } from './types';

const STORAGE_KEY = 'clientforge.audit.logs';
const STORAGE_VERSION = 1;

interface PersistedAuditPayload {
  version: number;
  logs: ActionLog[];
}

const VALID_ACTION_TYPES: ActionType[] = [
  'lead_created',
  'lead_scored',
  'draft_generated',
  'draft_approved',
  'draft_edited',
  'draft_sent',
  'doc_uploaded',
  'doc_indexed',
  'rag_retrieval',
  'chat_response',
];
const VALID_ACTORS: AuditActor[] = ['system', 'user', 'ai'];
const VALID_STATUSES: AuditStatus[] = ['success', 'warning', 'blocked', 'pending'];

let _logs: ActionLog[] = [];
let _hydrated = false;
let _counter = 0;
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

function getNextCounter(logs: ActionLog[]): number {
  return logs.reduce((max, log) => {
    const match = /^log-dyn-(\d+)$/.exec(log.id);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);
}

function readPersistedLogs(): ActionLog[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(sanitizeLog).filter((entry): entry is ActionLog => entry !== null);
    }

    if (!isObject(parsed)) return [];
    if ((parsed.version ?? STORAGE_VERSION) !== STORAGE_VERSION) return [];
    if (!Array.isArray(parsed.logs)) return [];

    return parsed.logs.map(sanitizeLog).filter((entry): entry is ActionLog => entry !== null);
  } catch {
    return [];
  }
}

function persistLogs(logs: ActionLog[]): void {
  if (typeof window === 'undefined') return;

  try {
    const payload: PersistedAuditPayload = {
      version: STORAGE_VERSION,
      logs,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Best-effort persistence only. Ignore storage failures so logging still works in memory.
  }
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

export function hydrateDynamicLogs(): ActionLog[] {
  if (_hydrated) return _logs;
  if (typeof window === 'undefined') return _logs;

  _logs = readPersistedLogs();
  _counter = getNextCounter(_logs);
  _hydrated = true;
  emitChange();
  return _logs;
}

export function useAuditLogs(): ActionLog[] {
  useEffect(() => {
    hydrateDynamicLogs();
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
  hydrateDynamicLogs();

  const entry: ActionLog = {
    id: `log-dyn-${++_counter}`,
    timestamp: new Date().toISOString(),
    actor: 'system',
    status: 'success',
    ...opts,
  };

  _logs = [..._logs, entry];
  persistLogs(_logs);
  emitChange();
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
  _counter = 0;
  _hydrated = true;
  persistLogs(_logs);
  emitChange();
}
