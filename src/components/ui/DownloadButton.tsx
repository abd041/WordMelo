"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadTextFile } from "@/lib/utils";

interface DownloadButtonProps {
  text: string;
  filename?: string;
  label?: string;
  mimeType?: string;
  disabled?: boolean;
  onFeedback?: (message: string, tone?: "success" | "error") => void;
}

export function DownloadButton({
  text,
  filename = "wordmelo-text.txt",
  label = "Download TXT",
  mimeType = "text/plain;charset=utf-8",
  disabled,
  onFeedback,
}: DownloadButtonProps) {
  function handleDownload() {
    if (!text) return;
    downloadTextFile(filename, text, mimeType);
    onFeedback?.("Download started", "success");
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleDownload}
      disabled={disabled || !text}
      aria-label={label}
    >
      <Download className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
