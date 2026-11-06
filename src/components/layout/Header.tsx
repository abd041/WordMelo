"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SiteSearch } from "@/components/layout/SiteSearch";
import { Button } from "@/components/ui/Button";
import {
  getPublishedTools,
  shouldShowToolDirectorySearch,
} from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const published = getPublishedTools();
  const showSearch = shouldShowToolDirectorySearch();
  const primaryTool = published[0];

  const navLinks = [
    { href: "/#tools", label: "Tools" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4 overflow-visible lg:h-[4.25rem]">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-control px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {showSearch ? (
          <div className="hidden w-full max-w-xs lg:block">
            <SiteSearch id="desktop-site-search" panel="overlay" />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          {primaryTool ? (
            <Button
              href={primaryTool.href}
              size="sm"
              className="hidden sm:inline-flex"
            >
              Word Counter
            </Button>
          ) : null}

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-line bg-surface text-ink md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id={panelId}
        className={cn(
          "border-t border-line bg-paper md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="container-page space-y-4 py-4">
          {showSearch ? (
            <SiteSearch
              id="mobile-site-search"
              onNavigate={() => setOpen(false)}
            />
          ) : null}
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-control px-3 py-3 text-base font-medium text-ink hover:bg-surface-sunken"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {primaryTool ? (
                <li>
                  <Link
                    href={primaryTool.href}
                    className="block rounded-control bg-accent px-3 py-3 text-base font-semibold text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Use Free Word Counter
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
