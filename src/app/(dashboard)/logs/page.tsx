"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { seedActionLogs } from "@/lib/clientforge/seed";
import { getAllDynamicLogs } from "@/lib/clientforge/audit";
import { DemoHint } from "@/components/demo/demo-hint";
import { formatDateTime } from "@/lib/clientforge/formatters";
import type { ActionLog, ActionType, LogEntityType, AuditActor } from "@/lib/clientforge/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ScrollText,
  Zap,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Send,
  Upload,
  Edit3,
} from "lucide-react";

// ── Action config ─────────────────────────────────────────────────────────────

const actionConfig: Record<ActionType, {
  label: string;
  className: string;
  dotClass: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  rag_retrieval: {
    label: "RAG Retrieval",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    dotClass: "bg-purple-400",
    icon: BookOpen,
  },
  lead_scored: {
    label: "Lead Scored",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    dotClass: "bg-orange-400",
    icon: Users,
  },
  lead_created: {
    label: "Lead Created",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    dotClass: "bg-amber-400",
    icon: Users,
  },
  draft_generated: {
    label: "Draft Generated",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    dotClass: "bg-blue-400",
    icon: FileText,
  },
  draft_approved: {
    label: "Draft Approved",
    className: "bg-green-100 text-green-700 border-green-200",
    dotClass: "bg-green-400",
    icon: CheckCircle2,
  },
  draft_edited: {
    label: "Draft Edited",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
    icon: Edit3,
  },
  draft_sent: {
    label: "Draft Sent",
    className: "bg-sky-100 text-sky-700 border-sky-200",
    dotClass: "bg-sky-400",
    icon: Send,
  },
  doc_indexed: {
    label: "Doc Indexed",
    className: "bg-teal-100 text-teal-700 border-teal-200",
    dotClass: "bg-teal-400",
    icon: BookOpen,
  },
  doc_uploaded: {
    label: "Doc Uploaded",
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
    dotClass: "bg-cyan-400",
    icon: Upload,
  },
  chat_response: {
    label: "Chat Response",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dotClass: "bg-indigo-400",
    icon: MessageSquare,
  },
};

const entityLink: Record<string, (id: string) => string> = {
  lead: (id) => `/leads/${id}`,
  document: () => `/knowledge`,
  chat: () => `/chat`,
  draft: () => `/drafts`,
};

// ── Trust badge styles ────────────────────────────────────────────────────────

const TRUST_BADGE_STYLE: Record<string, string> = {
  "Human Approved": "bg-green-100 text-green-700 border-green-200",
  "AI Suggested": "bg-purple-100 text-purple-700 border-purple-200",
  "Edited Before Send": "bg-blue-100 text-blue-700 border-blue-200",
  "Source Cited": "bg-teal-100 text-teal-700 border-teal-200",
  "Requires Review": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "User Submitted": "bg-gray-100 text-gray-600 border-gray-200",
  Sent: "bg-sky-100 text-sky-700 border-sky-200",
};

const ACTOR_STYLE: Record<string, string> = {
  system: "bg-gray-100 text-gray-600 border-gray-200",
  user: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ai: "bg-purple-100 text-purple-700 border-purple-200",
};

// ── Filter types ──────────────────────────────────────────────────────────────

type EntityFilter = "all" | LogEntityType;
type ActorFilter = "all" | AuditActor;
type StatusFilter = "all" | "success" | "warning" | "blocked";

const ENTITY_FILTERS: { value: EntityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lead", label: "Leads" },
  { value: "draft", label: "Drafts" },
  { value: "document", label: "Documents" },
  { value: "chat", label: "Chat" },
];

