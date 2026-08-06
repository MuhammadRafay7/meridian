"use client";

import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";
import { adminNav } from "./nav";

/**
 * Admin UI kit.
 *
 * The console is built from four shapes and nothing else: a page header, a
 * card, a control, and a button. Cards are white on a cool grey canvas with a
 * hairline border and almost no shadow — depth is reserved for things that
 * genuinely float (dialogs, menus, the hovered rail), so when something lifts
 * off the page it means something.
 *
 * The primitives use the same semantic tokens as the public site (mapped in
 * globals.css), so the admin inherits the design system rather than
 * approximating it — re-theming the site re-themes the CMS.
 *
 * Copy here is plain English: this is a tool, and a tool should say
 * "Save changes".
 */

/* -------------------------------------------------------------------------- */
/* Page scaffolding                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Trail back to the console root, derived from the route rather than passed in
 * by every page — nav is the only place that knows which group a route is in,
 * and it already knows.
 */
function Breadcrumb({ title }: { title: string }) {
  const pathname = usePathname();
  const group = adminNav.find((g) => g.links.some((l) => l.href === pathname));

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
        <li>
          <Link href="/admin" className="transition-colors hover:text-accent">
            Console
          </Link>
        </li>
        {group ? (
          <li className="flex items-center gap-1.5">
            <ChevronRight size={13} aria-hidden />
            {group.title}
          </li>
        ) : null}
        <li className="flex items-center gap-1.5 text-fg-muted">
          <ChevronRight size={13} aria-hidden />
          <span aria-current="page">{title}</span>
        </li>
      </ol>
    </nav>
  );
}

export function AdminPage({
  title,
  description,
  actions,
  aside,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Contextual column — a preview, or notes about where the content appears. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Breadcrumb title={title} />
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-fg sm:text-[1.75rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2 lg:pt-6">{actions}</div>
        ) : null}
      </header>

      {aside ? (
        <div className="grid items-start gap-6 pb-20 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="flex min-w-0 flex-col gap-6">{children}</div>
          <div className="flex flex-col gap-6 lg:sticky lg:top-22">{aside}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-20">{children}</div>
      )}
    </div>
  );
}

/**
 * Floating action bar pinned to the bottom of the content column.
 *
 * Long forms scroll past their own save button; this keeps it reachable and
 * puts the result of the last save next to it rather than somewhere above. It
 * floats as a card rather than bleeding to the window edges, so it reads as
 * belonging to the form it follows.
 */
