import type { ActionLog, DocumentChunk, DraftProposal, KnowledgeDocument, Lead, Message } from './types';

const now = new Date('2026-05-27T10:30:00.000Z').getTime();
const iso = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString();

export const seedDocuments: KnowledgeDocument[] = [
  { id: 'doc-1', name: 'Company Profile.pdf', description: 'Overview of services, team, and core positioning.', type: 'pdf', size: '2.4 MB', status: 'indexed', uploadedAt: iso(2400), chunkCount: 4, category: 'profile' },
  { id: 'doc-2', name: 'Service Pricing.md', description: 'Rates, payment schedules, and common pricing notes.', type: 'md', size: '18 KB', status: 'indexed', uploadedAt: iso(1800), chunkCount: 3, category: 'pricing' },
  { id: 'doc-3', name: 'Warranty FAQ.txt', description: 'Warranty coverage and support policies.', type: 'txt', size: '7 KB', status: 'indexed', uploadedAt: iso(1200), chunkCount: 3, category: 'faq' },
];

export const seedDocumentChunks: DocumentChunk[] = [
  { id: 'chunk-1', documentId: 'doc-1', index: 0, title: 'Services', content: 'We handle residential and commercial renovations, fit-outs, repairs, and project management.' },
  { id: 'chunk-2', documentId: 'doc-1', index: 1, title: 'Process', content: 'Every project starts with a site visit, scoping, and a written proposal.' },
  { id: 'chunk-3', documentId: 'doc-1', index: 2, title: 'Permits', content: 'Permit support is available depending on project scope and local requirements.' },
  { id: 'chunk-4', documentId: 'doc-1', index: 3, title: 'Warranty', content: 'Workmanship warranty is 12 months unless otherwise noted in the proposal.' },
  { id: 'chunk-5', documentId: 'doc-2', index: 0, title: 'Small jobs', content: 'Minor repairs start at $500 and scale based on complexity.' },
  { id: 'chunk-6', documentId: 'doc-2', index: 1, title: 'Renovations', content: 'Kitchen and bathroom renovations typically range from $10k to $50k.' },
  { id: 'chunk-7', documentId: 'doc-2', index: 2, title: 'Payment', content: 'Standard payment schedule is 40/40/20 with milestone-based invoicing.' },
  { id: 'chunk-8', documentId: 'doc-3', index: 0, title: 'Coverage', content: 'Warranty covers workmanship defects reported within the coverage window.' },
  { id: 'chunk-9', documentId: 'doc-3', index: 1, title: 'Support', content: 'Clients can request support by email or phone during business hours.' },
  { id: 'chunk-10', documentId: 'doc-3', index: 2, title: 'Exclusions', content: 'Wear-and-tear, misuse, and third-party alterations are excluded.' },
];

export const seedLeads: Lead[] = [
  { id: 'lead-1', companyId: 'company-1', name: 'Marcus Chen', company: 'Chen Construction LLC', contactPerson: 'Marcus Chen', email: 'marcus@chenconstruction.com', phone: '+1 555-0123', service: 'Kitchen renovation', message: 'Need a quote for a full kitchen renovation next month.', score: 'hot', scoreReason: 'High budget, near-term timeline, and clear project scope.', status: 'new', value: 42000, createdAt: iso(300), budgetRange: '25k-50k', timeline: 'asap', source: 'website', scoreResult: { leadId: 'lead-1', score: 'hot', numericScore: 86, reason: 'High budget, near-term timeline, and clear project scope.', breakdown: [ { label: 'Budget', score: 32, note: 'Strong project size' }, { label: 'Timeline', score: 28, note: 'Starts soon' }, { label: 'Service match', score: 26, note: 'Core renovation service' } ] }, draftId: 'draft-1' },
  { id: 'lead-2', companyId: 'company-1', name: 'Sarah Okafor', company: 'Bloom & Vine Clinic', contactPerson: 'Sarah Okafor', email: 'sarah@bloomvine.com', phone: '+1 555-0456', service: 'Clinic fit-out', message: 'Looking to fit out a small clinic over the next quarter.', score: 'warm', scoreReason: 'Good budget and fit, but timeline is less urgent.', status: 'contacted', value: 18000, createdAt: iso(900), budgetRange: '10k-25k', timeline: '3-6months', source: 'referral', scoreResult: { leadId: 'lead-2', score: 'warm', numericScore: 63, reason: 'Good budget and fit, but timeline is less urgent.', breakdown: [ { label: 'Budget', score: 20, note: 'Healthy budget' }, { label: 'Timeline', score: 12, note: 'Not immediate' }, { label: 'Service match', score: 31, note: 'Strong match' } ] }, draftId: 'draft-2' },
  { id: 'lead-3', companyId: 'company-1', name: 'Jake Thornton', company: 'Thornton Realty Group', contactPerson: 'Jake Thornton', email: 'jake@thorntonrealty.com', phone: '+1 555-0789', service: 'Office refresh', message: 'Just exploring options for a future office refresh.', score: 'cold', scoreReason: 'Early-stage inquiry with no clear budget or immediate timeline.', status: 'new', value: 6000, createdAt: iso(1500), budgetRange: 'unsure', timeline: 'exploring', source: 'google', scoreResult: { leadId: 'lead-3', score: 'cold', numericScore: 31, reason: 'Early-stage inquiry with no clear budget or immediate timeline.', breakdown: [ { label: 'Budget', score: 6, note: 'Budget unclear' }, { label: 'Timeline', score: 4, note: 'Only exploring' }, { label: 'Service match', score: 21, note: 'Relevant but early' } ] } },
  { id: 'lead-4', companyId: 'company-1', name: 'Elena Cruz', company: 'Cruz Interiors', contactPerson: 'Elena Cruz', email: 'elena@cruzinteriors.com', phone: '+1 555-0912', service: 'Commercial renovation', message: 'Need a proposal for a retail renovation before the next fiscal year.', score: 'warm', scoreReason: 'Solid budget and fit, but timeline is moderate.', status: 'qualified', value: 28000, createdAt: iso(2100), budgetRange: '25k-50k', timeline: '1-3months', source: 'social', scoreResult: { leadId: 'lead-4', score: 'warm', numericScore: 71, reason: 'Solid budget and fit, but timeline is moderate.', breakdown: [ { label: 'Budget', score: 24, note: 'Good budget' }, { label: 'Timeline', score: 18, note: 'Soon enough' }, { label: 'Service match', score: 29, note: 'Strong match' } ] } },
];

