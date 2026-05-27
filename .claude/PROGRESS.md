# ClientForge Progress Tracker

## Current Status
Phase 7 COMPLETE.

## Product Name
ClientForge

## Current Phase
Phase 8 — Demo Mode and Portfolio Polish (not started).

## Completed

### 2026-05-27 — Phase 1: Static Product Wireframe

**Completed:**
- Scaffolded Next.js 16 app with TypeScript, Tailwind CSS v4, ESLint
- Installed and configured shadcn/ui v4 (base-ui variant, Tailwind v4 compatible)
- Established indigo/blue color palette across globals.css (sidebar dark navy, primary indigo)
- Created `src/lib/mock-data.ts` — centralized mock data for all entities
- Built `src/components/sidebar.tsx` — dark sidebar with logo, nav links, badges, user avatar
- Created `src/app/(dashboard)/layout.tsx` — dashboard route group with sidebar layout
- Created all 9 pages: Landing, Dashboard, Knowledge Base, AI Chat, Leads, Lead Detail, Drafts, Action Logs, Settings

**Commands Run:**
- `npm run build` — PASSED
- `npm run lint` — PASSED

---

### 2026-05-27 — Phase 2: Data Model and Local Persistence

**Completed:**
- Created `src/lib/clientforge/types.ts` — complete TypeScript type system:
  - Primitive unions: `LeadScore`, `LeadStatus`, `DocStatus`, `DocFileType`, `DraftStatus`, `ActionType`, `MessageRole`, `LogEntityType`
  - Entities: `Company`, `KnowledgeDocument`, `DocumentChunk`, `Lead`, `LeadScoreResult`, `Conversation`, `Citation`, `Message`, `DraftProposal`, `ActionLog`, `DashboardStats`
- Created `src/lib/clientforge/seed.ts` — all seed/mock data using typed entities:
  - `seedCompany` — DV Construction Co. profile
  - `seedDocuments` — 6 knowledge documents (with `companyId`, renamed `chunkCount`)
  - `seedDocumentChunks` — 4 sample chunks from indexed docs (ready for Phase 3/4)
  - `seedLeads` — 6 leads (with `companyId`)
  - `seedConversation` — Conversation wrapper entity
  - `seedMessages` — 6 chat messages with properly typed `Citation` (uses `documentId`, `documentName`, `chunkId`)
  - `seedDrafts` — 3 proposals (with `companyId`)
  - `seedActionLogs` — 10 action log entries (with `companyId`)
  - `seedDashboardStats` — derived from seed arrays
- Created `src/lib/clientforge/scoring.ts`:
  - `SCORE_THRESHOLDS` constants
  - `confidenceToScore()`, `scoreLabel()`, `scoreBadgeClass()` helpers
  - `mockScoreResult()` placeholder (shape ready for Phase 5 real scoring)
- Created `src/lib/clientforge/formatters.ts`:
  - `formatCurrency`, `formatDate`, `formatDateLong`, `formatDateShort`, `formatDateTime`, `timeAgo`, `truncate`
  - Eliminates 10 duplicate function definitions spread across 5 page files
- Updated `src/lib/mock-data.ts` → backward-compatibility re-export shim pointing to new locations
- Updated all 6 page files to import from `@/lib/clientforge/seed` and `@/lib/clientforge/formatters`

**Changed Files:**
- `src/lib/clientforge/types.ts` — NEW
- `src/lib/clientforge/seed.ts` — NEW
- `src/lib/clientforge/scoring.ts` — NEW
- `src/lib/clientforge/formatters.ts` — NEW
- `src/lib/mock-data.ts` — converted to re-export shim
- `src/app/(dashboard)/dashboard/page.tsx` — updated imports
- `src/app/(dashboard)/knowledge/page.tsx` — updated imports + `chunks` → `chunkCount`
- `src/app/(dashboard)/chat/page.tsx` — updated imports + `docName` → `documentName`
- `src/app/(dashboard)/leads/page.tsx` — updated imports
- `src/app/(dashboard)/leads/[id]/page.tsx` — updated imports
- `src/app/(dashboard)/drafts/page.tsx` — updated imports
- `src/app/(dashboard)/logs/page.tsx` — updated imports