export function AdminActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface-raised/95 px-4 py-3 shadow-console-lg backdrop-blur-md sm:px-5">
      {children}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  icon,
  footer,
  /** Drops body padding so lists and tables can sit edge to edge. */
  flush = false,
  children,
  className,
}: {
  title?: string;
  description?: string;
  /**
   * A rendered element, not a component. Server pages render most of these
   * cards, and React cannot serialise a function across that boundary.
   */
  icon?: ReactNode;
  footer?: ReactNode;
  flush?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-console-xs",
        className,
      )}
    >
      {title ? (
        <header className="flex items-start gap-3.5 border-b border-line px-5 py-4 sm:px-6">
          {icon ? (
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-wash text-accent"
            >
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-fg">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
        </header>
      ) : null}

      <div className={cn(!flush && "px-5 py-5 sm:px-6")}>{children}</div>

      {footer ? (
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-canvas/70 px-5 py-3.5 sm:px-6">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

/** Responsive form grid. Children spanning both columns use `sm:col-span-2`. */
export function AdminGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

/**
 * Figure tile — a count, and what it counts.
 *
 * `tone` is state, not decoration: `alert` is for a number that means something
 * needs attention (content hidden from the public site), so it is the only one
 * that colours the figure.
 */
export function AdminMetric({
  label,
  value,
  icon,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  hint?: string;
  tone?: "neutral" | "alert";
}) {
  const alert = tone === "alert" && value !== 0;

  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-console-xs">
      {icon ? (
        <span
          aria-hidden
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl",
            alert ? "bg-brass-wash text-brass" : "bg-canvas text-fg",
          )}
        >
          {icon}
        </span>
      ) : null}
      <p
        className={cn(
          "mt-4 font-display text-figure font-semibold tabular-nums",
          alert ? "text-brass" : "text-fg",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-fg-muted">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  );
}

/** Segmented control for switching panels within one page. */
export function AdminTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; icon?: ReactNode; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      role="tablist"
      className="flex w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface-raised p-1 shadow-console-xs"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent-wash text-accent"
                : "text-fg-muted hover:bg-canvas hover:text-fg",
            )}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[0.6875rem] tabular-nums",
                  active ? "bg-accent/12 text-accent" : "bg-canvas text-fg-subtle",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form controls                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The console control surface, exported so the hand-rolled inputs elsewhere in
 * the admin (typed fields, filters, token editors) look like the ones this kit
 * builds instead of drifting from them.
 */
export const adminControl =
  "w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-fg " +
  "shadow-console-xs transition-colors placeholder:text-fg-subtle " +
  "focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/10 " +
  "disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-60";

interface FieldChrome {
  label: string;
  hint?: string;
  error?: string;
  /** Spans both columns of AdminGrid. */
  wide?: boolean;
}

/**
 * Wraps a control with a real `<label>` and wires up hint/error descriptions.
 * Every admin field goes through this, so none can ship unlabelled.
 *
 * The hint sits *below* the control rather than above it. Two fields side by
 * side in `AdminGrid` where only one has a hint would otherwise put their
 * inputs at different heights, and a form whose controls don't line up reads
 * as broken before it reads as helpful.
 */
function FieldShell({
  label,
  hint,
  error,
  wide,
  id,
  children,
}: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-fg-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminInput({
  label,
  hint,
  error,
  wide,
  ...rest
}: FieldChrome & Omit<ComponentProps<"input">, "className" | "id">) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} wide={wide} id={id}>
      <input
        id={id}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        aria-invalid={error ? true : undefined}
        className={cn(adminControl, error && "border-critical")}
        {...rest}
      />
    </FieldShell>
  );
}

export function AdminTextarea({
  label,
  hint,
  error,
  wide = true,
  rows = 5,
  ...rest
}: FieldChrome & Omit<ComponentProps<"textarea">, "className" | "id">) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} wide={wide} id={id}>
      <textarea
        id={id}
        rows={rows}
        aria-describedby={cn(hint && `${id}-hint`) || undefined}
        className={cn(adminControl, "resize-y leading-relaxed", error && "border-critical")}
        {...rest}
      />
    </FieldShell>
  );
}

export function AdminSelect({
  label,
  hint,
  error,
  wide,
  options,
  ...rest
}: FieldChrome & { options: string[] } & Omit<
    ComponentProps<"select">,
    "className" | "id" | "children"
  >) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} wide={wide} id={id}>
      <select id={id} className={cn(adminControl, "appearance-none")} {...rest}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** Checkbox with the label as its accessible name and a supporting description. */
export function AdminCheckbox({
  label,
  description,
  ...rest
}: { label: string; description?: string } & Omit<
  ComponentProps<"input">,
  "type" | "className"
>) {
  const id = useId();
  return (
    <div className="flex gap-3">
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--accent)]"
        {...rest}
      />
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-fg">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons and badges                                                         */
/* -------------------------------------------------------------------------- */

type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<AdminButtonVariant, string> = {
  primary:
    "bg-accent text-fg-on-accent shadow-console-xs hover:bg-accent-hover focus-visible:ring-3 focus-visible:ring-accent/25",
  secondary:
    "border border-line bg-surface-raised text-fg shadow-console-xs hover:border-line-strong hover:bg-canvas",
  ghost: "text-fg-muted hover:bg-surface hover:text-fg",
  danger:
    "border border-critical/35 bg-surface-raised text-critical shadow-console-xs hover:bg-critical/8",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  busy = false,
  children,
  className,
  disabled,
  ...rest
}: {
  variant?: AdminButtonVariant;
  size?: "sm" | "md";
  /** Shows a spinner and blocks interaction — for in-flight requests. */
  busy?: boolean;
  children: ReactNode;
  // `className` is kept (not omitted) so callers can extend the variant, e.g. a
  // ghost button that turns critical-red on hover.
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      disabled={disabled || busy}
      // Communicates the pending state to assistive tech, not just visually.
      aria-busy={busy || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-55",
        size === "sm" ? "h-9 px-3.5 text-sm" : "h-11 px-4.5 text-sm",
        buttonVariants[variant],
        className,
      )}
      {...rest}
    >
      {busy ? <Loader2 size={15} aria-hidden className="animate-spin" /> : null}
      {children}
    </button>
  );
}

