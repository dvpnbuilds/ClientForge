"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { seedDrafts } from "@/lib/clientforge/seed";
import { getAllDynamicDrafts, updateDraftBody, setDraftStatus } from "@/lib/clientforge/drafts-store";
import { logAction } from "@/lib/clientforge/audit";
import { DemoHint } from "@/components/demo/demo-hint";
import type { DraftProposal, DraftStatus } from "@/lib/clientforge/types";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DraftCard from "@/components/drafts/draft-card";
import {
  FileText,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";

type FilterType = "all" | DraftStatus;

// Seed drafts are immutable; we track local overrides for status/body changes
function useSeedDraftOverrides() {
  const [overrides, setOverrides] = useState<Map<string, Partial<DraftProposal>>>(new Map());

  const applyOverride = useCallback((id: string, patch: Partial<DraftProposal>) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.set(id, { ...(prev.get(id) ?? {}), ...patch });
      return next;
    });
  }, []);

  const resolve = useCallback(
    (draft: DraftProposal): DraftProposal => {
      const override = overrides.get(draft.id);
      return override ? { ...draft, ...override } : draft;
    },
    [overrides]
  );

  return { applyOverride, resolve };
}

export default function DraftsPage() {
  const { applyOverride, resolve } = useSeedDraftOverrides();
  const [dynamicDrafts, setDynamicDrafts] = useState<DraftProposal[]>(() => getAllDynamicDrafts());
  const [filter, setFilter] = useState<FilterType>("all");

  function refreshDynamic() {
    setDynamicDrafts(getAllDynamicDrafts());
  }

  // Resolved seed drafts (with any local overrides)
  const resolvedSeedDrafts = seedDrafts.map(resolve);

  // Merge: seed first (stable), then dynamic (newest first)
  const allDrafts: DraftProposal[] = [...resolvedSeedDrafts, ...dynamicDrafts];

  const displayed = filter === "all" ? allDrafts : allDrafts.filter((d) => d.status === filter);

  const awaitingCount = allDrafts.filter((d) => d.status === "draft").length;
  const approvedCount = allDrafts.filter((d) => d.status === "approved").length;
  const sentCount = allDrafts.filter((d) => d.status === "sent").length;

  // ── Actions for seed drafts (local override only) ─────────────────────────

  function handleSeedApprove(id: string) {
    const now = new Date().toISOString();
    applyOverride(id, { status: "approved", updatedAt: now, approvedAt: now });
    const draft = seedDrafts.find((d) => d.id === id);
    if (draft) {
      logAction({
        type: "draft_approved",
        label: "Draft Approved",
        detail: `"${draft.subject}" approved`,
        entityType: "draft",
        entityId: id,
        entityLabel: draft.subject,
        relatedLeadId: draft.leadId,
        actor: "user",
        trustBadges: ["Human Approved"],
      });
    }
  }

  function handleSeedSend(id: string) {
    const now = new Date().toISOString();
    applyOverride(id, { status: "sent", updatedAt: now, sentAt: now });
    const draft = seedDrafts.find((d) => d.id === id);
    if (draft) {
      logAction({
        type: "draft_sent",
        label: "Draft Sent",
        detail: `"${draft.subject}" marked as sent`,
        entityType: "draft",
        entityId: id,
        entityLabel: draft.subject,
        relatedLeadId: draft.leadId,
        actor: "user",
        trustBadges: ["Human Approved", "Sent"],
      });
    }
  }

  function handleSeedSaveBody(id: string, body: string) {
    applyOverride(id, { body, updatedAt: new Date().toISOString() });
    const draft = seedDrafts.find((d) => d.id === id);
    if (draft) {
      logAction({
        type: "draft_edited",
        label: "Draft Edited",
        detail: `"${draft.subject}" body edited`,
        entityType: "draft",
        entityId: id,
        entityLabel: draft.subject,
        relatedLeadId: draft.leadId,
        actor: "user",
        trustBadges: ["Edited Before Send"],
      });
    }
  }

  // ── Actions for dynamic drafts (store mutation) ───────────────────────────

  function handleDynamicApprove(id: string) {
    setDraftStatus(id, "approved");
    const draft = dynamicDrafts.find((d) => d.id === id);
    if (draft) {
      logAction({
        type: "draft_approved",
        label: "Draft Approved",
        detail: `"${draft.subject}" approved`,
        entityType: "draft",
        entityId: id,
        entityLabel: draft.subject,
        relatedLeadId: draft.leadId,
        actor: "user",
        trustBadges: ["Human Approved"],
      });
    }
    refreshDynamic();
  }

  function handleDynamicSend(id: string) {
    setDraftStatus(id, "sent");
    const draft = dynamicDrafts.find((d) => d.id === id);
    if (draft) {
      logAction({
        type: "draft_sent",
        label: "Draft Sent",
        detail: `"${draft.subject}" marked as sent`,
        entityType: "draft",
        entityId: id,
        entityLabel: draft.subject,
        relatedLeadId: draft.leadId,
        actor: "user",
        trustBadges: ["Human Approved", "Sent"],
      });
    }
    refreshDynamic();
  }

  function handleDynamicSaveBody(id: string, body: string) {
    updateDraftBody(id, body);
    const draft = dynamicDrafts.find((d) => d.id === id);
    if (draft) {
      logAction({
        type: "draft_edited",
        label: "Draft Edited",
        detail: `"${draft.subject}" body edited`,
        entityType: "draft",
        entityId: id,
        entityLabel: draft.subject,
        relatedLeadId: draft.leadId,
        actor: "user",
        trustBadges: ["Edited Before Send"],
      });
    }
    refreshDynamic();
  }

  const isSeedDraft = (id: string) => seedDrafts.some((d) => d.id === id);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drafts &amp; Proposals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-generated drafts tailored to each lead — review, edit, and approve before sending
          </p>
        </div>
      </div>

      <DemoHint stepId="drafts" />

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Awaiting Review</p>
              <p className="text-2xl font-bold text-foreground">{awaitingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <Send className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="text-2xl font-bold text-foreground">{sentCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "draft", "approved", "sent"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              buttonVariants({ variant: filter === f ? "default" : "outline", size: "sm" }),
              "h-8 text-xs"
            )}
          >
            {f === "all" ? "All" : f === "draft" ? "Awaiting Review" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 opacity-70">
              {f === "all"
                ? allDrafts.length
                : allDrafts.filter((d) => d.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Draft list */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed">
          <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No drafts here</p>
          <p className="text-xs text-muted-foreground">
            Generate drafts from a lead detail page to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((draft) => {
            const seed = isSeedDraft(draft.id);
            return (
              <DraftCard
                key={draft.id}
                draft={draft}
                showLeadLink
                defaultExpanded={false}
                onApprove={draft.status === "draft" ? (seed ? handleSeedApprove : handleDynamicApprove) : undefined}
                onSend={draft.status === "approved" ? (seed ? handleSeedSend : handleDynamicSend) : undefined}
                onSaveBody={draft.status !== "sent" ? (seed ? handleSeedSaveBody : handleDynamicSaveBody) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