**Commands Run:**
- `npm run build` — PASSED. 17 static pages generated.
- `npm run lint` — PASSED. No errors.

**Known Limitations:**
- `DocumentChunk` seed data is a small sample only. Full chunk generation is Phase 3.
- `Conversation` entity has one seed conversation. Multi-conversation UI is Phase 4.
- `LeadScoreResult` shape exists but scoring logic is a stub. Real scoring is Phase 5.
- `mock-data.ts` shim kept for safety. Can be deleted after Phase 3 if no external imports remain.

**Next Recommended Step:**
Phase 3 — Knowledge Base Upload.
- File upload UI (text/markdown first, PDF optional)
- Parse uploaded text into chunks
- Store chunk metadata using `DocumentChunk` type from Phase 2
- Update document status: processing → indexed
- Log the `doc_indexed` action using `ActionLog` type

---

### 2026-05-27 — Phase 3: Knowledge Base Upload and Document Ingestion Simulation

**Completed:**
- Added `DocCategory` union type to `src/lib/clientforge/types.ts`
- Added `category: DocCategory` field to `KnowledgeDocument` interface
- Updated all 6 seed documents in `seed.ts` with appropriate category values
- Expanded `seedDocumentChunks` from 4 to 15 chunks across docs 1–4 (richer detail panel previews)
- Created `src/lib/clientforge/factory.ts`:
  - `createMockDocument()` — generates a new `KnowledgeDocument` with `status: "processing"`
  - `createMockChunks()` — generates 6–10 realistic chunks with category-specific content templates (8 categories)
- Created `src/components/knowledge/add-document-modal.tsx`:
  - Form: document name, file type (PDF/TXT/MD/DOCX), category select, description textarea
  - Validates name field, calls `onAdd` callback on submit
  - Informs user of processing simulation behavior
- Created `src/components/knowledge/document-detail-panel.tsx`:
  - Fixed slide-in panel from right with backdrop
  - Shows: file type icon, status badge, metadata grid (chunks, size, uploaded date, category)
  - Chunk list with index badge and token count — processing/error/no-chunks empty states
  - Phase 4 teaser note for indexed documents
- Rewrote `src/app/(dashboard)/knowledge/page.tsx` as `"use client"` component:
  - Local state: `documents`, `chunks`, `selectedDocId`, `showAddModal`, `filter`
  - `handleAddDocument`: creates mock doc, inserts at top of list, triggers `setTimeout(2800ms)` to flip status to `indexed` and append generated chunks
  - Filter buttons: All / Indexed / Processing / Error with live count badges
  - Selected doc row highlights with primary color ring
  - Both "Add Document" buttons (header + empty state hint) open modal
  - Document rows are clickable to open detail panel; "Preview" button also opens panel; "Retry" button stops propagation

**Changed Files:**
- `src/lib/clientforge/types.ts` — added `DocCategory`, added `category` to `KnowledgeDocument`
- `src/lib/clientforge/seed.ts` — added `category` to all 6 docs, expanded `seedDocumentChunks` to 15 entries
- `src/lib/clientforge/factory.ts` — NEW
- `src/components/knowledge/add-document-modal.tsx` — NEW
- `src/components/knowledge/document-detail-panel.tsx` — NEW
- `src/app/(dashboard)/knowledge/page.tsx` — full rewrite as client component

**Commands Run:**
- `npm run lint` — PASSED. No errors.
- `npm run build` — PASSED. 17 static pages generated.

**Known Limitations:**
- `setTimeout` for processing simulation is not cancelled on component unmount (acceptable for Phase 3 demo).
- Search input is read-only (wired to UI but no filtering logic — Phase 4+).
- "Retry" button on error documents is a no-op stub.
- Added documents are session-only — they reset on page refresh (no persistence until Phase 7).
- Chunk count shown in seed docs (e.g. 42 for doc-1) exceeds the 4 preview chunks shown — full indexing is Phase 4.

**Next Recommended Step:**
Phase 4 — RAG Chat with Citations.
- Wire the AI Chat page to retrieve relevant chunks from the knowledge base
- Build a grounded prompt with retrieved context
- Generate AI answer using Claude API
- Display citations linking back to source documents
- Log retrieval + generation actions using `ActionLog` type

