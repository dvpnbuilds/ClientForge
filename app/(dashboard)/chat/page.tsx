"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { seedDocuments, seedDocumentChunks, seedMessages } from "@/lib/clientforge/seed";
import { retrieveChunks } from "@/lib/clientforge/retrieval";
import { generateMockAnswer } from "@/lib/clientforge/answer-generator";
import { logAction } from "@/lib/clientforge/audit";
import { DemoHint } from "@/components/demo/demo-hint";
import type { Message, Citation } from "@/lib/clientforge/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Send,
  BookOpen,
  Zap,
  Hash,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "How long does a kitchen renovation take?",
  "What's your warranty policy?",
  "Do you handle permits?",
  "What does a commercial office renovation cost?",
  "What's your payment schedule?",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="w-7 h-7 shrink-0 mt-0.5">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          AI
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-card border border-border">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function RelevanceBadge({ score }: { score: number }) {
  if (score >= 0.5)
    return (
      <span className="text-[9px] text-green-700 bg-green-100 border border-green-200 rounded px-1.5 py-0.5 shrink-0 font-medium">
        High
      </span>
    );
  if (score >= 0.25)
    return (
      <span className="text-[9px] text-yellow-700 bg-yellow-100 border border-yellow-200 rounded px-1.5 py-0.5 shrink-0 font-medium">
        Good
      </span>
    );
  return (
    <span className="text-[9px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 shrink-0">
      Related
    </span>
  );
}

function CitationCard({ citation }: { citation: Citation }) {
  const chunkIdx = citation.chunkId
    ? seedDocumentChunks.find((ch) => ch.id === citation.chunkId)?.index
    : undefined;
  const chunkNum = chunkIdx !== undefined ? chunkIdx + 1 : null;

  return (
    <Card className="border-border bg-muted/30 shadow-none">
      <CardContent className="px-3 py-2.5">
        <div className="flex items-start gap-2">
          <BookOpen className="w-3 h-3 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-[10px] font-medium text-foreground truncate">
                  {citation.documentName}
                </p>
                {chunkNum !== null && (
                  <span className="text-[9px] text-muted-foreground bg-muted border border-border/60 rounded px-1.5 py-0.5 shrink-0 font-mono">
                    §{chunkNum}
                  </span>
                )}
              </div>
              {citation.score !== undefined && (
                <RelevanceBadge score={citation.score} />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              &ldquo;{citation.excerpt}&rdquo;
            </p>
            {citation.matchedTerms && citation.matchedTerms.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <Hash className="w-2.5 h-2.5 text-muted-foreground/60 shrink-0" />
                {citation.matchedTerms.map((term) => (
                  <span
                    key={term}
                    className="text-[9px] text-primary/70 bg-primary/8 rounded px-1 py-0.5"
                  >
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MessageContent({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        if (line === "") return <br key={i} />;
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        return (
          <p key={i} className={i > 0 ? "mt-1" : ""}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const indexedCount = seedDocuments.filter((d) => d.status === "indexed").length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setInput("");

      const userMsg: Message = {
        id: `msg-user-${Date.now()}`,
        conversationId: "conv-1",
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Simulate retrieval + generation latency
      const delay = 600 + Math.random() * 600;
      setTimeout(() => {
        const results = retrieveChunks(trimmed, seedDocuments, seedDocumentChunks);
        const { answer, citations } = generateMockAnswer(trimmed, results);

        logAction({
          type: "rag_retrieval",
          label: "RAG Retrieval",
          detail: `Retrieved ${results.length} chunk${results.length !== 1 ? "s" : ""} for query`,
          entityType: "chat",
          entityId: userMsg.id,
          entityLabel: trimmed.slice(0, 60),
          actor: "ai",
          trustBadges: citations.length > 0 ? ["Source Cited"] : [],
          input: trimmed.slice(0, 100),
          output: `${results.length} chunks retrieved`,
          durationMs: Math.round(delay * 0.4),
        });

        const aiMsg: Message = {
          id: `msg-ai-${Date.now()}`,
          conversationId: "conv-1",
          role: "assistant",
          content: answer,
          citations: citations.length > 0 ? citations : undefined,
          timestamp: new Date().toISOString(),
        };

        logAction({
          type: "chat_response",
          label: "Chat Response",
          detail: `Answered: "${trimmed.slice(0, 60)}${trimmed.length > 60 ? "…" : ""}"`,
          entityType: "chat",
          entityId: aiMsg.id,
          entityLabel: trimmed.slice(0, 60),
          actor: "ai",
          trustBadges: citations.length > 0 ? ["Source Cited"] : ["AI Suggested"],
          input: trimmed.slice(0, 100),
          output: answer.slice(0, 120),
          durationMs: Math.round(delay * 0.6),
        });

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, delay);
    },
    [isTyping]
  );

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border bg-card/50 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              AI Chat
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Answers grounded in your company&apos;s knowledge base
            </p>
            <DemoHint stepId="chat" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {indexedCount} docs active
            </div>
            <Link
              href="/knowledge"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-xs gap-1.5"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Knowledge Base
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-6 space-y-6">
          {/* System note */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-primary/8 text-primary text-xs px-3 py-1.5 rounded-full border border-primary/15">
              <Zap className="w-3 h-3" />
              Grounded answers from DV Construction Co. knowledge base
            </div>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[80%] flex flex-col gap-2 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  <MessageContent text={msg.content} />
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="space-y-1.5 w-full">
                    <p className="text-[10px] text-muted-foreground px-1">
                      Sources
                    </p>
                    {msg.citations.map((c, i) => (
                      <CitationCard key={i} citation={c} />
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-muted-foreground px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>

              {msg.role === "user" && (
                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    DV
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested questions */}
      <div className="shrink-0 border-t border-border bg-muted/20">
        <div className="max-w-3xl mx-auto px-8 pt-3 pb-1">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSubmit(q)}
                disabled={isTyping}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Input */}
      <div className="shrink-0 bg-card px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(input);
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your services, pricing, or process…"
              className="flex-1 bg-background"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </form>
          <div className="text-[10px] text-muted-foreground mt-2 text-center">
            Retrieval grounded in{" "}
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 align-middle">
              {seedDocumentChunks.length} chunks
            </Badge>{" "}
            across {indexedCount} indexed documents
          </div>
        </div>
      </div>
    </div>
  );
}
