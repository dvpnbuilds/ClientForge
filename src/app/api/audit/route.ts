import { dbGetAllLogs, dbInsertLog, dbClearAllLogs } from '@/lib/clientforge/audit-db';
import type { ActionLog, ActionType } from '@/lib/clientforge/types';

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

export async function GET() {
  try {
    const logs = dbGetAllLogs();
    return Response.json(logs);
  } catch {
    return new Response('Database error', { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  if (!isActionLog(body)) {
    return new Response('Invalid log shape', { status: 400 });
  }
  try {
    dbInsertLog(body);
  } catch {
    return new Response('Database error', { status: 500 });
  }
  return new Response(null, { status: 201 });
}

export async function DELETE() {
  try {
    dbClearAllLogs();
  } catch {
    return new Response('Database error', { status: 500 });
  }
  return new Response(null, { status: 204 });
}

function isActionLog(value: unknown): value is ActionLog {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    VALID_ACTION_TYPES.includes(v.type as ActionType) &&
    typeof v.label === 'string' &&
    typeof v.detail === 'string' &&
    typeof v.entityType === 'string' &&
    typeof v.entityId === 'string' &&
    typeof v.entityLabel === 'string' &&
    typeof v.timestamp === 'string'
  );
}