---

### 2026-05-27 — Phase 4: Mock Local RAG Chat

**Completed:**
- Created `src/lib/clientforge/retrieval.ts`:
  - `tokenize()` — lowercases, strips punctuation, removes 60+ stopwords, filters <3-char tokens
  - `retrieveChunks(query, documents, chunks, maxResults, minScore)` — keyword scoring: score = matchedTerms / queryTerms; only scans chunks from indexed documents; sorts by score desc, then chunk index asc for stable ordering; returns top N results
  - `RetrievalResult` interface: `{ chunk, document, score, matchedTerms }`
- Created `src/lib/clientforge/answer-generator.ts`:
  - `detectIntent()` — regex-based intent detection: pricing, timeline, warranty, permit, payment, team, process, service, general
  - `generateMockAnswer(query, results)` — builds answer: intent intro + top 3 chunk contents + source attribution; returns `GeneratedAnswer { answer, citations }`
  - Fallback answer when no chunks match: explains what topics are available and suggests uploading docs
- Updated `src/lib/clientforge/types.ts`:
  - Added `score?: number` and `matchedTerms?: string[]` to `Citation` interface (optional, backward-compatible)
- Rewrote `src/app/(dashboard)/chat/page.tsx` as `"use client"` component:
  - State: `messages` (initialized from `seedMessages`), `input`, `isTyping`
  - `handleSubmit(text)`: adds user message → sets isTyping → setTimeout(600–1200ms) → retrieves chunks → generates answer → adds AI message
  - `TypingIndicator` — 3-dot bouncing animation shown while "AI is thinking"
  - `CitationCard` — shows document name, chunk section (§N), relevance badge (High/Good/Related from score), excerpt, matched terms chips
  - `RelevanceBadge` — green High (≥0.5), yellow Good (≥0.25), grey Related (<0.25)
  - `MessageContent` — renders \n line breaks and **bold** text
  - Suggested questions (6) fire `handleSubmit` directly — disabled during typing
  - Input + Send button — disabled during typing; Send disabled when input empty
  - `useEffect` scrolls to bottom on new messages and typing state change
  - Knowledge Base link uses `buttonVariants` on `<Link>` (no asChild)
  - Footer shows chunk count + indexed doc count as live context indicator

**Changed Files:**
- `src/lib/clientforge/types.ts` — added `score?` and `matchedTerms?` to `Citation`
- `src/lib/clientforge/retrieval.ts` — NEW
- `src/lib/clientforge/answer-generator.ts` — NEW
- `src/app/(dashboard)/chat/page.tsx` — full rewrite as client component

**Commands Run:**
- `npm run lint` — PASSED. No errors.
- `npm run build` — PASSED. 17 static pages generated.

**Known Limitations:**
- Retrieval uses keyword matching only (no embeddings or semantic similarity) — won't match synonyms ("price" won't match "fee").
- Only `seedDocumentChunks` (15 chunks from 4 docs) is used — docs added via Phase 3 Knowledge Base UI are not accessible from chat (no global state sharing yet).
- Answer text is constructed from raw chunk content — may read mechanically for some queries.
- Retrieval is synchronous inside setTimeout — performance not relevant at this scale.
- No conversation history fed back into retrieval — each question is independent.
- `seedMessages` pre-populates the chat with a demo conversation; new questions continue from there.

**Questions that work well:**
- "What's your warranty policy?" → 3 warranty chunks, clear answer
- "Do you handle permits?" → 2 permit chunks from FAQ + process docs
- "What does a commercial office renovation cost?" → pricing tier chunk + renovation scope
- "How long does a kitchen renovation take?" → FAQ timeline chunk
- "What's your payment schedule?" → FAQ payment chunk
- "What services do you offer?" → service scope + renovation description
- "Tell me about your team" → team info chunks
- "Can I stay home during renovation?" → FAQ chunk
- "What happens if I want to change scope?" → change order policy chunk

