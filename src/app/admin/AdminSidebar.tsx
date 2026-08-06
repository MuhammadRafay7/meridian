"use client";

import { ArrowUpRight, MoreHorizontal, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { adminNav } from "./nav";

/**
 * Console rail.
 *
 * Two states on desktop: full (280px) and an icon rail (88px) that expands
 * back to full width on hover *without* moving the page — the rail overlays
 * the content instead of pushing it, so pointing at the nav never reflows the
 * form you were reading. On small screens the same markup is an off-canvas
 * drawer.
 *
 * The groups are always open. They used to be an accordion because the account
 * controls were pinned to the bottom of the rail and a scrolling list pushed
 * them out of reach; those controls now live in the header, so the rail is free
 * to scroll and every destination stays one click away.
 */
export function AdminSidebar({
  brandName,
  logoUrl,
  collapsed,
  hovered,
  mobileOpen,
  onHoverChange,
  onClose,
}: {
  brandName: string;
  logoUrl?: string;
  collapsed: boolean;
  hovered: boolean;
  mobileOpen: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClose: () => void;
}) {
  const pathname = usePathname();

  /** Labels are hidden only on a collapsed, un-hovered desktop rail. */
  const showLabels = !collapsed || hovered || mobileOpen;

  return (
    <aside
      onMouseEnter={() => collapsed && onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-100 flex flex-col border-r border-rail-line bg-rail",
        "transition-[width,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        collapsed && !hovered ? "w-[17.5rem] lg:w-22" : "w-[17.5rem]",
        // Hovering a collapsed rail lifts it over the page rather than pushing.
        collapsed && hovered && "shadow-console-lg",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-rail-line px-5",
          !showLabels && "lg:justify-center lg:px-0",
        )}
      >
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-3"
          title={showLabels ? undefined : brandName}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host
            <img
              src={logoUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-xl border border-line bg-surface-raised object-contain p-1"
            />
          ) : (
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-deep font-display text-sm font-semibold text-brass-soft"
            >
              {brandName.charAt(0).toUpperCase()}
            </span>
          )}
          {showLabels && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-semibold text-fg">
                {brandName}
              </span>
              <span className="block text-xs text-fg-subtle">Console</span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="ml-auto grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface hover:text-fg lg:hidden"
        >
          <X size={17} aria-hidden />
          <span className="sr-only">Close menu</span>
        </button>
      </div>

      {/* Destinations */}
      <nav
        aria-label="Admin sections"
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-5"
      >
        {adminNav.map((group, index) => (
          <div key={group.title} className={cn(index > 0 && "mt-6")}>
            {showLabels ? (
              <h2 className="px-2 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                {group.title}
              </h2>
            ) : (
              <span
                aria-hidden
                className="flex h-6 items-center justify-center text-fg-subtle"
              >
                <MoreHorizontal size={16} />
              </span>
            )}

            <ul className="flex flex-col gap-0.5">
              {group.links.map((link) => {
                const Icon = link.icon as LucideIcon | undefined;
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      title={showLabels ? link.hint : link.label}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors",
                        !showLabels && "lg:justify-center lg:px-0",
                        active
                          ? "bg-accent-wash text-accent"
                          : "text-fg-muted hover:bg-surface hover:text-fg",
                      )}
                    >
                      {Icon ? (
                        <Icon
                          size={18}
                          aria-hidden
                          className={cn(
                            "shrink-0 transition-colors",
                            active
                              ? "text-accent"
                              : "text-fg-subtle group-hover:text-fg-muted",
                          )}
                        />
                      ) : null}
                      {showLabels && <span className="truncate">{link.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer card — the one thing a rail always owes you is the way out.
          The border is load-bearing: the nav scrolls under it, and without a
          hard edge a half-scrolled row reads as broken rather than as more. */}
      {showLabels && (
        <div className="shrink-0 border-t border-rail-line bg-rail px-4 py-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-3.5 py-3 transition-colors hover:border-accent/40 hover:bg-accent-wash"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">
                View public site
              </span>
              <span className="block text-xs text-fg-subtle">
                Opens in a new tab
              </span>
            </span>
            <ArrowUpRight size={16} aria-hidden className="shrink-0 text-accent" />
          </a>
        </div>
      )}
    </aside>
  );
}
