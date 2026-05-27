"use client";

import { use, useState, useCallback } from "react";
import { DemoHint } from "@/components/demo/demo-hint";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { seedLeads, seedDrafts } from "@/lib/clientforge/seed";
import { getDynamicLead } from "@/lib/clientforge/leads-store";
import { inferScoreResult } from "@/lib/clientforge/scoring";
import { generateReplyDraft, generateProposalDraft } from "@/lib/clientforge/drafts";
import {
  addDraft,
  getDraftsForLead,
  updateDraftBody,
  setDraftStatus,
} from "@/lib/clientforge/drafts-store";
import { logAction, useAuditLogs } from "@/lib/clientforge/audit";
import { formatCurrency, formatDateLong } from "@/lib/clientforge/formatters";
import type { Lead, LeadScoreResult, DraftProposal } from "@/lib/clientforge/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ScoreBreakdown from "@/components/leads/score-breakdown";
import DraftCard from "@/components/drafts/draft-card";
import {
  ArrowLeft,
  Flame,
  TrendingUp,
  Minus,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Zap,
  Globe,
  Clock,
  Loader2,
  Activity,
} from "lucide-react";

const scoreConfig = {
  hot: { label: "Hot", className: "bg-red-100 text-red-700 border-red-200", icon: Flame },
  warm: { label: "Warm", className: "bg-orange-100 text-orange-700 border-orange-200", icon: TrendingUp },
  cold: { label: "Cold", className: "bg-blue-100 text-blue-700 border-blue-200", icon: Minus },
};

const statusConfig: Record<string, string> = {
  new: "bg-gray-100 text-gray-600 border-gray-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-purple-100 text-purple-700 border-purple-200",
};

const budgetLabels: Record<string, string> = {
  "under-10k": "Under $10,000",
  "10k-25k": "$10,000 – $25,000",
  "25k-50k": "$25,000 – $50,000",
  "50k-100k": "$50,000 – $100,000",
  "100k-plus": "$100,000+",
  unsure: "Not specified",
};

const timelineLabels: Record<string, string> = {
  asap: "ASAP",
  "1-3months": "1–3 months",
  "3-6months": "3–6 months",
  "6months-plus": "6+ months",
  exploring: "Just exploring",
};

const sourceLabels: Record<string, string> = {
  referral: "Referral",
  google: "Google Search",
  website: "Website",
  social: "Social Media",
  other: "Other",
};

function NotFound() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/leads" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-xs -ml-2")}>
          <ArrowLeft className="w-3.5 h-3.5" />
          All Leads
        </Link>
      </div>
      <div className="text-center py-20">
        <p className="text-lg font-semibold text-foreground mb-2">Lead not found</p>
        <p className="text-sm text-muted-foreground">
          This lead may have been added in a previous session and reset on refresh.
        </p>
      </div>
    </div>
  );
}

// ── Inner component — safe to call hooks here ─────────────────────────────────

