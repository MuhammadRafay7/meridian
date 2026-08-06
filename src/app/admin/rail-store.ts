"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the sidebar is collapsed to its icon rail, remembered between visits.
 *
 * This is browser state, not React state — it outlives the tree and is read
 * from `localStorage` — so it lives in a module store read through
 * `useSyncExternalStore`, the same way `ui.tsx` handles "have we hydrated yet".
 * The server snapshot is always `false`, so the markup React renders on the
 * server matches, and the stored preference is applied on the first client
 * render instead of in an effect.
 */

const KEY = "attire.admin.rail-collapsed";

let collapsed: boolean | null = null;
const listeners = new Set<() => void>();

function snapshot() {
  if (collapsed === null) {
    try {
      collapsed = window.localStorage.getItem(KEY) === "1";
    } catch {
      // Private mode, or storage disabled — the rail just forgets.
      collapsed = false;
    }
  }
  return collapsed;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRailCollapsed() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

export function toggleRail() {
  collapsed = !snapshot();
  try {
    window.localStorage.setItem(KEY, collapsed ? "1" : "0");
  } catch {
    // Not worth surfacing: the preference is a convenience, not data.
  }
  for (const listener of listeners) listener();
}
