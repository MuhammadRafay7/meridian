"use client";

import { CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { adminNav } from "./nav";
import { Portal } from "./ui";

/**
 * Jump-to-page palette (⌘K / Ctrl+K).
 *
 * Twenty-odd destinations across five groups is more than a person keeps in
 * their head, and the rail's answer — read every group until you spot it — is
 * slow once you know what you want. Typing "footer" or "lanes" should get you
 * there. Hints are searched as well as labels, so "certification" finds
 * Certifications even though the route is `/content/credentials`.
 */

const destinations = adminNav.flatMap((group) =>
  group.links.map((link) => ({ ...link, group: group.title })),
);

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter((d) =>
      `${d.label} ${d.hint ?? ""} ${d.group}`.toLowerCase().includes(q),
    );
  }, [query]);

  // A new query means a new list; the highlight belongs on its first row.
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setCursor(0);
  }

  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  function go(href: string) {
    onClose();
    setQuery("");
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) return;
      const next =
        event.key === "ArrowDown"
          ? (cursor + 1) % results.length
          : (cursor - 1 + results.length) % results.length;
      setCursor(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[cursor];
      if (target) go(target.href);
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-300 flex items-start justify-center p-4 pt-[12vh]">
        <div
          aria-hidden
          onClick={onClose}
          className="absolute inset-0 bg-deep/50 backdrop-blur-sm"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Jump to a page"
          onKeyDown={onKeyDown}
          className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-console-xl"
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search size={17} aria-hidden className="shrink-0 text-fg-subtle" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to a page…"
              aria-label="Jump to a page"
              className="h-14 min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
            />
            <kbd className="hidden shrink-0 rounded-md border border-line bg-canvas px-1.5 py-0.5 font-mono text-[0.6875rem] text-fg-subtle sm:block">
              Esc
            </kbd>
          </div>

          {results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-fg-muted">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul ref={listRef} className="no-scrollbar max-h-[52vh] overflow-y-auto p-2">
              {results.map((item, i) => {
                const Icon = item.icon;
                const active = i === cursor;
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => go(item.href)}
                      onMouseMove={() => setCursor(i)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        active ? "bg-accent-wash" : "hover:bg-canvas",
                      )}
                    >
                      {Icon ? (
                        <Icon
                          size={17}
                          aria-hidden
                          className={cn(
                            "shrink-0",
                            active ? "text-accent" : "text-fg-subtle",
                          )}
                        />
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-fg">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs text-fg-subtle">
                          {item.group}
                          {item.hint ? ` · ${item.hint}` : ""}
                        </span>
                      </span>
                      {active && (
                        <CornerDownLeft
                          size={14}
                          aria-hidden
                          className="shrink-0 text-accent"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Portal>
  );
}
