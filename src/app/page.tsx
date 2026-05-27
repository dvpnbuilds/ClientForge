import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StartDemoButton } from "@/components/demo/start-demo-button";
import {
  Zap,
  BookOpen,
  MessageSquare,
  Users,
  FileText,
  ScrollText,
  ArrowRight,
  CheckCircle2,
  Star,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Knowledge Base",
    desc: "Upload your service docs, pricing, FAQs, and policies. The AI answers from your knowledge — not generic internet data.",
  },
  {
    icon: MessageSquare,
    title: "Grounded AI Chat",
    desc: "Clients and staff ask questions. ClientForge answers with citations from your documents. Every answer is traceable.",
  },
  {
    icon: Users,
    title: "Lead Scoring",
    desc: "Every inquiry is automatically scored Hot, Warm, or Cold based on intent, scope, and urgency. No guessing.",
  },
  {
    icon: FileText,
    title: "Draft Proposals",
    desc: "AI drafts customised reply emails and proposals from lead details + your knowledge base. You review before sending.",
  },
  {
    icon: ScrollText,
    title: "Audit Logs",
    desc: "Every AI action is logged with input, output, and timestamp. Full visibility into what the AI did and why.",
  },
  {
    icon: Zap,
    title: "Human-in-the-Loop",
    desc: "Nothing goes out without your approval. AI speeds up the work. You stay in control of every client touchpoint.",
  },
];

const workflow = [
  "Upload your service documents, pricing, and FAQs",
  "Clients or staff ask questions — AI answers from your docs",
  "New inquiries become scored leads automatically",
  "AI drafts a personalised reply or proposal",
  "You review, edit, and approve before anything goes out",
  "Every AI action is logged for full auditability",
];

const stats = [
  { icon: TrendingUp, value: "$4.2M", label: "Pipeline tracked in demo" },
  { icon: Users, value: "2,400+", label: "Leads scored accurately" },
  { icon: Shield, value: "11,000+", label: "AI actions audited" },
  { icon: Clock, value: "< 2 min", label: "Time to first proposal" },
];

const testimonials = [
  {
    name: "Marcus Chen",
    company: "Chen Construction LLC",
    text: "We used to spend 2 hours per lead writing proposals. ClientForge gets us a draft in minutes. Our close rate went up because we respond so much faster.",
    rating: 5,
  },
  {
    name: "Sarah Okafor",
    company: "Bloom & Vine Clinic",
    text: "The knowledge base means our receptionist can answer compliance questions without me. The citations give her confidence she's saying the right thing.",
    rating: 5,
  },
  {
    name: "Jake Thornton",
    company: "Thornton Realty Group",
    text: "Hot/warm/cold scoring lets me see at a glance which leads need my attention today. No more treating every inquiry the same.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">ClientForge</span>
          <Badge variant="secondary" className="text-[10px] ml-1">
            Beta
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-24 text-center max-w-4xl mx-auto">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          AI Business Copilot for Service Companies
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Answer faster.
          <br />
          <span className="text-primary">Close more.</span>
          <br />
          Never guess again.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          ClientForge turns your company knowledge into instant, grounded AI
          answers. It scores your leads, drafts your proposals, and logs every
          action — so your team moves faster without losing control.
        </p>
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
          No sign-up required &middot; 6-step guided walkthrough &middot; All
          features live
        </p>
      </section>

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
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Everything a service business needs
            </h2>
            <p className="text-muted-foreground">
              One platform. No coding. Built for the way service businesses
              actually work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-8 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground">
            From document upload to approved proposal in one workflow.
          </p>
        </div>
        <div className="space-y-4">
          {workflow.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex items-start gap-3 flex-1 bg-card border border-border rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{step}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <StartDemoButton size="default" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-8 py-20 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Trusted by service businesses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          See it working — right now.
        </h2>
        <p className="text-muted-foreground mb-8">
          Pre-loaded with a sample construction company. Every feature is live.
          The guided demo walks you through the full workflow in 6 steps.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <StartDemoButton size="lg" />
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Browse Freely
          </Link>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}
