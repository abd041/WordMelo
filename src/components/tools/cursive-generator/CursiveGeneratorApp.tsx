"use client";

import { useState } from "react";
import { PenLine, Type } from "lucide-react";
import { CursiveHandwritingStudio } from "@/components/tools/cursive-generator/CursiveHandwritingStudio";
import { CursiveUnicodePanel } from "@/components/tools/cursive-generator/CursiveUnicodePanel";
import { CURSIVE_SAMPLE_TEXT } from "@/lib/tools/cursive-generator";
import { cn } from "@/lib/utils";

type MainTab = "unicode" | "handwriting";
type FocusMode = "phrase" | "name";

export function CursiveGeneratorApp() {
  const [tab, setTab] = useState<MainTab>("unicode");
  const [focus, setFocus] = useState<FocusMode>("phrase");
  const [text, setText] = useState(CURSIVE_SAMPLE_TEXT);

  function openHandwriting(nextText: string) {
    setText(nextText);
    setTab("handwriting");
  }

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Cursive generator modes"
        className="grid gap-2 sm:grid-cols-2"
      >
        {(
          [
            {
              id: "unicode" as const,
              label: "Copy & Paste Cursive",
              blurb: "Unicode script you can paste into bios and captions",
              Icon: Type,
            },
            {
              id: "handwriting" as const,
              label: "Handwriting Studio",
              blurb: "Real OFL fonts with PNG download",
              Icon: PenLine,
            },
          ] as const
        ).map(({ id, label, blurb, Icon }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`cursive-tab-${id}`}
              aria-selected={selected}
              aria-controls={`cursive-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  setTab(tab === "unicode" ? "handwriting" : "unicode");
                }
              }}
              className={cn(
                "flex items-start gap-3 rounded-[1.05rem] border px-4 py-3.5 text-left transition-colors",
                selected
                  ? "border-accent bg-accent text-accent-foreground shadow-soft"
                  : "border-line bg-surface text-ink hover:border-line-strong hover:bg-mint/40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control",
                  selected ? "bg-white/15" : "bg-accent-soft text-accent",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold sm:text-base">
                  {label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs leading-snug sm:text-sm",
                    selected ? "text-accent-foreground/85" : "text-ink-muted",
                  )}
                >
                  {blurb}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="cursive-panel-unicode"
        aria-labelledby="cursive-tab-unicode"
        hidden={tab !== "unicode"}
      >
        {tab === "unicode" ? (
          <CursiveUnicodePanel
            text={text}
            onTextChange={setText}
            nameMode={focus === "name"}
            onNameModeChange={(enabled) =>
              setFocus(enabled ? "name" : "phrase")
            }
            onOpenHandwriting={openHandwriting}
          />
        ) : null}
      </div>

      <div
        role="tabpanel"
        id="cursive-panel-handwriting"
        aria-labelledby="cursive-tab-handwriting"
        hidden={tab !== "handwriting"}
      >
        {tab === "handwriting" ? (
          <CursiveHandwritingStudio text={text} onTextChange={setText} />
        ) : null}
      </div>
    </div>
  );
}
