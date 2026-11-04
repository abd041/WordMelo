"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadTextFile } from "@/lib/utils";

interface DownloadButtonProps {
  text: string;
  filename?: string;
  disabled?: boolean;
  onFeedback?: (message: string, tone?: "success" | "error") => void;
}

export function DownloadButton({
  text,
  filename = "wordmelo-text.txt",
  disabled,
  onFeedback,
}: DownloadButtonProps) {
  function handleDownload() {
    if (!text) return;
    downloadTextFile(filename, text);
    onFeedback?.("Download started", "success");
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleDownload}
      disabled={disabled || !text}
      aria-label="Download as text file"
    >
      <Download className="h-4 w-4" aria-hidden />
      Download TXT
    </Button>
  );
}
