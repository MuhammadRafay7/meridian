"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/cn";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { CommandPalette } from "./CommandPalette";
import { AdminDialog } from "./ui";
import { signOut } from "./actions";
import { toggleRail, useRailCollapsed } from "./rail-store";

/**
 * Admin shell — rail, header, and the working surface between them.
 *
 * Layout: a fixed rail on the left at one of two widths, a sticky header
 * spanning the remaining column, and the page inside a centred, padded region
 * on the console canvas. The content column is offset by the rail's *resting*
 * width, never its hovered width, so expanding the rail on hover overlays the
 * page instead of reflowing it.
 *
 * Sign-out runs through a server action; this admin never holds the secret key
 * client-side.
 */
export function AdminShell({
  children,
  brandName,
  logoUrl,
  email,
}: {
  children: React.ReactNode;
  brandName: string;
  logoUrl?: string;
  email: string;
}) {
  const pathname = usePathname();
  const collapsed = useRailCollapsed();

  const [hovered, setHovered] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  // Arriving somewhere new closes whatever was covering the page to get there.
  const [navPath, setNavPath] = useState(pathname);
  if (pathname !== navPath) {
    setNavPath(pathname);
    setMobileNav(false);
    setHovered(false);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearch((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <AdminDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => startSignOut(() => signOut())}
        title="Sign out?"
        description="You'll need to sign in again to make further changes."
        confirmLabel="Sign out"
        busy={signingOut}
      />

      <CommandPalette open={search} onClose={() => setSearch(false)} />

      {mobileNav && (
        <div
          aria-hidden
          onClick={() => setMobileNav(false)}
          className="fixed inset-0 z-90 bg-deep/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <AdminSidebar
        brandName={brandName}
        logoUrl={logoUrl}
        collapsed={collapsed}
        hovered={hovered}
        mobileOpen={mobileNav}
        onHoverChange={setHovered}
        onClose={() => setMobileNav(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          collapsed ? "lg:pl-22" : "lg:pl-[17.5rem]",
        )}
      >
        <AdminHeader
          email={email}
          collapsed={collapsed}
          onToggleRail={toggleRail}
          onToggleMobileNav={() => setMobileNav((v) => !v)}
          mobileNavOpen={mobileNav}
          onOpenSearch={() => setSearch(true)}
          onSignOut={() => setLogoutOpen(true)}
        />

        <main className="mx-auto w-full max-w-[100rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