const ACTOR_FILTERS: { value: ActorFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI" },
  { value: "user", label: "User" },
  { value: "system", label: "System" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "blocked", label: "Blocked" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActionLogsPage() {
  const [dynamicLogs] = useState<ActionLog[]>(() => getAllDynamicLogs());
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
  const [actorFilter, setActorFilter] = useState<ActorFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allLogs: ActionLog[] = [...seedActionLogs, ...dynamicLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const displayed = allLogs.filter((log) => {
    if (entityFilter !== "all" && log.entityType !== entityFilter) return false;
    if (actorFilter !== "all" && (log.actor ?? "system") !== actorFilter) return false;
    if (statusFilter !== "all" && (log.status ?? "success") !== statusFilter) return false;
    return true;
  });

  const aiCount = allLogs.filter((l) => (l.actor ?? "system") === "ai").length;
  const withBadges = allLogs.filter(
    (l) => l.trustBadges && l.trustBadges.length > 0
  ).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" />
          Action Logs
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Full audit trail of every action — actor, trust indicators, input and output
        </p>
      </div>

      <DemoHint stepId="logs" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Actions</p>
              <p className="text-2xl font-bold text-foreground">{allLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-purple-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">AI Actions</p>
              <p className="text-2xl font-bold text-foreground">{aiCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Trust Badges</p>
              <p className="text-2xl font-bold text-foreground">{withBadges}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-6">
        {/* Entity type */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide w-14 shrink-0">Entity</span>
          {ENTITY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setEntityFilter(value)}
              className={cn(
                buttonVariants({
                  variant: entityFilter === value ? "default" : "outline",
                  size: "sm",
                }),
                "h-7 text-xs"
              )}
            >
              {label}
              <span className="ml-1.5 opacity-60">
                {value === "all"
                  ? allLogs.length
                  : allLogs.filter((l) => l.entityType === value).length}
              </span>
            </button>
          ))}
        </div>
        {/* Actor */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide w-14 shrink-0">Actor</span>
          {ACTOR_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActorFilter(value)}
              className={cn(
                buttonVariants({
                  variant: actorFilter === value ? "default" : "outline",
                  size: "sm",
                }),
                "h-7 text-xs"
              )}
            >
              {label}
              {value !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {allLogs.filter((l) => (l.actor ?? "system") === value).length}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide w-14 shrink-0">Status</span>
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                buttonVariants({
                  variant: statusFilter === value ? "default" : "outline",
                  size: "sm",
                }),
                "h-7 text-xs"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {(entityFilter !== "all" || actorFilter !== "all" || statusFilter !== "all") && (
        <p className="text-xs text-muted-foreground mb-4">
          Showing {displayed.length} of {allLogs.length} entries
          &nbsp;·&nbsp;
          <button
            className="text-primary hover:underline"
            onClick={() => {
              setEntityFilter("all");
              setActorFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </button>
        </p>
      )}

      {/* Timeline */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed">
          <ScrollText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No entries match</p>
          <p className="text-xs text-muted-foreground">Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-3">
            {displayed.map((log) => {
              const action = actionConfig[log.type];
              const ActionIcon = action.icon;
              const href = entityLink[log.entityType]?.(log.entityId) ?? "#";
              const actor = log.actor ?? "system";

              return (
                <div key={log.id} className="relative pl-10">
                  <div
                    className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-background ${action.dotClass}`}
                  />

                  <Card className="shadow-none hover:border-primary/20 transition-colors">
                    <CardHeader className="pt-3 pb-2 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <ActionIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${action.className}`}
                          >
                            {action.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${ACTOR_STYLE[actor]}`}
                          >
                            {actor}
                          </Badge>
                          <Link
                            href={href}
                            className="text-xs text-primary hover:underline truncate max-w-[180px]"
                          >
                            {log.entityLabel}
                          </Link>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-muted-foreground">
                            {formatDateTime(log.timestamp)}
                          </p>
                          {log.durationMs > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              {log.durationMs}ms
                            </p>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xs font-normal text-muted-foreground mt-1 pl-8">
                        {log.detail}
                      </CardTitle>

                      {/* Trust badges */}
                      {log.trustBadges && log.trustBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pl-8">
                          {log.trustBadges.map((badge) => (
                            <span
                              key={badge}
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded border font-medium",
                                TRUST_BADGE_STYLE[badge] ?? "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardHeader>

                    {(log.input || log.output) && (
                      <>
                        <Separator />
                        <CardContent className="px-4 py-3 space-y-2">
                          {log.input && (
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                INPUT
                              </p>
                              <p className="text-[11px] text-foreground bg-muted/40 rounded px-2 py-1.5 leading-relaxed">
                                {log.input}
                              </p>
                            </div>
                          )}
                          {log.output && (
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                OUTPUT
                              </p>
                              <p className="text-[11px] text-foreground bg-primary/5 rounded px-2 py-1.5 leading-relaxed">
                                {log.output}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
