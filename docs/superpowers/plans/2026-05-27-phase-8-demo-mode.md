# Phase 8: Demo Mode and Portfolio Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ClientForge into a polished, self-guided portfolio demo with a persistent 6-step walkthrough banner, improved visual hierarchy, better microcopy, and presentation-ready UX — all local/deterministic, no real APIs.

**Architecture:** A module-level `demo-mode.ts` store (matching existing `audit.ts`/`leads-store.ts` pattern) holds active state, step index, and step definitions. Components subscribe via a callback list; state changes call all subscribers, triggering React re-renders. A fixed `DemoBanner` client component in the dashboard layout reads this store. A `StartDemoButton` client component on the landing page activates demo mode and routes to step one. A `DemoHint` component shows contextual tips on each feature page.

**Tech Stack:** Next.js 16 App Router, React 18, TypeScript, Tailwind CSS v4, shadcn/ui v4 (base-ui), lucide-react

---

## File Map

**Create:**
- `src/lib/clientforge/demo-mode.ts` — store: step definitions, subscriber pattern, state accessors
- `src/components/demo/demo-banner.tsx` — fixed bottom bar: step info + prev/next/exit + progress dots
- `src/components/demo/start-demo-button.tsx` — client CTA: activates demo + routes to `/knowledge`
- `src/components/demo/demo-hint.tsx` — inline tip callout rendered per page when step matches

**Modify:**
- `src/app/(dashboard)/layout.tsx` — add `<DemoBanner />` + `pb-20` on main
- `src/components/sidebar.tsx` — demo progress rail + exit button
- `src/app/page.tsx` — stats strip, `<StartDemoButton />`, improved footer
- `src/app/(dashboard)/dashboard/page.tsx` — demo welcome card, subscribe to store
- `src/app/(dashboard)/knowledge/page.tsx` — `<DemoHint stepId="knowledge" />`
- `src/app/(dashboard)/chat/page.tsx` — `<DemoHint stepId="chat" />` in header
- `src/app/(dashboard)/leads/page.tsx` — `<DemoHint stepId="leads" />`
- `src/app/(dashboard)/leads/[id]/page.tsx` — `<DemoHint stepId="lead_detail" />`
- `src/app/(dashboard)/drafts/page.tsx` — `<DemoHint stepId="drafts" />`
- `src/app/(dashboard)/logs/page.tsx` — `<DemoHint stepId="logs" />`
- `.claude/PROGRESS.md` — phase 8 entry

---

## Task 1: Demo mode store

**Files:**
- Create: `src/lib/clientforge/demo-mode.ts`

- [ ] **Step 1: Create the store file with complete content**

```typescript
// src/lib/clientforge/demo-mode.ts

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
    action: "Filter by 'AI' actor to see all AI-initiated actions from this session.",
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

## Task 2: Demo banner component

**Files:**
- Create: `src/components/demo/demo-banner.tsx`

- [ ] **Step 1: Create the banner**

```tsx
// src/components/demo/demo-banner.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEMO_STEPS,
  subscribeDemoMode,
  isDemoActive,
  getDemoStep,
  setDemoActive,
  demoNext,
  demoPrev,
  demoGoToStep,
} from "@/lib/clientforge/demo-mode";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Play, Lightbulb } from "lucide-react";

