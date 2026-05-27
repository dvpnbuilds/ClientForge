import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BrainCircuit, MessageSquareText, FileText, ScrollText, LayoutDashboard } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, desc: "Overview and recent activity." },
  { label: "Knowledge Base", href: "/knowledge", icon: FileText, desc: "Indexed docs and upload flow." },
  { label: "AI Chat", href: "/chat", icon: MessageSquareText, desc: "Grounded Q&A demo." },
  { label: "Leads", href: "/leads", icon: BrainCircuit, desc: "Intake and AI scoring." },
  { label: "Drafts", href: "/drafts", icon: ScrollText, desc: "Reply and proposal review." },
  { label: "Action Logs", href: "/logs", icon: ScrollText, desc: "Trust layer and audit trail." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-8 py-16 space-y-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium text-primary uppercase tracking-[0.2em]">ClientForge</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            AI business copilot for service companies.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Demo the lead intake, knowledge base, AI chat, draft generation, and trust-layer audit flow from one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/knowledge" className={cn(buttonVariants({ variant: "outline" }))}>
              View Knowledge Base
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(({ label, href, icon: Icon, desc }) => (
            <Link key={href} href={href}>
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{label}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
