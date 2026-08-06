"use client";

import { Palette } from "lucide-react";
import { useActionState, useState } from "react";
import { saveTheme, type ActionResult } from "../actions";
import {
  AdminActionBar,
  AdminButton,
  AdminCard,
  AdminStatus,
  adminControl,
} from "../ui";

/** A single token: swatch, name, and the raw value. */
function TokenRow({ name, value }: { name: string; value: string }) {
  const [current, setCurrent] = useState(value ?? "");
  const isColor = /^#[0-9a-fA-F]{3,8}$/.test(current);

  return (
    <div className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
      {isColor ? (
        <input
          type="color"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          aria-label={`${name} colour picker`}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-1"
        />
      ) : (
        <span
          aria-hidden
          className="h-9 w-9 shrink-0 rounded-lg border border-dashed border-line-strong"
        />
      )}
      <label
        htmlFor={`t-${name}`}
        className="w-44 shrink-0 font-mono text-xs text-fg-muted"
      >
        --{name}
      </label>
      <input
        id={`t-${name}`}
        name={name}
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className={`${adminControl} py-2 font-mono text-xs`}
      />
    </div>
  );
}

export function ThemeForm({
  groups,
  tokens,
}: {
  groups: { title: string; hint: string; tokens: string[] }[];
  tokens: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveTheme,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {groups.map((group, i) => (
        <AdminCard
          key={group.title}
          title={group.title}
          description={group.hint}
          icon={i === 0 ? <Palette size={17} /> : undefined}
        >
          {group.tokens.map((name) => (
            <TokenRow key={name} name={name} value={tokens[name] ?? ""} />
          ))}
        </AdminCard>
      ))}

      <AdminActionBar>
        <AdminButton type="submit" busy={pending}>
          Save theme
        </AdminButton>
        <AdminStatus
          state={state ? (state.ok ? "saved" : "error") : "idle"}
          message={state?.message}
        />
      </AdminActionBar>
    </form>
  );
}