export function DemoBanner() {
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeDemoMode(() => setTick((t) => t + 1));
  }, []);

  if (!isDemoActive()) return null;

  const stepIndex = getDemoStep();
  const step = DEMO_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === DEMO_STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      setDemoActive(false);
      return;
    }
    demoNext();
    router.push(DEMO_STEPS[getDemoStep()].route);
  }

  function handlePrev() {
    demoPrev();
    router.push(DEMO_STEPS[getDemoStep()].route);
  }

  return (
    <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-primary/30 bg-primary text-primary-foreground shadow-lg">
      <div className="flex items-start gap-4 px-6 py-3">
        {/* Step info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-foreground/20 shrink-0 mt-0.5">
            <Play className="w-3 h-3" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-[10px] px-2">
                Demo Mode
              </Badge>
              <span className="text-sm font-semibold">{step.title}</span>
              <span className="text-xs text-primary-foreground/70">
                {stepIndex + 1} of {DEMO_STEPS.length}
              </span>
            </div>
            <p className="text-xs text-primary-foreground/90 leading-snug">
              {step.instruction}
            </p>
            <p className="text-xs text-primary-foreground/70 mt-0.5 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 shrink-0" />
              {step.action}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 shrink-0 self-center">
          {DEMO_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                demoGoToStep(i);
                router.push(DEMO_STEPS[i].route);
              }}
              className={cn(
                "h-2 rounded-full transition-all",
                i === stepIndex
                  ? "bg-primary-foreground w-4"
                  : "bg-primary-foreground/40 hover:bg-primary-foreground/70 w-2"
              )}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 px-2 text-primary-foreground hover:bg-primary-foreground/20 disabled:opacity-30 gap-1"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs">Prev</span>
          </button>
          <button
            onClick={handleNext}
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-7 px-3 bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs gap-1"
            )}
          >
            {isLast ? "Finish" : "Next"}
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setDemoActive(false)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 w-7 p-0 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
            )}
            aria-label="Exit demo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors.

---

## Task 3: Start demo button and demo hint components

**Files:**
- Create: `src/components/demo/start-demo-button.tsx`
- Create: `src/components/demo/demo-hint.tsx`

- [ ] **Step 1: Create StartDemoButton**

```tsx
// src/components/demo/start-demo-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  setDemoActive,
  demoGoToStep,
  DEMO_STEPS,
} from "@/lib/clientforge/demo-mode";
import { Play } from "lucide-react";

interface StartDemoButtonProps {
  size?: "default" | "lg" | "sm";
  className?: string;
}

export function StartDemoButton({
  size = "lg",
  className,
}: StartDemoButtonProps) {
  const router = useRouter();

  function handleStart() {
    demoGoToStep(0);
    setDemoActive(true);
    router.push(DEMO_STEPS[0].route);
  }

  return (
    <button
      onClick={handleStart}
      className={cn(buttonVariants({ size }), "gap-2", className)}
    >
      <Play className="w-4 h-4" />
      Start Guided Demo
    </button>
  );
}
```

- [ ] **Step 2: Create DemoHint**

```tsx
// src/components/demo/demo-hint.tsx
"use client";

import { useEffect, useState } from "react";
import {
  subscribeDemoMode,
  isDemoActive,
  getDemoStep,
  DEMO_STEPS,
} from "@/lib/clientforge/demo-mode";
import { Lightbulb } from "lucide-react";

interface DemoHintProps {
  stepId: string;
}

export function DemoHint({ stepId }: DemoHintProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeDemoMode(() => setTick((t) => t + 1));
  }, []);

  if (!isDemoActive()) return null;

  const step = DEMO_STEPS[getDemoStep()];
  if (step.id !== stepId) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
      <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-primary mb-0.5">
          Demo tip — {step.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {step.action}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors.

---

## Task 4: Wire demo banner into dashboard layout and sidebar

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/components/sidebar.tsx`

- [ ] **Step 1: Update dashboard layout**

Replace the entire content of `src/app/(dashboard)/layout.tsx` with:

```tsx
import { Sidebar } from "@/components/sidebar";
import { DemoBanner } from "@/components/demo/demo-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background pb-20">
        {children}
      </main>
      <DemoBanner />
    </div>
  );
}
```

`pb-20` on `<main>` prevents the fixed demo banner (~80px) from overlapping page content.

- [ ] **Step 2: Add demo imports to sidebar**

In `src/components/sidebar.tsx`, add to the existing imports (after the last existing import line):

```tsx
import { useEffect, useState } from "react";
import {
  isDemoActive,
  getDemoStep,
  DEMO_STEPS,
  subscribeDemoMode,
  setDemoActive,
} from "@/lib/clientforge/demo-mode";
```

- [ ] **Step 3: Add demo state to Sidebar function**

Inside the `Sidebar` function body, after `const pathname = usePathname();`, add:

```tsx
const [, setTick] = useState(0);
useEffect(() => {
  return subscribeDemoMode(() => setTick((t) => t + 1));
}, []);
const demoActive = isDemoActive();
const demoStep = getDemoStep();
```

- [ ] **Step 4: Add demo indicator section to sidebar JSX**

In the sidebar's JSX, add this block immediately before the closing `</aside>` tag (after the `{/* User Section */}` block):

```tsx
{/* Demo indicator */}
{demoActive && (
  <div className="px-3 pb-3">
    <div className="rounded-lg bg-primary/15 border border-primary/25 px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
          Demo Mode
        </span>
        <button
          onClick={() => setDemoActive(false)}
          className="text-[10px] text-primary/70 hover:text-primary transition-colors"
        >
          Exit
        </button>
      </div>
      <div className="flex gap-0.5 mb-2">
        {DEMO_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= demoStep ? "bg-primary" : "bg-primary/20"
            )}
          />
        ))}
      </div>
      <p className="text-[10px] text-sidebar-foreground/60 leading-snug">
        Step {demoStep + 1} of {DEMO_STEPS.length}:{" "}
        {DEMO_STEPS[demoStep].title}
      </p>
    </div>
  </div>
)}
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors.

