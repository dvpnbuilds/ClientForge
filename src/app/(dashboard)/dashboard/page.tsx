"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  seedDashboardStats,
  seedLeads,
  seedActionLogs,
} from "@/lib/clientforge/seed";
import { getAllDynamicLogs } from "@/lib/clientforge/audit";
import { formatCurrency, timeAgo } from "@/lib/clientforge/formatters";
import type { ActionLog } from "@/lib/clientforge/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  FileText,
  Flame,
  DollarSign,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  isDemoActive,
  getDemoStep,
  DEMO_STEPS,
  subscribeDemoMode,
  setDemoActive,
} from "@/lib/clientforge/demo-mode";

const scoreColor: Record<string, string> = {
  hot: "bg-red-100 text-red-700 border-red-200",
  warm: "bg-orange-100 text-orange-700 border-orange-200",
  cold: "bg-blue-100 text-blue-700 border-blue-200",
};

const actionTypeLabel: Record<string, string> = {
  rag_retrieval: "RAG Retrieval",
  lead_scored: "Lead Scored",
  lead_created: "Lead Created",
  draft_generated: "Draft Generated",
  draft_approved: "Draft Approved",
  draft_edited: "Draft Edited",
  draft_sent: "Draft Sent",
  doc_indexed: "Doc Indexed",
  doc_uploaded: "Doc Uploaded",
  chat_response: "Chat Response",
};

const actionTypeColor: Record<string, string> = {
  rag_retrieval: "bg-purple-100 text-purple-700 border-purple-200",
  lead_scored: "bg-orange-100 text-orange-700 border-orange-200",
  lead_created: "bg-amber-100 text-amber-700 border-amber-200",
  draft_generated: "bg-blue-100 text-blue-700 border-blue-200",
  draft_approved: "bg-green-100 text-green-700 border-green-200",
  draft_edited: "bg-slate-100 text-slate-700 border-slate-200",
  draft_sent: "bg-sky-100 text-sky-700 border-sky-200",
  doc_indexed: "bg-teal-100 text-teal-700 border-teal-200",
  doc_uploaded: "bg-cyan-100 text-cyan-700 border-cyan-200",
  chat_response: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function DashboardPage() {
  const [dynamicLogs] = useState<ActionLog[]>(() => getAllDynamicLogs());
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeDemoMode(() => setTick((t) => t + 1));
  }, []);
  const demoActive = isDemoActive();
  const demoStep = getDemoStep();
  const stats = seedDashboardStats;
  const recentLeads = seedLeads.slice(0, 4);
  const recentLogs = [...seedActionLogs, ...dynamicLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          DV Construction Co. &mdash; AI Business Copilot overview
        </p>
      </div>

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Total Leads
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-foreground">
              {stats.totalLeads}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Hot Leads
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-red-600">{stats.hotLeads}</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Docs Indexed
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-foreground">
              {stats.docsIndexed}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Drafts Ready
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-foreground">
              {stats.draftsReady}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 col-span-2 md:col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Pipeline Value
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.pipelineValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Leads</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Latest inquiries scored by AI
              </CardDescription>
            </div>
            <Link
              href="/leads"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs gap-1"
              )}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {lead.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.service}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-xs font-medium text-foreground">
                    {formatCurrency(lead.value)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${scoreColor[lead.score]}`}
                  >
                    {lead.score}
                  </Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent AI Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent AI Actions</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Latest logged actions
              </CardDescription>
            </div>
            <Link
              href="/logs"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs gap-1"
              )}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${actionTypeColor[log.type]}`}
                    >
                      {actionTypeLabel[log.type]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {log.detail}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {timeAgo(log.timestamp)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/knowledge"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto py-3 flex-col gap-1.5 text-xs"
              )}
            >
              <BookOpen className="w-4 h-4 text-primary" />
              Upload Document
            </Link>
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto py-3 flex-col gap-1.5 text-xs"
              )}
            >
              <Zap className="w-4 h-4 text-primary" />
              Ask AI Anything
            </Link>
            <Link
              href="/leads"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto py-3 flex-col gap-1.5 text-xs"
              )}
            >
              <Users className="w-4 h-4 text-primary" />
              Review Leads
            </Link>
            <Link
              href="/drafts"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto py-3 flex-col gap-1.5 text-xs"
              )}
            >
              <FileText className="w-4 h-4 text-primary" />
              Review Drafts
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
