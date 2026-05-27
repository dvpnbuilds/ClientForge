import type { DraftProposal, Lead, LeadScoreResult } from './types';

function baseLeadLine(lead: Lead): string {
  return `${lead.name} at ${lead.company}`.trim();
}

export function generateReplyDraft(lead: Lead, scoreResult: LeadScoreResult): DraftProposal {
  const now = new Date().toISOString();
  return {
    id: `draft-${lead.id}-reply-${Date.now()}`,
    leadId: lead.id,
    type: 'reply',
    subject: `Re: ${lead.service} inquiry`,
    body: `Hi ${lead.contactPerson ?? lead.name},

Thanks for reaching out about your ${lead.service.toLowerCase()}. Based on your request, we'd love to arrange a quick call or site visit to confirm scope and timing.

Recommended next step: ${scoreResult.score.toUpperCase()} lead — respond promptly to maintain momentum.

Best,
DV Construction Co.`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    summary: `Reply draft for ${baseLeadLine(lead)}`,
  };
}

export function generateProposalDraft(lead: Lead, scoreResult: LeadScoreResult): DraftProposal {
  const now = new Date().toISOString();
  return {
    id: `draft-${lead.id}-proposal-${Date.now()}`,
    leadId: lead.id,
    type: 'proposal',
    subject: `${lead.service} Proposal — ${lead.company}`,
    body: `Project: ${lead.service}
Client: ${baseLeadLine(lead)}

Scope:
- Review current site conditions
- Finalize timeline and materials
- Deliver phased completion plan

Why this lead matters: ${scoreResult.reason}

Payment: 40/40/20 milestone schedule.`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    summary: `Proposal draft for ${baseLeadLine(lead)}`,
  };
}