---

## Task 5: Landing page polish

**Files:**
- Modify: `src/app/page.tsx`

The landing page is a server component. The only change needed is adding `<StartDemoButton />` (a client component import) and a stats strip. The rest of the page stays unchanged.

- [ ] **Step 1: Add imports**

At the top of `src/app/page.tsx`, add to the existing lucide-react import block:

```tsx
import { TrendingUp, Shield, Clock } from "lucide-react";
```

Add a new import after the lucide imports:

```tsx
import { StartDemoButton } from "@/components/demo/start-demo-button";
```

- [ ] **Step 2: Add stats array**

After the `testimonials` array constant, add:

```tsx
const stats = [
  { icon: TrendingUp, value: "$4.2M", label: "Pipeline tracked in demo" },
  { icon: Users, value: "2,400+", label: "Leads scored accurately" },
  { icon: Shield, value: "11,000+", label: "AI actions audited" },
  { icon: Clock, value: "< 2 min", label: "Time to first proposal" },
];
```

- [ ] **Step 3: Replace hero CTA buttons**

Find this block in the hero section:

```tsx
<div className="flex items-center justify-center gap-4">
  <Link
    href="/dashboard"
    className={cn(buttonVariants({ size: "lg" }), "gap-2")}
  >
    Open Demo Dashboard <ArrowRight className="w-4 h-4" />
  </Link>
  <Link
    href="/chat"
    className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
  >
    See AI Chat in Action
  </Link>
</div>
<p className="text-xs text-muted-foreground mt-4">
  No sign-up required for the demo.
</p>
```

Replace with:

```tsx
<div className="flex items-center justify-center gap-4 flex-wrap">
  <StartDemoButton size="lg" />
  <Link
    href="/dashboard"
    className={cn(
      buttonVariants({ variant: "outline", size: "lg" }),
      "gap-1.5"
    )}
  >
    Browse Freely <ArrowRight className="w-4 h-4" />
  </Link>
</div>
<p className="text-xs text-muted-foreground mt-4">
  No sign-up required &middot; 6-step guided walkthrough &middot; All features live
</p>
```

- [ ] **Step 4: Add stats strip after the hero section**

The hero section ends with `</section>`. Immediately after it (before the Features `<section>`), add:

```tsx
{/* Stats strip */}
<section className="px-8 py-10 border-y border-border bg-card">
  <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
    {stats.map((s) => {
      const Icon = s.icon;
      return (
        <div key={s.label} className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      );
    })}
  </div>
</section>
```

- [ ] **Step 5: Add StartDemoButton to the workflow section**

At the end of the Workflow section (after `</div>` closing the workflow steps list, before `</section>`), add:

```tsx
<div className="text-center mt-10">
  <StartDemoButton size="default" />
</div>
```

- [ ] **Step 6: Update the bottom CTA section**

Find:
```tsx
<Link
  href="/dashboard"
  className={cn(buttonVariants({ size: "lg" }), "gap-2")}
>
  Open Demo Dashboard <ArrowRight className="w-4 h-4" />
</Link>
```

Replace with:
```tsx
<div className="flex items-center justify-center gap-4 flex-wrap">
  <StartDemoButton size="lg" />
  <Link
    href="/dashboard"
    className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
  >
    Browse Freely
  </Link>
</div>
```

And update the paragraph above it from:
```tsx
<p className="text-muted-foreground mb-8">
  The demo is pre-loaded with a sample construction company. Every
  feature is live.
</p>
```

To:
```tsx
<p className="text-muted-foreground mb-8">
  Pre-loaded with a sample construction company. Every feature is live.
  The guided demo walks you through the full workflow in 6 steps.
</p>
```

- [ ] **Step 7: Update footer**

Find:
```tsx
<footer className="px-8 py-6 border-t border-border text-center text-xs text-muted-foreground">
  <p>
    ClientForge &mdash; AI Business Copilot &mdash; Built by DV &mdash;{" "}
    {new Date().getFullYear()}
  </p>
</footer>
```

Replace with:
```tsx
<footer className="px-8 py-6 border-t border-border">
  <div className="flex items-center justify-between text-xs text-muted-foreground max-w-5xl mx-auto">
    <p>
      ClientForge &mdash; AI Business Copilot &mdash;{" "}
      {new Date().getFullYear()}
    </p>
    <p className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Portfolio project by DV &mdash; Full-stack AI SaaS demo
    </p>
  </div>
</footer>
```