**Next Recommended Step:**
Phase 5 — Lead Intake and Scoring.
- Live lead form (name, company, email, service type, message)
- Rules-based scoring: hot/warm/cold based on service type, message keywords, value signals
- Score explanation visible on lead detail
- Lead appears in leads list immediately
- Lead scoring action logged using `ActionLog` type

---

### 2026-05-27 — Phase 5: Lead Intake and Deterministic Lead Scoring

**Completed:**
- Extended `src/lib/clientforge/types.ts`:
  - Added `BudgetRange`, `LeadTimeline`, `LeadSource` union types
  - Added optional fields to `Lead`: `budgetRange?`, `timeline?`, `source?`, `contactPerson?`, `scoreResult?`
  - Updated `LeadScoreResult` with `numericScore`, `risks[]`, `nextAction` fields
- Rewrote `src/lib/clientforge/scoring.ts` with full deterministic scoring engine:
  - `scoreLead(input: ScoringInput): LeadScoreResult` — 6-factor scoring (budget, timeline, service type, contact completeness, description quality, lead source), 0–100 numeric score
  - `budgetRangeToValue()` — converts budget range to estimated dollar value
  - `inferScoreResult()` — derives LeadScoreResult for seed leads that predate the scoring module
  - Preserved: `SCORE_THRESHOLDS`, `confidenceToScore`, `scoreLabel`, `scoreBadgeClass`
- Created `src/lib/clientforge/leads-store.ts`:
  - Module-level Map store for dynamically created leads
  - `addDynamicLead()`, `getDynamicLead()`, `getAllDynamicLeads()`
- Created `src/components/leads/add-lead-modal.tsx`:
  - Full intake form: name, company, contact person, email, phone, service, budget range, timeline, description, source/channel
  - Validates required fields, calls `onAdd` callback on submit
- Created `src/components/leads/score-breakdown.tsx`:
  - Displays numeric score bar (0–100), Hot/Warm/Cold badge, summary reason
  - Lists positive signals (green), risks/missing info (amber), recommended next action
- Rewrote `src/app/(dashboard)/leads/page.tsx` as "use client" component:
  - Local state: `leads` (seeded + dynamic), `filter`, `search`, `showModal`
  - "Add Lead" button opens modal; on submit: scores lead → adds to store → prepends to list
  - Filter by All/Hot/Warm/Cold, live search by name/company/service
  - Score badge shows numeric score for newly scored leads
- Rewrote `src/app/(dashboard)/leads/[id]/page.tsx` as "use client" component:
  - Uses React `use(params)` for param access (Next.js 16 / App Router pattern)
  - Reads from `seedLeads` OR `leads-store` (for dynamically added leads)
  - Full score breakdown panel: numeric bar, positive signals, risks, recommended next action
  - Shows budget range, timeline, source in contact panel when available
  - Phase 6 CTA placeholder: "Generate Draft Proposal" button disabled with Phase 6 badge
  - Graceful "Lead not found" fallback (no hard 404) for expired session leads

**Changed Files:**
- `src/lib/clientforge/types.ts` — added BudgetRange, LeadTimeline, LeadSource; extended Lead, LeadScoreResult
- `src/lib/clientforge/scoring.ts` — full rewrite with deterministic scoring
- `src/lib/clientforge/leads-store.ts` — NEW
- `src/components/leads/add-lead-modal.tsx` — NEW
- `src/components/leads/score-breakdown.tsx` — NEW
- `src/app/(dashboard)/leads/page.tsx` — full rewrite as client component
- `src/app/(dashboard)/leads/[id]/page.tsx` — full rewrite as client component

**Commands Run:**
- `npm run lint` — PASSED. No errors.
- `npm run build` — PASSED. Lead detail page now dynamic (ƒ) instead of static.

**Scoring Strategy:**
6 deterministic factors, 0–100 total:
1. Budget range (0–25 pts): $100k+ = 25, $50–100k = 20, $25–50k = 15, $10–25k = 10, under $10k = 5, unsure = 0
2. Timeline/urgency (0–20 pts): ASAP = 20, 1–3mo = 15, 3–6mo = 10, 6mo+ = 5, exploring = 0
3. Service type (0–20 pts): commercial/medical = 20, full renovation = 18, addition = 15, kitchen/bath = 12, deck = 8
4. Contact completeness (0–10 pts): email = 3, phone = 3, company = 4
5. Description quality (0–15 pts): detailed = 5, sq footage = 5, specific date = 3, business language = 2
6. Lead source (0–10 pts): referral = 10, google = 7, website = 5, social = 3, other = 2

