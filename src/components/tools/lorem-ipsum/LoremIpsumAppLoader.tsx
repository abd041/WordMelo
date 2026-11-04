"use client";

import dynamic from "next/dynamic";

const LoremIpsumApp = dynamic(
  () =>
    import("@/components/tools/lorem-ipsum/LoremIpsumApp").then(
      (m) => m.LoremIpsumApp,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[22rem] rounded-[1.35rem] border border-line bg-surface p-5 shadow-soft"
        aria-busy="true"
        aria-label="Loading generator"
      >
        <p className="text-sm text-ink-muted">Loading placeholder studio…</p>
      </div>
    ),
  },
);

export function LoremIpsumAppLoader() {
  return <LoremIpsumApp />;
}