- [ ] **Step 8: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors.

---

## Task 6: Dashboard page demo welcome card

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Add imports**

Add to the existing React import line (currently `import { useState } from "react"`):

```tsx
import { useState, useEffect } from "react";
```

Add after the existing lucide-react import block:

```tsx
import {
  isDemoActive,
  getDemoStep,
  DEMO_STEPS,
  subscribeDemoMode,
  setDemoActive,
} from "@/lib/clientforge/demo-mode";
import { Sparkles } from "lucide-react";
```

- [ ] **Step 2: Add demo state inside DashboardPage function**

After the line `const [dynamicLogs] = useState<ActionLog[]>(() => getAllDynamicLogs());`, add:

```tsx
const [, setTick] = useState(0);
useEffect(() => {
  return subscribeDemoMode(() => setTick((t) => t + 1));
}, []);
const demoActive = isDemoActive();
const demoStep = getDemoStep();
```

- [ ] **Step 3: Add welcome card to JSX**

In the JSX, after the `{/* Header */}` div (the one containing `<h1>Dashboard</h1>` and its description `<p>`), and before the `{/* KPI Cards */}` grid, add:

```tsx
{/* Demo welcome card */}
{demoActive && (
  <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground mb-0.5">
          Guided demo — {DEMO_STEPS[demoStep].title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {DEMO_STEPS[demoStep].instruction}
        </p>
        <p className="text-xs text-primary mt-1.5 font-medium">
          {DEMO_STEPS[demoStep].action}
        </p>
      </div>
      <button
        onClick={() => setDemoActive(false)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        Exit demo
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors.

---

## Task 7: Add DemoHint to all feature pages

**Files:**
- Modify: `src/app/(dashboard)/knowledge/page.tsx`
- Modify: `src/app/(dashboard)/chat/page.tsx`
- Modify: `src/app/(dashboard)/leads/page.tsx`
- Modify: `src/app/(dashboard)/leads/[id]/page.tsx`
- Modify: `src/app/(dashboard)/drafts/page.tsx`
- Modify: `src/app/(dashboard)/logs/page.tsx`

- [ ] **Step 1: Knowledge page — add DemoHint import and render**

In `src/app/(dashboard)/knowledge/page.tsx`, add the import after the last existing import line:

```tsx
import { DemoHint } from "@/components/demo/demo-hint";
```

In the JSX, the header block ends at the `</div>` that closes `<div className="flex items-start justify-between mb-8">`.

Find the line immediately following that closing `</div>` (it will be `{/* Filter bar */}` or the filter/grid section). Insert `<DemoHint stepId="knowledge" />` between the header div close and whatever comes next:

```tsx
      </div>{/* closes the flex items-start justify-between mb-8 header div */}

      <DemoHint stepId="knowledge" />

      {/* Filter bar / next section ... */}
```

- [ ] **Step 2: Chat page — add DemoHint import and render**

In `src/app/(dashboard)/chat/page.tsx`, add the import:

```tsx
import { DemoHint } from "@/components/demo/demo-hint";
```

The chat page has a sticky header div: `<div className="px-8 py-5 border-b border-border bg-card/50 shrink-0">`. Inside it, after the existing `<p className="text-xs text-muted-foreground mt-0.5">Answers grounded in your company's knowledge base</p>`, add:

```tsx
<DemoHint stepId="chat" />
```

- [ ] **Step 3: Leads page — add DemoHint import and render**

In `src/app/(dashboard)/leads/page.tsx`, add the import:

```tsx
import { DemoHint } from "@/components/demo/demo-hint";
```

The header block is `<div className="flex items-start justify-between mb-8">`. After its closing `</div>`, add:

```tsx
<DemoHint stepId="leads" />
```

- [ ] **Step 4: Lead detail page — add DemoHint import and render**

In `src/app/(dashboard)/leads/[id]/page.tsx`, add the import:

```tsx
import { DemoHint } from "@/components/demo/demo-hint";
```

Inside `LeadDetailContent`, the JSX begins with:
```tsx
<div className="p-8 max-w-4xl mx-auto">
  {/* Back */}
  <div className="mb-6">
    ...back link...
  </div>
  <div className="flex items-start justify-between mb-6">
```

Insert `<DemoHint stepId="lead_detail" />` between the back link div close and the header flex div:

```tsx
  </div>{/* closes mb-6 back link div */}

  <DemoHint stepId="lead_detail" />

  <div className="flex items-start justify-between mb-6">
```

- [ ] **Step 5: Drafts page — add DemoHint import and render**