function LeadDetailContent({
  lead,
  scoreResult,
}: {
  lead: Lead;
  scoreResult: LeadScoreResult;
}) {
  const seedDraft = lead.draftId ? seedDrafts.find((d) => d.id === lead.draftId) ?? null : null;
  const [dynamicDrafts, setDynamicDrafts] = useState<DraftProposal[]>(() =>
    getDraftsForLead(lead.id)
  );
  const [generating, setGenerating] = useState<"reply" | "proposal" | "both" | null>(null);
  const auditLogs = useAuditLogs();
  const leadLogs = auditLogs.filter((log) => log.relatedLeadId === lead.id || log.entityId === lead.id);

  const allDrafts: DraftProposal[] = [
    ...(seedDraft ? [seedDraft] : []),
    ...dynamicDrafts,
  ];

  const generate = useCallback(
    (type: "reply" | "proposal" | "both") => {
      setGenerating(type);
      const delay = 800 + Math.random() * 500;
      setTimeout(() => {
        const created: DraftProposal[] = [];
        if (type === "reply" || type === "both") {
          const d = generateReplyDraft(lead, scoreResult);
          addDraft(d);
          created.push(d);
          logAction({
            type: "draft_generated",
            label: "Reply Draft Generated",
            detail: `AI generated a reply draft for ${lead.name}`,
            entityType: "draft",
            entityId: d.id,
            entityLabel: d.subject,
            relatedLeadId: lead.id,
            actor: "ai",
            trustBadges: ["AI Suggested", "Requires Review"],
            output: d.subject,
            durationMs: Math.round(delay),
          });
        }
        if (type === "proposal" || type === "both") {
          const d = generateProposalDraft(lead, scoreResult);
          addDraft(d);
          created.push(d);
          logAction({
            type: "draft_generated",
            label: "Proposal Draft Generated",
            detail: `AI generated a proposal for ${lead.name}`,
            entityType: "draft",
            entityId: d.id,
            entityLabel: d.subject,
            relatedLeadId: lead.id,
            actor: "ai",
            trustBadges: ["AI Suggested", "Requires Review"],
            output: d.subject,
            durationMs: Math.round(delay),
          });
        }
        setDynamicDrafts((prev) => [...prev, ...created]);
        setGenerating(null);
      }, delay);
    },
    [lead, scoreResult]
  );

  function handleApprove(id: string) {
    setDraftStatus(id, "approved");
    const draft = dynamicDrafts.find((d) => d.id === id);
    logAction({
      type: "draft_approved",
      label: "Draft Approved",
      detail: `Draft approved for ${lead.name}`,
      entityType: "draft",
      entityId: id,
      entityLabel: draft?.subject ?? id,
      relatedLeadId: lead.id,
      actor: "user",
      trustBadges: ["Human Approved"],
      durationMs: 0,
    });
    setDynamicDrafts(getDraftsForLead(lead.id));
  }

  function handleSend(id: string) {
    setDraftStatus(id, "sent");
    const draft = dynamicDrafts.find((d) => d.id === id);
    logAction({
      type: "draft_sent",
      label: "Draft Sent",
      detail: `Draft marked as sent for ${lead.name}`,
      entityType: "draft",
      entityId: id,
      entityLabel: draft?.subject ?? id,
      relatedLeadId: lead.id,
      actor: "user",
      trustBadges: ["Human Approved", "Sent"],
      durationMs: 0,
    });
    setDynamicDrafts(getDraftsForLead(lead.id));
  }

  function handleSaveBody(id: string, body: string) {
    updateDraftBody(id, body);
    const draft = dynamicDrafts.find((d) => d.id === id);
    logAction({
      type: "draft_edited",
      label: "Draft Edited",
      detail: `Draft body edited by user for ${lead.name}`,
      entityType: "draft",
      entityId: id,
      entityLabel: draft?.subject ?? id,
      relatedLeadId: lead.id,
      actor: "user",
      trustBadges: ["Edited Before Send"],
      durationMs: 0,
    });
    setDynamicDrafts(getDraftsForLead(lead.id));
  }

  const score = scoreConfig[lead.score];
  const ScoreIcon = score.icon;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Link href="/leads" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-xs -ml-2")}>
          <ArrowLeft className="w-3.5 h-3.5" />
          All Leads
        </Link>
      </div>

      <DemoHint stepId="lead_detail" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
            <Badge variant="outline" className={`flex items-center gap-1 ${score.className}`}>
              <ScoreIcon className="w-3 h-3" />
              {score.label}
              <span className="ml-0.5 opacity-70">{scoreResult.numericScore}</span>
            </Badge>
            <Badge variant="outline" className={`capitalize ${statusConfig[lead.status]}`}>
              {lead.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{lead.company || lead.service}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            {lead.value > 0 ? formatCurrency(lead.value) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Estimated value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {lead.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline truncate">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{lead.phone}</span>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{lead.company}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-foreground">{formatDateLong(lead.createdAt)}</span>
              </div>
              {lead.value > 0 && (
                <div className="flex items-center gap-2.5 text-sm">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">{formatCurrency(lead.value)} est.</span>
                </div>
              )}
              {lead.budgetRange && (
                <div className="flex items-center gap-2.5 text-sm">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    Budget: {budgetLabels[lead.budgetRange] ?? lead.budgetRange}
                  </span>
                </div>
              )}
              {lead.timeline && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    Timeline: {timelineLabels[lead.timeline] ?? lead.timeline}
                  </span>
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    Source: {sourceLabels[lead.source] ?? lead.source}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Lead Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ScoreBreakdown result={scoreResult} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {leadLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No activity logged yet.
                </p>
              ) : (
                <div className="relative space-y-3">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border" />
                  {[...leadLogs].reverse().map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-background bg-primary/40" />
                      <p className="text-[11px] font-medium text-foreground leading-tight">
                        {log.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                        {log.detail}
                      </p>
                      {log.trustBadges && log.trustBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.trustBadges.map((badge) => (
                            <span
                              key={badge}
                              className="text-[9px] px-1.5 py-0.5 rounded border bg-muted/60 text-muted-foreground"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[9px] text-muted-foreground/60 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Inquiry */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Client Inquiry</CardTitle>
              <CardDescription className="text-xs">{lead.service}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-sm text-foreground leading-relaxed">&ldquo;{lead.message}&rdquo;</p>
            </CardContent>
          </Card>

          {/* Drafts section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Drafts &amp; Proposals
                {allDrafts.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {allDrafts.length}
                  </Badge>
                )}
              </h3>
              {generating ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating…
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => generate("reply")}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-7 gap-1")}
                  >
                    <Mail className="w-3 h-3" />
                    Reply
                  </button>
                  <button
                    onClick={() => generate("proposal")}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-7 gap-1")}
                  >
                    <FileText className="w-3 h-3" />
                    Proposal
                  </button>
                  <button
                    onClick={() => generate("both")}
                    className={cn(buttonVariants({ size: "sm" }), "text-xs h-7 gap-1.5")}
                  >
                    <Zap className="w-3 h-3" />
                    Generate Both
                  </button>
                </div>
              )}
            </div>

            {allDrafts.length === 0 && !generating && (
              <div className="rounded-xl border border-dashed px-4 py-8 text-center">
                <FileText className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">No drafts yet</p>
                <p className="text-xs text-muted-foreground">
                  Generate a reply email or full proposal tailored to this lead.
                </p>
              </div>
            )}

            {generating && allDrafts.length === 0 && (
              <div className="rounded-xl border px-4 py-8 text-center bg-primary/3">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Tailoring draft to {lead.name}&apos;s inquiry…
                </p>
              </div>
            )}

            {allDrafts.map((draft) => {
              const isDynamic = dynamicDrafts.some((d) => d.id === draft.id);
              return (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  showLeadLink={false}
                  defaultExpanded={allDrafts.length === 1}
                  onApprove={isDynamic ? handleApprove : undefined}
                  onSend={isDynamic ? handleSend : undefined}
                  onSaveBody={isDynamic ? handleSaveBody : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page entry point ───────────────────────────────────────────────────────────

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lead: Lead | undefined = seedLeads.find((l) => l.id === id) ?? getDynamicLead(id);
  if (!lead) return <NotFound />;
  const scoreResult = lead.scoreResult ?? inferScoreResult(lead.id, lead.score, lead.scoreReason);
  return <LeadDetailContent lead={lead} scoreResult={scoreResult} />;
}
