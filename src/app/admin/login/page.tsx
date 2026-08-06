"use client";

import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { signIn } from "../actions";
import { AdminButton, adminControl } from "../ui";

/**
 * Sign-in.
 *
 * Split layout: the form on the left, the brand on the right, so the page
 * reads as part of the product rather than a bare box floating in the middle
 * of a dark screen. The form itself is built from the console's own controls —
 * this is the first screen of the tool, and it should already look like it.
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center bg-canvas px-6 py-16 sm:px-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 text-fg lg:hidden">
            <LogoMark size={26} />
            <span className="font-display text-sm font-semibold tracking-[0.14em]">
              ATTIRE SERVICES
            </span>
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-surface-raised p-7 shadow-console-sm sm:p-8 lg:mt-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              Administration
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">
              Sign in
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Manage the content, theme and structure of the public site.
            </p>

            <form action={formAction} className="mt-7 space-y-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-fg">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  required
                  placeholder="you@company.com"
                  className={adminControl}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-fg">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`${adminControl} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-fg-subtle transition-colors hover:text-accent"
                  >
                    {showPassword ? (
                      <EyeOff size={16} aria-hidden />
                    ) : (
                      <Eye size={16} aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--accent)]"
                />
                <span>
                  <span className="block text-sm text-fg">Keep me signed in</span>
                  <span className="block text-xs leading-relaxed text-fg-subtle">
                    Leave this off on a shared computer — you will be signed out
                    when the browser closes.
                  </span>
                </span>
              </label>

              {state && !state.ok && (
                <p
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-critical/30 bg-critical/5 px-3.5 py-3 text-sm text-critical"
                >
                  <AlertTriangle size={16} aria-hidden className="mt-0.5 shrink-0" />
                  {state.message}
                </p>
              )}

              <AdminButton type="submit" busy={pending} className="w-full">
                {pending ? "Signing in…" : "Sign in"}
              </AdminButton>
            </form>
          </div>

          <p className="mt-6 px-1 text-xs leading-relaxed text-fg-subtle">
            Access is restricted to authorised accounts. Contact your
            administrator if you need one.
          </p>
        </div>
      </div>

      {/* Brand panel */}
      <div className="deep-field relative hidden items-center overflow-hidden px-12 text-on-deep lg:flex">
        <div className="grid-lines grid-lines--deep pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative max-w-sm">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-display text-sm font-semibold tracking-[0.14em]">
              ATTIRE SERVICES
            </span>
          </div>
          <p className="display display-md mt-10 text-on-deep">
            Everything on the site is edited here.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-on-deep-muted">
            Copy, figures, colours, page structure and policies — all stored in
            the database, none of it written into the code.
          </p>
          <ul className="mt-10 space-y-2.5 border-t border-white/12 pt-6">
            {[
              "Brand, contact details and search descriptions",
              "Theme colours applied across the whole site",
              "Sections added, hidden, reordered or removed",
              "Legal pages published straight to the footer",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 text-sm text-on-deep-muted"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass-soft" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
