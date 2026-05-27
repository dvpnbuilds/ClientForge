"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEMO_STEPS,
  subscribeDemoMode,
  isDemoActive,
  getDemoStep,
  setDemoActive,
  demoNext,
  demoPrev,
  demoGoToStep,
} from "@/lib/clientforge/demo-mode";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Play, Lightbulb } from "lucide-react";

export function DemoBanner() {
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeDemoMode(() => setTick((t) => t + 1));
  }, []);

  if (!isDemoActive()) return null;

  const stepIndex = getDemoStep();
  const step = DEMO_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === DEMO_STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      setDemoActive(false);
      return;
    }
    demoNext();
    router.push(DEMO_STEPS[getDemoStep()].route);
  }

  function handlePrev() {
    demoPrev();
    router.push(DEMO_STEPS[getDemoStep()].route);
  }

  return (
    <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-primary/30 bg-primary text-primary-foreground shadow-lg">
      <div className="flex items-start gap-4 px-6 py-3">
        {/* Step info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-foreground/20 shrink-0 mt-0.5">
            <Play className="w-3 h-3" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-[10px] px-2">
                Demo Mode
              </Badge>
              <span className="text-sm font-semibold">{step.title}</span>
              <span className="text-xs text-primary-foreground/70">
                {stepIndex + 1} of {DEMO_STEPS.length}
              </span>
            </div>
            <p className="text-xs text-primary-foreground/90 leading-snug">
              {step.instruction}
            </p>
            <p className="text-xs text-primary-foreground/70 mt-0.5 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 shrink-0" />
              {step.action}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 shrink-0 self-center">
          {DEMO_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                demoGoToStep(i);
                router.push(DEMO_STEPS[i].route);
              }}
              className={cn(
                "h-2 rounded-full transition-all",
                i === stepIndex
                  ? "bg-primary-foreground w-4"
                  : "bg-primary-foreground/40 hover:bg-primary-foreground/70 w-2"
              )}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 px-2 text-primary-foreground hover:bg-primary-foreground/20 disabled:opacity-30 gap-1"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs">Prev</span>
          </button>
          <button
            onClick={handleNext}
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-7 px-3 bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs gap-1"
            )}
          >
            {isLast ? "Finish" : "Next"}
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setDemoActive(false)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 w-7 p-0 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
            )}
            aria-label="Exit demo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
