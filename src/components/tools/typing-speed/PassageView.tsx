import { memo } from "react";
import { units } from "@/lib/tools/typing-speed/units";
import { cn } from "@/lib/utils";

export const PassageView = memo(function PassageView({
  passage,
  typed,
  active,
}: {
  passage: string;
  typed: string;
  active: boolean;
}) {
  const passageUnits = units(passage);
  const typedUnits = units(typed);
  const caret = typedUnits.length;

  return (
    <p className="whitespace-pre-wrap break-words font-sans text-xl leading-9 tracking-wide sm:text-[1.35rem] sm:leading-10" aria-hidden="true">
      {passageUnits.map((char, index) => {
        const typedChar = typedUnits[index];
        const isCaret = index === caret;
        const isTyped = index < caret;
        const ok = isTyped && typedChar === char;
        const bad = isTyped && typedChar !== char;
        return (
          <span
            key={`${index}-${char}`}
            data-caret={isCaret && active ? "true" : undefined}
            className={cn(
              "rounded-[3px]",
              !isTyped && "text-ink-muted",
              ok && "text-ink",
              bad && "bg-danger/10 text-danger",
              isCaret && active && "typing-caret bg-accent-soft text-ink",
            )}
          >
            {char}
          </span>
        );
      })}
    </p>
  );
});
