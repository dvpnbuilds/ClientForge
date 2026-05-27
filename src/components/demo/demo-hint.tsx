"use client";

import { useEffect, useState } from "react";
import {
  subscribeDemoMode,
  isDemoActive,
  getDemoStep,
  DEMO_STEPS,
} from "@/lib/clientforge/demo-mode";
import { Lightbulb } from "lucide-react";

interface DemoHintProps {
  stepId: string;
}

export function DemoHint({ stepId }: DemoHintProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeDemoMode(() => setTick((t) => t + 1));
  }, []);

  if (!isDemoActive()) return null;

  const step = DEMO_STEPS[getDemoStep()];
  if (step.id !== stepId) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
      <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-primary mb-0.5">
          Demo tip — {step.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {step.action}
        </p>
      </div>
    </div>
  );
}