Thresholds: Hot ≥ 70, Warm ≥ 40, Cold < 40

**Example scores:**
- Hot: commercial office, $100k+ budget, ASAP, email+phone, 200-char description with sq ft, referral → ~92/100
- Warm: kitchen renovation, $25–50k, 3–6 months, email only, short description, website → ~52/100
- Cold: deck, unsure budget, exploring, no email/phone, vague inquiry, social → ~18/100

**Known Limitations:**
- New leads are session-only (module store resets on full page refresh). If user navigates to `/leads/[dynamic-id]` directly after refresh, they see "Lead not found" (not 404, graceful fallback).
- Seed leads use `inferScoreResult()` which approximates scores from their existing `scoreReason` text rather than running full scoring.
- Lead detail page is now dynamically server-rendered (no `generateStaticParams`).
- Filter and search state resets on refresh (acceptable for Phase 5).
- `_leadCounter` is a module-level variable in the leads page — resets on page refresh, which is fine.

**Next Recommended Step:**
Phase 6 — Draft Reply/Proposal Generator.
- Wire "Generate Draft Proposal" button in lead detail page
- Generate structured proposal from lead data + knowledge base chunks
- Editable draft UI with approve/copy actions
- Draft status tracking (draft → approved → sent)
- Log generation and approval using `ActionLog` type

---

### 2026-05-27 — Phase 6: Draft Reply and Proposal Generator

**Completed:**
- Extended `src/lib/clientforge/types.ts`:
  - Added `DraftType = "reply" | "proposal"` union
  - Extended `DraftProposal` with: `type: DraftType`, `leadService?`, `leadScore?`, `updatedAt`, `sentAt?`
- Updated `src/lib/clientforge/seed.ts`:
  - Added `type`, `updatedAt`, `leadService`, `leadScore` to all 3 seed drafts
  - Rewrote seed draft bodies to use the full structured proposal format (Understanding / Scope / Timeline / Investment / Process / Next Steps)
- Created `src/lib/clientforge/drafts.ts`:
  - `generateReplyDraft(lead, scoreResult)` — short conversational reply email (3 paragraphs), adapts opener/CTA to Hot/Warm/Cold score
  - `generateProposalDraft(lead, scoreResult)` — full structured proposal (7 sections), adapts scope bullets/timeline/budget language to lead data
  - `getScopeBullets(service)` — maps service name to scope bullet list (commercial, medical, office, kitchen, bathroom, full home, addition, deck, flip, generic)
  - `getTimelineText(lead)` — timeline paragraph adapts to `LeadTimeline` field
  - `getBudgetText(lead)` — investment paragraph adapts to `BudgetRange` field
  - `getNextStepsText(score)` — CTA sentence adapts to Hot/Warm/Cold score
  - `getReplyOpener(score)` — opener adapts to score tier
  - `getDurationEstimate(service)` — project duration estimate from service type
- Created `src/lib/clientforge/drafts-store.ts`:
  - Module-level store: `_byId` Map and `_byLeadId` Map for fast lookup
  - `addDraft()`, `getDraft()`, `getDraftsForLead()`, `getAllDynamicDrafts()`
  - `updateDraftBody()` — update text + updatedAt
  - `setDraftStatus()` — transitions draft/approved/sent with timestamps
- Created `src/components/drafts/draft-card.tsx`:
  - Expandable card: collapsed preview → full text → editable textarea
  - Badges: type (Reply/Proposal), status (Awaiting Review/Approved/Sent), lead score
  - Actions: Edit, Save, Cancel, Copy to clipboard, Approve, Mark Sent
  - Copy uses `navigator.clipboard` with "Copied!" feedback
  - `onApprove`, `onSend`, `onSaveBody` callbacks (passed only when applicable)
