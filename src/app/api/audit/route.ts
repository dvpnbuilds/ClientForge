import { dbGetAllLogs, dbInsertLog, dbClearAllLogs } from '@/lib/clientforge/audit-db';
import type { ActionLog } from '@/lib/clientforge/types';

export async function GET() {
  const logs = dbGetAllLogs();
  return Response.json(logs);
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
  dbInsertLog(body);
  return new Response(null, { status: 201 });
}

export async function DELETE() {
  dbClearAllLogs();
  return new Response(null, { status: 204 });
}

function isActionLog(value: unknown): value is ActionLog {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.type === 'string' &&
    typeof v.label === 'string' &&
    typeof v.detail === 'string' &&
    typeof v.entityType === 'string' &&
    typeof v.entityId === 'string' &&
    typeof v.entityLabel === 'string' &&
    typeof v.timestamp === 'string'
  );
}
