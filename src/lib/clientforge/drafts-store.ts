import type { DraftProposal, DraftStatus } from './types';

const _drafts: DraftProposal[] = [];

export function addDraft(draft: DraftProposal): void {
  _drafts.unshift(draft);
}

export function getAllDynamicDrafts(): DraftProposal[] {
  return [..._drafts];
}

export function getDraftsForLead(leadId: string): DraftProposal[] {
  return _drafts.filter((draft) => draft.leadId === leadId);
}

export function updateDraftBody(id: string, body: string): void {
  const draft = _drafts.find((d) => d.id === id);
  if (!draft) return;
  draft.body = body;
  draft.updatedAt = new Date().toISOString();
}

export function setDraftStatus(id: string, status: DraftStatus): void {
  const draft = _drafts.find((d) => d.id === id);
  if (!draft) return;
  draft.status = status;
  draft.updatedAt = new Date().toISOString();
  if (status === 'approved') draft.approvedAt = draft.updatedAt;
  if (status === 'sent') draft.sentAt = draft.updatedAt;
}
