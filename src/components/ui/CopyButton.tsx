"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copyTextToClipboard } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  disabled?: boolean;
  onFeedback?: (message: string, tone?: "success" | "error") => void;
}

export function CopyButton({
  text,
  label = "Copy",
  disabled,
  onFeedback,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(true);
      onFeedback?.("Copied to clipboard", "success");
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      onFeedback?.("Could not copy text", "error");
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={copied ? "Copied" : "Copy text"}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {copied ? "Copied" : label}
    </Button>
  );
}
