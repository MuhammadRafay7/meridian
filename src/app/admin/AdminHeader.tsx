"use client";

import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Console header.
 *
 * Holds the three things that are true on every screen: how to move the rail
 * out of the way, how to find a page by name, and who you are signed in as.
 * The account menu used to sit at the bottom of the sidebar, which forced the
 * nav to fit a viewport; moving it here is what lets the rail scroll.
 */
export function AdminHeader({
  email,
  collapsed,
  onToggleRail,
  onToggleMobileNav,
  mobileNavOpen,
  onOpenSearch,
  onSignOut,
}: {
  email: string;
  collapsed: boolean;
  onToggleRail: () => void;
  onToggleMobileNav: () => void;
  mobileNavOpen: boolean;
  onOpenSearch: () => void;
  onSignOut: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-3 border-b border-rail-line bg-rail/90 px-4 backdrop-blur-md sm:px-6">
      {/* Rail control: collapse on desktop, drawer on mobile. */}
      <button
        type="button"
        onClick={onToggleMobileNav}
        aria-expanded={mobileNavOpen}
        aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
        className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-surface hover:text-fg lg:hidden"
      >
        {mobileNavOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
      </button>
      <button
        type="button"
        onClick={onToggleRail}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-surface hover:text-fg lg:grid"
      >
        {collapsed ? (
          <PanelLeftOpen size={18} aria-hidden />
        ) : (
          <PanelLeftClose size={18} aria-hidden />
        )}
      </button>

      {/* Search opens the palette; it is a button dressed as a field because
          the real input lives in the dialog. */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="group flex h-10 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-canvas px-3 text-left transition-colors hover:border-line-strong sm:max-w-sm"
      >
        <Search size={16} aria-hidden className="shrink-0 text-fg-subtle" />
        <span className="min-w-0 flex-1 truncate text-sm text-fg-subtle">
          Jump to a page…
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-line bg-surface-raised px-1.5 py-0.5 font-mono text-[0.6875rem] text-fg-subtle sm:block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="View public site"
          className="hidden h-10 w-10 place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-surface hover:text-fg sm:grid lg:hidden"
        >
          <ExternalLink size={17} aria-hidden />
          <span className="sr-only">View public site</span>
        </a>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-transparent pl-1 pr-1.5 transition-colors hover:border-line hover:bg-surface sm:pr-2.5"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-wash text-xs font-semibold text-accent"
            >
              {email.charAt(0).toUpperCase()}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-40 truncate text-xs font-medium text-fg">
                {email}
              </span>
              <span className="block text-[0.6875rem] text-fg-subtle">
                Administrator
              </span>
            </span>
            <ChevronDown
              size={15}
              aria-hidden
              className={cn(
                "hidden shrink-0 text-fg-subtle transition-transform sm:block",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface-raised shadow-console-lg">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-medium text-fg">{email}</p>
                <p className="text-xs text-fg-subtle">Signed in</p>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-fg-muted transition-colors hover:bg-canvas hover:text-fg"
              >
                View public site
                <ExternalLink size={14} aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut();
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm text-critical transition-colors hover:bg-critical/8"
              >
                <LogOut size={14} aria-hidden />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