type BadgeTone = "neutral" | "accent" | "positive" | "warning" | "critical";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-canvas text-fg-muted",
  accent: "bg-accent-wash text-accent",
  positive: "bg-positive/10 text-positive",
  warning: "bg-brass-wash text-brass",
  critical: "bg-critical/10 text-critical",
};

/** Compact state marker — visible, hidden, shared, and so on. */
export function AdminBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Inline save/error feedback.
 *
 * Replaces the pattern of a full-screen celebratory modal on every successful
 * save ("Identity Set", "Synchronized", requiring an "Acknowledge" click). A save
 * confirmation should not interrupt the person saving; it should just be visible.
 * Errors previously used `alert()`, which is worse still.
 */
export function AdminStatus({
  state,
  message,
}: {
  state: "idle" | "saved" | "error";
  message?: string;
}) {
  if (state === "idle") return null;

  const saved = state === "saved";

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 text-sm",
        saved ? "text-positive" : "text-critical",
      )}
    >
      {saved ? (
        <CheckCircle2 size={15} aria-hidden />
      ) : (
        <AlertTriangle size={15} aria-hidden />
      )}
      {message ?? (saved ? "Changes saved." : "Something went wrong.")}
    </p>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-canvas/50 px-6 py-14 text-center">
      <p className="text-sm font-medium text-fg">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3"
    >
      <Loader2 size={22} aria-hidden className="animate-spin text-accent" />
      <p className="text-sm text-fg-muted">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                     */
/* -------------------------------------------------------------------------- */

/** No-op subscribe: whether we've hydrated never changes after the first commit. */
const noopSubscribe = () => () => {};

/**
 * Portals into `document.body` once hydrated.
 *
 * "Have we hydrated yet?" is genuinely external state — it belongs to the
 * renderer, not to React state — so `useSyncExternalStore` with distinct client
 * and server snapshots expresses it directly. The alternative (`useState(false)`
 * plus an effect that immediately sets it true) causes a second render pass on
 * every mount and is what the set-state-in-effect rule warns about.
 */
export function Portal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return mounted ? createPortal(children, document.body) : null;
}

/**
 * Confirmation dialog — the single implementation, replacing four near-identical
 * copies across the admin plus two bare `confirm()` calls.
 *
 * Properly modal: `role="dialog"` with `aria-modal`, an accessible name, focus
 * moved in and restored on close, focus trapped while open, and Escape to
 * dismiss. The destructive action is never the initially focused control.
 */
export function AdminDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    // Focus Cancel, not Confirm — a stray Enter must not delete anything.
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

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
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
        <div
          // Decorative backdrop; the dialog below owns the semantics.
          aria-hidden
          onClick={onClose}
          className="absolute inset-0 bg-deep/60 backdrop-blur-sm"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-dialog-title"
          aria-describedby={description ? "admin-dialog-description" : undefined}
          className="relative w-full max-w-md rounded-2xl border border-line bg-surface-raised p-6 shadow-console-xl"
        >
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                destructive
                  ? "bg-critical/10 text-critical"
                  : "bg-accent-wash text-accent",
              )}
            >
              <AlertTriangle size={18} />
            </span>
            <div className="min-w-0 pt-1">
              <h2
                id="admin-dialog-title"
                className="text-base font-semibold text-fg"
              >
                {title}
              </h2>
              {description ? (
                <p
                  id="admin-dialog-description"
                  className="mt-2 text-sm leading-relaxed text-fg-muted"
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <AdminButton ref={cancelRef} variant="secondary" onClick={onClose}>
              Cancel
            </AdminButton>
            <AdminButton
              variant={destructive ? "danger" : "primary"}
              onClick={onConfirm}
              busy={busy}
            >
              {confirmLabel}
            </AdminButton>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-canvas hover:text-fg"
          >
            <X size={16} aria-hidden />
            <span className="sr-only">Close dialog</span>
          </button>
        </div>
      </div>
    </Portal>
  );
}
