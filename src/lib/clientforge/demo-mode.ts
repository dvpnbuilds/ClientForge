export interface DemoStep {
  id: string;
  title: string;
  route: string;
  instruction: string;
  action: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "knowledge",
    title: "1 · Knowledge Base",
    route: "/knowledge",
    instruction:
      "Upload a document — ClientForge indexes it so the AI can answer questions grounded in your own content, not generic internet data.",
    action: "Click 'Add Document' and upload any sample file to begin.",
  },
  {
    id: "chat",
    title: "2 · AI Chat",
    route: "/chat",
    instruction:
      "Ask the AI anything about your business. Every answer cites the exact source document it came from — full traceability, zero hallucination.",
    action:
      "Try: 'What is your warranty policy?' or 'Do you handle permits?'",
  },
  {
    id: "leads",
    title: "3 · Lead Scoring",
    route: "/leads",
    instruction:
      "New inquiries are scored Hot, Warm, or Cold instantly — based on budget, timeline, and service type. No guessing.",
    action: "Click 'Add Lead', fill in the form, and watch the score appear.",
  },
  {
    id: "lead_detail",
    title: "4 · Draft Generation",
    route: "/leads/lead-1",
    instruction:
      "Open a Hot lead and generate a tailored proposal in seconds. The AI draws from your knowledge base to personalise every section.",
    action:
      "Click 'Generate Both' to produce a reply email and a full structured proposal.",
  },
  {
    id: "drafts",
    title: "5 · Review & Approve",
    route: "/drafts",
    instruction:
      "All AI drafts wait for your review. Edit the text, approve the draft — nothing reaches the client without your sign-off.",
    action: "Expand a draft, edit a line, then click 'Approve'.",
  },
  {
    id: "logs",
    title: "6 · Audit Logs",
    route: "/logs",
    instruction:
      "Every AI action is logged with actor, timestamp, and trust badges. Full accountability — no black boxes anywhere in the pipeline.",
    action:
      "Filter by 'AI' actor to see all AI-initiated actions from this session.",
  },
];

type Subscriber = () => void;
const _subscribers: Subscriber[] = [];
let _active = false;
let _step = 0;

function _notify(): void {
  _subscribers.forEach((fn) => fn());
}

export function subscribeDemoMode(fn: Subscriber): () => void {
  _subscribers.push(fn);
  return () => {
    const i = _subscribers.indexOf(fn);
    if (i > -1) _subscribers.splice(i, 1);
  };
}

export function isDemoActive(): boolean {
  return _active;
}

export function getDemoStep(): number {
  return _step;
}

export function setDemoActive(v: boolean): void {
  _active = v;
  if (!v) _step = 0;
  _notify();
}

export function demoNext(): void {
  if (_step < DEMO_STEPS.length - 1) {
    _step++;
    _notify();
  }
}

export function demoPrev(): void {
  if (_step > 0) {
    _step--;
    _notify();
  }
}

export function demoGoToStep(n: number): void {
  if (n >= 0 && n < DEMO_STEPS.length) {
    _step = n;
    _notify();
  }
}
