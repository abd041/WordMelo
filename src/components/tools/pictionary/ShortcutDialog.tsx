"use client";

import { useEffect, useRef } from "react";

interface ShortcutDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  ["Space or N", "Generate a new word in Quick Generator"],
  ["H", "Hide or reveal the current word"],
  ["C", "Copy the current word"],
  ["R", "Hide or reveal during a team game"],
  ["Esc", "Close this help, or leave focus mode"],
];

export function ShortcutDialog({ open, onClose }: ShortcutDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const nodes = [...dialogRef.current.querySelectorAll<HTMLElement>("button, a, [href], input, select, textarea")];
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close keyboard shortcuts"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pictionary-shortcuts-title"
        className="relative w-full max-w-md rounded-[1.15rem] border border-line bg-surface p-5 shadow-lift"
      >
        <h2 id="pictionary-shortcuts-title" className="font-display text-xl font-semibold text-ink">
          Keyboard shortcuts
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Shortcuts stay off while you are typing in a field or using Space on a button.
        </p>
        <dl className="mt-4 space-y-3">
          {SHORTCUTS.map(([keys, meaning]) => (
            <div key={keys} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 text-sm">
              <dt className="font-semibold text-ink">{keys}</dt>
              <dd className="text-ink-muted">{meaning}</dd>
            </div>
          ))}
        </dl>
        <button
          ref={closeRef}
          type="button"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-medium text-accent-foreground"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
