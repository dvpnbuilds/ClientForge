"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { seedDocuments, seedDocumentChunks } from "@/lib/clientforge/seed";
import { createMockDocument, createMockChunks } from "@/lib/clientforge/factory";
import { logAction } from "@/lib/clientforge/audit";
import { DemoHint } from "@/components/demo/demo-hint";
import type { KnowledgeDocument, DocumentChunk, DocStatus } from "@/lib/clientforge/types";
import { formatDate } from "@/lib/clientforge/formatters";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  Upload,
  FileText,
  File,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Hash,
  HardDrive,
  Search,
} from "lucide-react";
import AddDocumentModal, {
  type AddDocumentFormData,
} from "@/components/knowledge/add-document-modal";
import DocumentDetailPanel from "@/components/knowledge/document-detail-panel";

const STATUS_CONFIG = {
  indexed: {
    label: "Indexed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-200",
    iconClass: "text-green-500",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconClass: "text-yellow-500 animate-spin",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "bg-red-100 text-red-700 border-red-200",
    iconClass: "text-red-500",
  },
} as const;

const TYPE_ICON = {
  pdf: FileText,
  txt: File,
  md: File,
  docx: FileText,
} as const;

type FilterOption = "all" | DocStatus;

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "indexed", label: "Indexed" },
  { value: "processing", label: "Processing" },
  { value: "error", label: "Error" },
];

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(seedDocuments);
  const [chunks, setChunks] = useState<DocumentChunk[]>(seedDocumentChunks);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");

  const selectedDoc = selectedDocId
    ? (documents.find((d) => d.id === selectedDocId) ?? null)
    : null;
  const selectedChunks = selectedDocId
    ? chunks.filter((c) => c.documentId === selectedDocId)
    : [];

  const filteredDocs =
    filter === "all" ? documents : documents.filter((d) => d.status === filter);

  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const processingCount = documents.filter((d) => d.status === "processing").length;
  const errorCount = documents.filter((d) => d.status === "error").length;
  const totalChunks = documents.reduce((s, d) => s + d.chunkCount, 0);

  const handleAddDocument = useCallback((data: AddDocumentFormData) => {
    const newDoc = createMockDocument(data);
    setDocuments((prev) => [newDoc, ...prev]);
    setShowAddModal(false);

    logAction({
      type: "doc_uploaded",
      label: "Document Uploaded",
      detail: `"${newDoc.name}" uploaded for processing (${data.category})`,
      entityType: "document",
      entityId: newDoc.id,
      entityLabel: newDoc.name,
      actor: "user",
      trustBadges: ["User Submitted"],
      input: `${newDoc.name} (${newDoc.size}, ${newDoc.type})`,
      durationMs: 0,
    });

    // Simulate processing → indexed after 2.8 seconds
    setTimeout(() => {
      const mockChunks = createMockChunks(newDoc.id, data.category);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === newDoc.id
            ? { ...d, status: "indexed" as const, chunkCount: mockChunks.length }
            : d
        )
      );
      setChunks((prev) => [...prev, ...mockChunks]);

      logAction({
        type: "doc_indexed",
        label: "Document Indexed",
        detail: `"${newDoc.name}" indexed — ${mockChunks.length} chunks created`,
        entityType: "document",
        entityId: newDoc.id,
        entityLabel: newDoc.name,
        actor: "system",
        trustBadges: ["Source Cited"],
        output: `${mockChunks.length} chunks created`,
        durationMs: 2800,
      });
    }, 2800);
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {indexedCount} document{indexedCount !== 1 ? "s" : ""} indexed &mdash;{" "}
            {totalChunks} searchable chunks
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={cn(buttonVariants(), "gap-2")}
        >
          <Upload className="w-4 h-4" />
          Add Document
        </button>
      </div>

      <DemoHint stepId="knowledge" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Indexed</p>
              <p className="text-xl font-bold text-foreground">{indexedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Processing</p>
              <p className="text-xl font-bold text-foreground">{processingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Chunks</p>
              <p className="text-xl font-bold text-foreground">{totalChunks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Docs</p>
              <p className="text-xl font-bold text-foreground">{documents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search documents…"
            className="pl-9 h-8 text-sm"
            readOnly
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                buttonVariants({
                  variant: value === filter ? "default" : "outline",
                  size: "sm",
                }),
                "h-8 text-xs gap-1.5"
              )}
            >
              {label}
              {value === "processing" && processingCount > 0 && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1 min-w-4">
                  {processingCount}
                </Badge>
              )}
              {value === "error" && errorCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[9px] h-4 px-1 min-w-4"
                >
                  {errorCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Documents
          </CardTitle>
          <CardDescription className="text-xs">
            Click any document to preview its metadata and indexed chunks.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {filteredDocs.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No documents match this filter.
              </p>
            </div>
          )}

          {filteredDocs.map((doc) => {
            const status = STATUS_CONFIG[doc.status];
            const StatusIcon = status.icon;
            const TypeIcon = TYPE_ICON[doc.type] ?? File;
            const isSelected = doc.id === selectedDocId;

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                  isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                {/* File icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TypeIcon className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {doc.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 flex items-center gap-1 ${status.className}`}
                    >
                      <StatusIcon className={`w-2.5 h-2.5 ${status.iconClass}`} />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {doc.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="uppercase font-medium">{doc.type}</span>
                    <span>&bull;</span>
                    <span>{doc.size}</span>
                    <span>&bull;</span>
                    {doc.chunkCount > 0 ? (
                      <span>{doc.chunkCount} chunks</span>
                    ) : (
                      <span className="opacity-50">— chunks</span>
                    )}
                    <span>&bull;</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>

                {/* Actions — stop propagation so row click doesn't double-fire */}
                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {doc.status === "indexed" && (
                    <button
                      type="button"
                      onClick={() => setSelectedDocId(doc.id)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "text-xs h-7"
                      )}
                    >
                      Preview
                    </button>
                  )}
                  {doc.status === "error" && (
                    <button
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                      )}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upload hint */}
      <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
        <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Add more documents</p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Upload service guides, pricing sheets, process docs, or FAQs. Every document
          makes AI answers more accurate.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 gap-2")}
        >
          <Upload className="w-3.5 h-3.5" />
          Add Document
        </button>
      </div>

      {/* Add document modal */}
      {showAddModal && (
        <AddDocumentModal
          onAdd={handleAddDocument}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Document detail panel */}
      {selectedDoc && (
        <DocumentDetailPanel
          doc={selectedDoc}
          chunks={selectedChunks}
          onClose={() => setSelectedDocId(null)}
        />
      )}
    </div>
  );
}
