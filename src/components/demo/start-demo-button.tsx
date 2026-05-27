"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  setDemoActive,
  demoGoToStep,
  DEMO_STEPS,
} from "@/lib/clientforge/demo-mode";
import { Play } from "lucide-react";

interface StartDemoButtonProps {
  size?: "default" | "lg" | "sm";
  className?: string;
}

export function StartDemoButton({
  size = "lg",
  className,
}: StartDemoButtonProps) {
  const router = useRouter();

  function handleStart() {
    demoGoToStep(0);
    setDemoActive(true);
    router.push(DEMO_STEPS[0].route);
  }

  return (
    <button
      onClick={handleStart}
      className={cn(buttonVariants({ size }), "gap-2", className)}
    >
      <Play className="w-4 h-4" />
      Start Guided Demo
    </button>
  );
}
