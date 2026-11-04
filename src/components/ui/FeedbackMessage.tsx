"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface FeedbackMessageProps {
  message: string | null;
  tone?: "neutral" | "success" | "error";
  onDismiss?: () => void;
  className?: string;
}

export function FeedbackMessage({
  message,
  tone = "neutral",
  onDismiss,
  className,
}: FeedbackMessageProps) {
  useEffect(() => {
    if (!message || !onDismiss) return;
    const timer = window.setTimeout(onDismiss, 2500);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-control px-3 py-2 text-sm",
        tone === "success" && "bg-accent-soft text-accent",
        tone === "error" && "bg-danger/10 text-danger",
        tone === "neutral" && "bg-surface-sunken text-ink-muted",
        className,
      )}
    >
      {message}
    </p>
  );
}
