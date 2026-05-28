export type LeadScore = 'hot' | 'warm' | 'cold';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';
export type DraftStatus = 'draft' | 'approved' | 'sent';
export type DocStatus = 'indexed' | 'processing' | 'error';
export type AuditActor = 'system' | 'user' | 'ai';
export type AuditStatus = 'success' | 'warning' | 'blocked' | 'pending';
export type LogEntityType = 'lead' | 'draft' | 'document' | 'chat';
export type ActionType =
  | 'lead_created'
  | 'lead_scored'
  | 'draft_generated'
  | 'draft_approved'
  | 'draft_edited'
  | 'draft_sent'
  | 'doc_uploaded'
  | 'doc_indexed'
  | 'rag_retrieval'
  | 'chat_response';

export const VALID_ACTION_TYPES: ActionType[] = [
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

export const VALID_LOG_ENTITY_TYPES: LogEntityType[] = ['lead', 'draft', 'document', 'chat'];

export type BudgetRange = 'under-10k' | '10k-25k' | '25k-50k' | '50k-100k' | '100k-plus' | 'unsure';
export type Timeline = 'asap' | '1-3months' | '3-6months' | '6months-plus' | 'exploring';
export type LeadSource = 'referral' | 'google' | 'website' | 'social' | 'other';

export interface LeadScoreBreakdown {
  label: string;
  score: number;
  note: string;
}

export interface LeadScoreResult {
  score: LeadScore;
  numericScore: number;
  reason: string;
  breakdown: LeadScoreBreakdown[];
  leadId: string;
}

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  company: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  score: LeadScore;
  scoreReason: string;
  status: LeadStatus;
  value: number;
  createdAt: string;
  budgetRange?: BudgetRange;
  timeline?: Timeline;
  source?: LeadSource;
  scoreResult?: LeadScoreResult;
  draftId?: string;
}

export interface DraftProposal {
  id: string;
  leadId: string;
  type: 'reply' | 'proposal';
  subject: string;
  body: string;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  sentAt?: string;
  summary?: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'txt' | 'md' | 'docx';
  size: string;
  status: DocStatus;
  uploadedAt: string;
  chunkCount: number;
  category: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  index: number;
  title: string;
  content: string;
}

export interface Citation {
  chunkId?: string;
  documentId?: string;
  documentName: string;
  excerpt: string;
  score?: number;
  matchedTerms?: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface ActionLog {
  id: string;
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
  timestamp: string;
  durationMs?: number;
}