- Rewrote `src/app/(dashboard)/leads/[id]/page.tsx`:
  - Split into `LeadDetailPage` (param reading) + `LeadDetailContent` (hooks + UI) — clean hook ordering
  - Generate buttons: Reply, Proposal, Generate Both — each triggers 800–1300ms simulated delay then produces draft
  - Draft generation uses `generateReplyDraft` / `generateProposalDraft` from drafts.ts
  - Generated drafts stored in drafts-store and shown immediately in right column
  - Seed drafts shown (read-only approve/send); dynamic drafts fully interactive
  - Spinner shown during generation
- Rewrote `src/app/(dashboard)/drafts/page.tsx` as "use client" component:
  - Shows seed drafts + dynamic drafts from drafts-store
  - `useSeedDraftOverrides` hook: tracks local status/body overrides for seed drafts (Map-based)
  - Seed drafts: approve/send mutate local override; dynamic drafts: mutate store
  - Status filter: All / Awaiting Review / Approved / Sent with live counts
  - Empty state when filter has no matches

**Changed Files:**
- `src/lib/clientforge/types.ts` — added `DraftType`, extended `DraftProposal`
- `src/lib/clientforge/seed.ts` — updated all 3 seed drafts with new required fields + improved body copy
- `src/lib/clientforge/drafts.ts` — NEW: template-based generation engine
- `src/lib/clientforge/drafts-store.ts` — NEW: module-level draft store
- `src/components/drafts/draft-card.tsx` — NEW: expandable draft card with full edit/approve/send flow
- `src/app/(dashboard)/leads/[id]/page.tsx` — wired generate buttons, split into page + content components
- `src/app/(dashboard)/drafts/page.tsx` — full rewrite as client component

**Commands Run:**
- `npm run lint` — PASSED. No errors, no warnings.
- `npm run build` — PASSED. All routes compile cleanly.

**Generation Logic:**
- Deterministic, no API calls. Templates parameterised by lead fields.
- Reply: greeting → score-adapted opener → inquiry paraphrase → CTA (urgency adapts to score)
- Proposal: 7 sections — understanding, scope bullets, timeline, investment estimate, process steps, next steps
- Scope adapts by service keyword (commercial, medical, kitchen, bath, full-home, addition, deck, flip)
- Timeline language: ASAP → "mobilise within 2–3 weeks"; exploring → "happy to provide estimate today"
- Budget language: $100k+ → high-value framing; unsure → "fixed-price quote after site walk"
- Score CTA: Hot → schedule this week; Warm → next couple of weeks; Cold → no-obligation offer

**Known Limitations:**
- Dynamic drafts (store) reset on full page refresh — acceptable for Phase 6
- Seed draft approve/send on drafts page uses local React state override (not persisted to store); seed drafts re-appear in original state on refresh
- Reply drafts don't yet quote specific risk flags inline (only proposal does via riskSection)
- Draft editing for seed drafts on the lead detail page is not enabled (seed data read-only at that layer)
- `navigator.clipboard` may not work in non-HTTPS / non-secure contexts (dev server is fine)

---

### 2026-05-27 — Phase 7: Audit Logs and Trust Layer

**Completed:**
- Extended `src/lib/clientforge/types.ts`:
  - Added `ActionType` variants: `lead_created`, `draft_edited`, `draft_sent`, `doc_uploaded`
  - Added `AuditActor = "system" | "user" | "ai"` union type
  - Added `AuditStatus = "success" | "warning" | "blocked" | "pending"` union type
  - Extended `ActionLog` interface with optional fields: `actor?`, `status?`, `trustBadges?`, `relatedLeadId?`
- Created `src/lib/clientforge/audit.ts`:
  - Module-level array store `_logs`
  - `LogActionInput` interface for structured log creation
  - `logAction(opts)` — appends to store, assigns defaults (actor: "system", status: "success")
  - `getAllDynamicLogs()`, `getLogsForEntity(entityId)`, `getLogsForLead(leadId)` — queries by entityId or relatedLeadId
  - `getRecentDynamicLogs(n)` — last N entries reversed
