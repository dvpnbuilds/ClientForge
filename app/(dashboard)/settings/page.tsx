import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, ShieldCheck, Palette, Database, Sparkles } from "lucide-react";

const preferences = [
  { label: "Notifications", value: "On", icon: Bell },
  { label: "Trust layer", value: "Enabled", icon: ShieldCheck },
  { label: "Theme", value: "Dark glass", icon: Palette },
  { label: "Data store", value: "In-memory demo", icon: Database },
];

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Demo configuration hub for workspace preferences, notifications, and trust controls.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {preferences.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">Demo setting</p>
                </div>
              </div>
              <Badge variant="outline">{value}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Links
          </CardTitle>
          <CardDescription>Jump back into the core demo flows.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            ["Dashboard", "/dashboard"],
            ["Knowledge Base", "/knowledge"],
            ["Leads", "/leads"],
            ["Drafts", "/drafts"],
            ["Logs", "/logs"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className={cn(buttonVariants({ variant: "outline" }))}>
              {label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
