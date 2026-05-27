"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { seedLeads } from "@/lib/clientforge/seed";
import { addDynamicLead } from "@/lib/clientforge/leads-store";
import { scoreLead, budgetRangeToValue } from "@/lib/clientforge/scoring";
import { logAction } from "@/lib/clientforge/audit";
import { DemoHint } from "@/components/demo/demo-hint";
import type { Lead, LeadScore } from "@/lib/clientforge/types";
import { formatCurrency, formatDateShort } from "@/lib/clientforge/formatters";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddLeadModal, { type LeadFormData } from "@/components/leads/add-lead-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Search,
  Flame,
  TrendingUp,
  Minus,
  ArrowRight,
  DollarSign,
} from "lucide-react";

const scoreConfig = {
  hot: {
    label: "Hot",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: Flame,
    iconClass: "text-red-500",
  },
  warm: {
    label: "Warm",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: TrendingUp,
    iconClass: "text-orange-500",
  },
  cold: {
    label: "Cold",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Minus,
    iconClass: "text-blue-500",
  },
};

const statusConfig: Record<string, string> = {
  new: "bg-gray-100 text-gray-600 border-gray-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-purple-100 text-purple-700 border-purple-200",
};

let _leadCounter = 1000;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [filter, setFilter] = useState<"all" | LeadScore>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  function handleAddLead(data: LeadFormData) {
    const leadId = `lead-${++_leadCounter}`;
    const scoreResult = scoreLead({
      leadId,
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      service: data.service,
      budgetRange: data.budgetRange,
      timeline: data.timeline,
      description: data.description,
      source: data.source,
    });

    const newLead: Lead = {
      id: leadId,
      companyId: "company-1",
      name: data.name,
      company: data.company,
      contactPerson: data.contactPerson || undefined,
      email: data.email,
      phone: data.phone,
      service: data.service,
      message: data.description,
      score: scoreResult.score,
      scoreReason: scoreResult.reason,
      status: "new",
      value: budgetRangeToValue(data.budgetRange),
      createdAt: new Date().toISOString(),
      budgetRange: data.budgetRange,
      timeline: data.timeline,
      source: data.source,
      scoreResult,
    };

    addDynamicLead(newLead);

    logAction({
      type: "lead_created",
      label: "Lead Created",
      detail: `New ${scoreResult.score} lead from ${data.name} for ${data.service}`,
      entityType: "lead",
      entityId: leadId,
      entityLabel: data.name,
      actor: "user",
      trustBadges: ["User Submitted"],
      input: data.description.slice(0, 100),
      durationMs: 0,
    });

    logAction({
      type: "lead_scored",
      label: "Lead Scored",
      detail: `${scoreResult.score.toUpperCase()} (${scoreResult.numericScore}/100) — ${scoreResult.reason}`,
      entityType: "lead",
      entityId: leadId,
      entityLabel: data.name,
      actor: "ai",
      trustBadges: scoreResult.score === "cold"
        ? ["AI Suggested", "Requires Review"]
        : ["AI Suggested"],
      output: scoreResult.reason.slice(0, 120),
      durationMs: Math.round(Math.random() * 30 + 5),
    });

    setLeads((prev) => [newLead, ...prev]);
    setShowModal(false);
  }

  const displayed = leads
    .filter((l) => filter === "all" || l.score === filter)
    .filter((l) =>
      search.trim() === "" ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.service.toLowerCase().includes(search.toLowerCase())
    );

  const hotCount = leads.filter((l) => l.score === "hot").length;
  const warmCount = leads.filter((l) => l.score === "warm").length;
  const coldCount = leads.filter((l) => l.score === "cold").length;
  const pipelineValue = leads.reduce((s, l) => s + l.value, 0);

  return (
    <>
      {showModal && (
        <AddLeadModal onAdd={handleAddLead} onClose={() => setShowModal(false)} />
      )}

      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {leads.length} total leads &mdash; deterministically scored by intent and value
            </p>
          </div>
          <button
            className={cn(buttonVariants(), "gap-2")}
            onClick={() => setShowModal(true)}
          >
            <Users className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        <DemoHint stepId="leads" />

        {/* Score summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="px-4 py-4 flex items-center gap-3">
              <Flame className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Hot</p>
                <p className="text-2xl font-bold text-red-600">{hotCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-4 py-4 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Warm</p>
                <p className="text-2xl font-bold text-orange-600">{warmCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-4 py-4 flex items-center gap-3">
              <Minus className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Cold</p>
                <p className="text-2xl font-bold text-blue-600">{coldCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-4 py-4 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Pipeline</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(pipelineValue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search leads…"
              className="pl-9 h-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "hot", "warm", "cold"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  buttonVariants({
                    variant: filter === f ? "default" : "outline",
                    size: "sm",
                  }),
                  "h-8 text-xs capitalize"
                )}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {filter === "all" ? "All Leads" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Leads`}
              {search && ` — matching "${search}"`}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {displayed.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No leads match the current filter.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="pl-4 text-xs">Name</TableHead>
                    <TableHead className="text-xs">Service</TableHead>
                    <TableHead className="text-xs">Score</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Value</TableHead>
                    <TableHead className="text-xs">Received</TableHead>
                    <TableHead className="text-xs" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.map((lead) => {
                    const score = scoreConfig[lead.score];
                    const ScoreIcon = score.icon;

                    return (
                      <TableRow key={lead.id} className="group">
                        <TableCell className="pl-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {lead.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.company || "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {lead.service}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] flex items-center gap-1 w-fit ${score.className}`}
                          >
                            <ScoreIcon className={`w-2.5 h-2.5 ${score.iconClass}`} />
                            {score.label}
                            {lead.scoreResult && (
                              <span className="ml-0.5 opacity-60">
                                {lead.scoreResult.numericScore}
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${statusConfig[lead.status]}`}
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right text-sm font-medium text-foreground">
                          {lead.value > 0 ? formatCurrency(lead.value) : "—"}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {formatDateShort(lead.createdAt)}
                        </TableCell>
                        <TableCell className="py-3 pr-4">
                          <Link
                            href={`/leads/${lead.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            )}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