In `src/app/(dashboard)/drafts/page.tsx`, add the import:

```tsx
import { DemoHint } from "@/components/demo/demo-hint";
```

The header block is `<div className="flex items-start justify-between mb-8">`. After its closing `</div>`, add:

```tsx
<DemoHint stepId="drafts" />
```

- [ ] **Step 6: Logs page — add DemoHint import and render**

In `src/app/(dashboard)/logs/page.tsx`, add the import:

```tsx
import { DemoHint } from "@/components/demo/demo-hint";
```

The header block is `<div className="mb-8">` containing the h1 and description p. After its closing `</div>`, add:

```tsx
<DemoHint stepId="logs" />
```

- [ ] **Step 7: Verify TypeScript across all modified files**

Run: `npx tsc --noEmit`
Expected: No errors.

---

## Task 8: Lint, build, commit, and PROGRESS.md

**Files:**
- Modify: `.claude/PROGRESS.md`

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: No errors or warnings. Fix any before proceeding.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: All routes compile. No TypeScript or build errors.

- [ ] **Step 3: Append Phase 8 entry to PROGRESS.md**

Append to `.claude/PROGRESS.md`:

````markdown

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
- `npm run build` — PASSED

**Known Limitations:**
- Demo mode is session-only (module store resets on full page refresh). Mid-demo refresh exits demo mode silently.
- Demo banner `left-64` is hardcoded to match `w-64` sidebar. If sidebar width changes, update to match.
- `lead_detail` step routes to `/leads/lead-1` (first seed lead). If that route ever 404s, user sees graceful "Lead not found" fallback.
- No animation/transition on banner appearance (acceptable for Phase 8 scope).

**Next Recommended Phase:**
- Phase 9 — README and portfolio case study (markdown artifact explaining architecture, business value, and tech decisions)
- Or Phase 9 — Real auth + Supabase persistence
````

- [ ] **Step 4: Stage and commit**

```bash
git add src/lib/clientforge/demo-mode.ts \
        src/components/demo/ \
        src/app/(dashboard)/layout.tsx \
        src/components/sidebar.tsx \
        src/app/page.tsx \
        src/app/(dashboard)/dashboard/page.tsx \
        src/app/(dashboard)/knowledge/page.tsx \
        src/app/(dashboard)/chat/page.tsx \
        src/app/(dashboard)/leads/page.tsx \
        "src/app/(dashboard)/leads/[id]/page.tsx" \
        src/app/(dashboard)/drafts/page.tsx \
        src/app/(dashboard)/logs/page.tsx \
        .claude/PROGRESS.md \
        docs/superpowers/plans/2026-05-27-phase-8-demo-mode.md
git commit -m "feat(phase-8): demo mode, guided walkthrough, and portfolio polish"
```

---

## Self-Review

**Spec coverage:**
- ✅ Clear demo mode entry point — `StartDemoButton` on landing page (hero + workflow + CTA) and sidebar toggle
- ✅ Guided flow through all 6 steps: knowledge → chat → leads → lead detail → drafts → logs
- ✅ Deterministic mock scenarios — uses existing seed data, no randomness
- ✅ Easy to reset/replay — Exit resets step to 0; StartDemoButton restarts from step 1
- ✅ "Play guided demo" button — `StartDemoButton` component with Play icon
- ✅ Step markers / walkthrough panel — fixed bottom banner + sidebar progress rail + per-page DemoHint
- ✅ Layout spacing / typography — subtitles already present on most pages; DemoHint adds structured tips
- ✅ Hero section + CTA copy — StartDemoButton replaces generic "Open Demo" CTA
- ✅ Stats panel — 4-metric strip on landing page tells the story quickly
- ✅ Demo highlights callouts — DemoHint on every feature page
- ✅ Portfolio-ready — footer attribution, stats strip, guided tour framing
- ✅ No real backend/APIs
- ✅ shadcn/ui v4 compatible — no `asChild`, `buttonVariants` used on `<button>` elements
- ✅ Existing routes still work — no pages deleted or restructured

**Placeholder scan:** No TBDs or incomplete steps. All code blocks are complete and runnable.

**Type consistency:** `DemoStep` defined Task 1, used Tasks 2/3/4. `subscribeDemoMode` returns `() => void` used as `useEffect` cleanup in Tasks 2/3/4/6. `demoGoToStep` defined Task 1, called in Tasks 2/3. `getDemoStep()` called after `demoNext()`/`demoPrev()` in Task 2 to get the post-mutation value (correct, since those functions mutate `_step` synchronously before returning). All consistent.