- Wired `logAction()` into all "use client" pages:
  - `leads/page.tsx` → `lead_created` (actor: user) + `lead_scored` (actor: ai) on each new lead
  - `leads/[id]/page.tsx` → `draft_generated` (actor: ai, relatedLeadId) on generate; `draft_approved`, `draft_edited`, `draft_sent` (actor: user, relatedLeadId) on each action
  - `drafts/page.tsx` → same draft lifecycle events for both seed (local overrides) and dynamic drafts
  - `knowledge/page.tsx` → `doc_uploaded` (actor: user) on modal submit; `doc_indexed` (actor: system) after 2800ms processing
  - `chat/page.tsx` → `rag_retrieval` (actor: ai) + `chat_response` (actor: ai) inside setTimeout after each message
- Rebuilt `src/app/(dashboard)/logs/page.tsx` as `"use client"`:
  - Combines `seedActionLogs` + `getAllDynamicLogs()`, sorted newest-first
  - Three live filter rows: Entity (All/Lead/Draft/Document/Chat), Actor (All/AI/User/System), Status (All/Success/Warning/Blocked)
  - Each filter row shows counts; "Clear filters" shortcut shown when any filter active
  - Full `actionConfig` covering all 10 action types with distinct colors and icons
  - Trust badges rendered per-log entry with colour-coded styling
  - Actor badge (system/user/ai) shown on each log card
  - Summary stats: Total Actions, AI Actions count, Trust Badges count
- Updated `src/app/(dashboard)/leads/[id]/page.tsx`:
  - Added `leadLogs` state: `useState(() => getLogsForLead(lead.id))`
  - Refreshed via `setLeadLogs(getLogsForLead(lead.id))` after every logged action
  - Added "Activity Timeline" card in left column (below score breakdown)
  - Mini-timeline shows log entries newest-first: label + detail + trust badge pills + time
  - Empty state: "No activity logged yet."
- Updated `src/app/(dashboard)/dashboard/page.tsx`:
  - Converted to `"use client"` to access module-level audit store
  - Combined `seedActionLogs + getAllDynamicLogs()` sorted by timestamp, slice top 5
  - Extended `actionTypeLabel` and `actionTypeColor` maps to cover all 10 action types

**Changed Files:**
- `src/lib/clientforge/types.ts` — added AuditActor, AuditStatus, 4 new ActionType values, extended ActionLog
- `src/lib/clientforge/audit.ts` — NEW: module-level log store
- `src/app/(dashboard)/leads/page.tsx` — added logAction calls for lead_created + lead_scored
- `src/app/(dashboard)/leads/[id]/page.tsx` — added logAction calls for draft lifecycle, added leadLogs state + mini timeline
- `src/app/(dashboard)/drafts/page.tsx` — added logAction calls for all draft handlers
- `src/app/(dashboard)/knowledge/page.tsx` — added logAction for doc_uploaded + doc_indexed
- `src/app/(dashboard)/chat/page.tsx` — added logAction for rag_retrieval + chat_response
- `src/app/(dashboard)/logs/page.tsx` — full rewrite as "use client" with working filters + trust indicators
- `src/app/(dashboard)/dashboard/page.tsx` — converted to "use client", combined log sources

**Commands Run:**
- `npm run lint` — PASSED. No errors.
- `npm run build` — PASSED. All routes compile cleanly.

**Trust Badges in use:**
- `"User Submitted"` — lead intake form, doc upload
- `"AI Suggested"` — all AI-generated drafts, lead scoring, RAG responses
- `"Human Approved"` — draft approve action
- `"Edited Before Send"` — draft body edit
- `"Requires Review"` — cold leads, newly generated drafts
- `"Source Cited"` — chat responses with RAG citations, indexed docs
- `"Sent"` — draft mark-as-sent action

**Known Limitations:**
- `leadLogs` state in lead detail page is populated only from the current session; seed leads show empty timeline on first visit (no seed log entries by design — seed data has no relatedLeadId)
- Dynamic logs reset on full page refresh (module store is in-memory)
- Status filter on logs page always shows "Success" for seed entries since they predate the `status` field (treated as success by default)

---

### 2026-05-27 — Phase 8: Demo Mode and Portfolio Polish

