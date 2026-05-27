"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Users,
  FileText,
  ScrollText,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { seedDrafts, seedLeads } from "@/lib/clientforge/seed";
import { getAllDynamicDrafts } from "@/lib/clientforge/drafts-store";
import { getAllDynamicLeads } from "@/lib/clientforge/leads-store";
import {
  isDemoActive,
  getDemoStep,
  DEMO_STEPS,
  subscribeDemoMode,
  setDemoActive,
} from "@/lib/clientforge/demo-mode";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/drafts", label: "Drafts", icon: FileText },
  { href: "/logs", label: "Action Logs", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeDemoMode(() => setTick((t) => t + 1));
  }, []);

  const demoActive = isDemoActive();
  const demoStep = getDemoStep();
  const leadCount = seedLeads.length + getAllDynamicLeads().length;
  const draftCount = seedDrafts.length + getAllDynamicDrafts().length;
  const counts: Record<string, number> = {
    "/leads": leadCount,
    "/drafts": draftCount,
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sidebar-foreground font-semibold text-sm tracking-tight">
            ClientForge
          </span>
          <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">
            AI Business Copilot
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                  )}
                />
                {item.label}
              </div>
              <div className="flex items-center gap-1">
                {counts[item.href] !== undefined && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] bg-sidebar-primary/20 text-sidebar-primary border-0"
                  >
                    {counts[item.href]}
                  </Badge>
                )}
                {active && (
                  <ChevronRight className="w-3 h-3 text-sidebar-foreground/30" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/60 cursor-pointer transition-colors">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
              DV
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              DV Construction Co.
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              Pro Plan
            </p>
          </div>
        </div>
      </div>

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
    </aside>
  );
}
