"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ResetButtonProps {
  onReset: () => void;
  disabled?: boolean;
  label?: string;
}

export function ResetButton({
  onReset,
  disabled,
  label = "Clear",
}: ResetButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onReset}
      disabled={disabled}
      aria-label="Clear text"
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