**Completed:**
- Created `src/lib/clientforge/demo-mode.ts`:
  - `DEMO_STEPS` — 6 steps covering full workflow (knowledge → chat → leads → lead_detail → drafts → logs)
  - `DemoStep` interface: `id`, `title`, `route`, `instruction`, `action`
  - Module-level store: `_active`, `_step`, `_subscribers[]`
  - `subscribeDemoMode(fn)` — returns unsubscribe fn; all subscribers called on state change
  - `isDemoActive()`, `getDemoStep()`, `setDemoActive(v)`, `demoNext()`, `demoPrev()`, `demoGoToStep(n)`
- Created `src/components/demo/demo-banner.tsx`:
  - Fixed bottom bar (`left-64 right-0 z-50`), only rendered when `isDemoActive()`
  - Shows step title, instruction, lightbulb action tip, step counter
  - Clickable progress dots span all 6 steps; active dot is wider (`w-4`)
  - Prev/Next navigate step + route; Next on final step = `setDemoActive(false)`
  - Exit (×) button calls `setDemoActive(false)`
- Created `src/components/demo/start-demo-button.tsx`:
  - Client component; `demoGoToStep(0)` + `setDemoActive(true)` + `router.push('/knowledge')`
  - Used on landing page hero, workflow section, and bottom CTA
- Created `src/components/demo/demo-hint.tsx`:
  - Client component; renders inline tip only when demo active AND current step id matches `stepId` prop
  - Used on all 6 feature pages
- Modified `src/app/(dashboard)/layout.tsx`:
  - Added `<DemoBanner />` as sibling of `<main>`; added `pb-20` to main to clear banner
- Modified `src/components/sidebar.tsx`:
  - Added `subscribeDemoMode` subscriber + demo step progress rail
  - Shows filled/empty segment bar + step title + Exit button when demo active
- Modified `src/app/page.tsx`:
  - Added `<StartDemoButton />` as primary hero CTA and workflow section CTA
  - Added 4-stat strip: pipeline, leads, AI actions, time-to-proposal
  - Updated bottom CTA with guided demo framing
  - Improved footer with portfolio attribution
- Modified `src/app/(dashboard)/dashboard/page.tsx`:
  - Added demo welcome card (shown when demo active) with current step instruction + action tip
  - Added `useEffect` + `subscribeDemoMode` for reactive demo state
- All 6 feature pages (`knowledge`, `chat`, `leads`, `leads/[id]`, `drafts`, `logs`):
  - Added `<DemoHint stepId="..." />` — visible only when demo active and step matches

**Changed Files:**
- `src/lib/clientforge/demo-mode.ts` — NEW
- `src/components/demo/demo-banner.tsx` — NEW
- `src/components/demo/start-demo-button.tsx` — NEW
- `src/components/demo/demo-hint.tsx` — NEW
- `src/app/(dashboard)/layout.tsx` — DemoBanner + pb-20
- `src/components/sidebar.tsx` — demo progress indicator
- `src/app/page.tsx` — StartDemoButton CTAs, stats strip, improved footer
- `src/app/(dashboard)/dashboard/page.tsx` — demo welcome card
- `src/app/(dashboard)/knowledge/page.tsx` — DemoHint
- `src/app/(dashboard)/chat/page.tsx` — DemoHint
- `src/app/(dashboard)/leads/page.tsx` — DemoHint
- `src/app/(dashboard)/leads/[id]/page.tsx` — DemoHint
- `src/app/(dashboard)/drafts/page.tsx` — DemoHint
- `src/app/(dashboard)/logs/page.tsx` — DemoHint

**Commands Run:**
- `npm run lint` — PASSED
- `npm run build` — PASSED. All 11 routes compile (10 static, 1 dynamic).

**Known Limitations:**
- Demo mode is session-only (module store resets on full page refresh). Mid-demo refresh exits demo mode silently.
- Demo banner `left-64` is hardcoded to match `w-64` sidebar. If sidebar width changes, update to match.
- `lead_detail` step routes to `/leads/lead-1` (first seed lead). If that route ever 404s, user sees graceful "Lead not found" fallback.
- No animation/transition on banner appearance (acceptable for Phase 8 scope).

**Next Recommended Phase:**
- Phase 9 — README and portfolio case study (markdown artifact explaining architecture, business value, and tech decisions)
- Or Phase 9 — Real auth + Supabase persistence