export const seedDrafts: DraftProposal[] = [
  { id: 'draft-1', leadId: 'lead-1', type: 'reply', subject: 'Re: Kitchen renovation quote', body: "Hi Marcus, thanks for reaching out. We'd love to schedule a quick site visit and prepare a tailored proposal for your kitchen renovation.", status: 'draft', createdAt: iso(295), updatedAt: iso(295), summary: 'Reply draft for lead-1' },
  { id: 'draft-2', leadId: 'lead-1', type: 'proposal', subject: 'Kitchen Renovation Proposal — Chen Construction LLC', body: 'Project overview, scope, timeline, exclusions, and payment schedule.', status: 'approved', createdAt: iso(290), updatedAt: iso(200), approvedAt: iso(200), summary: 'Proposal draft for lead-1' },
  { id: 'draft-3', leadId: 'lead-2', type: 'reply', subject: 'Re: Clinic fit-out inquiry', body: 'Hi Sarah, thanks for the details. We can help with a phased clinic fit-out and will send a scope once we review the site.', status: 'sent', createdAt: iso(860), updatedAt: iso(700), approvedAt: iso(720), sentAt: iso(700), summary: 'Sent reply for lead-2' },
];

export const seedMessages: Message[] = [
  { id: 'msg-seed-1', conversationId: 'conv-1', role: 'user', content: 'What services do you offer?', timestamp: iso(150) },
  { id: 'msg-seed-2', conversationId: 'conv-1', role: 'assistant', content: 'We offer residential and commercial renovations, fit-outs, repairs, project management, and permit support.', timestamp: iso(148), citations: [ { documentId: 'doc-1', chunkId: 'chunk-1', documentName: 'Company Profile.pdf', excerpt: 'We handle residential and commercial renovations, fit-outs, repairs, and project management.', score: 0.92, matchedTerms: ['renovations', 'fit-outs', 'project management'] } ] },
];

export const seedActionLogs: ActionLog[] = [
  { id: 'log-1', type: 'doc_indexed', label: 'Document Indexed', detail: '"Company Profile.pdf" indexed — 4 chunks created', entityType: 'document', entityId: 'doc-1', entityLabel: 'Company Profile.pdf', actor: 'system', status: 'success', trustBadges: ['Source Cited'], timestamp: iso(2395), durationMs: 2800 },
  { id: 'log-2', type: 'lead_scored', label: 'Lead Scored', detail: 'HOT (86/100) — High budget, near-term timeline, and clear project scope.', entityType: 'lead', entityId: 'lead-1', entityLabel: 'Marcus Chen', actor: 'ai', status: 'success', trustBadges: ['AI Suggested'], relatedLeadId: 'lead-1', timestamp: iso(300), output: 'High budget, near-term timeline, and clear project scope.' },
  { id: 'log-3', type: 'draft_generated', label: 'Reply Draft Generated', detail: 'AI generated a reply draft for Marcus Chen', entityType: 'draft', entityId: 'draft-1', entityLabel: 'Re: Kitchen renovation quote', actor: 'ai', status: 'success', trustBadges: ['AI Suggested', 'Requires Review'], relatedLeadId: 'lead-1', timestamp: iso(295), output: 'Re: Kitchen renovation quote' },
  { id: 'log-4', type: 'draft_approved', label: 'Draft Approved', detail: '"Kitchen Renovation Proposal — Chen Construction LLC" approved', entityType: 'draft', entityId: 'draft-2', entityLabel: 'Kitchen Renovation Proposal — Chen Construction LLC', actor: 'user', status: 'success', trustBadges: ['Human Approved'], relatedLeadId: 'lead-1', timestamp: iso(200) },
  { id: 'log-5', type: 'chat_response', label: 'Chat Response', detail: 'Answered: "What services do you offer?"', entityType: 'chat', entityId: 'msg-seed-2', entityLabel: 'What services do you offer?', actor: 'ai', status: 'success', trustBadges: ['Source Cited'], timestamp: iso(148), input: 'What services do you offer?', output: 'We offer residential and commercial renovations, fit-outs, repairs, project management, and permit support.' },
];

export const seedDashboardStats = {
  totalLeads: seedLeads.length,
  hotLeads: seedLeads.filter((l) => l.score === 'hot').length,
  docsIndexed: seedDocuments.filter((d) => d.status === 'indexed').length,
  draftsReady: seedDrafts.filter((d) => d.status !== 'sent').length,
  pipelineValue: seedLeads.reduce((sum, lead) => sum + lead.value, 0),
};
