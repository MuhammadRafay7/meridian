"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { iconMap } from "@/components/icons";
import { uploadMedia } from "./actions";
import { adminControl } from "./ui";
import type { FieldDef } from "./schema";

/**
 * Typed field controls for the collection editor.
 *
 * Each control writes a plain form value; the server action reassembles the
 * row from the type map it is sent. Lists and pairs are edited as one entry
 * per line, which is quicker to work with than a stack of add/remove buttons
 * and survives copy-paste from a document.
 */

function Label({ def }: { def: FieldDef }) {
  return (
    <>
      <span className="text-sm font-medium text-fg">{def.label}</span>
      {def.hint && (
        <span className="mt-0.5 block text-xs leading-relaxed text-fg-subtle">
          {def.hint}
        </span>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- image --- */

export function ImageField({
  def,
  value,
  library,
}: {
  def: FieldDef;
  value: string;
  library: { name: string; url: string }[];
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const body = new FormData();
    body.set("file", file);
    startTransition(async () => {
      const result = await uploadMedia(null, body);
      if (result.ok && result.url) {
        setCurrent(result.url);
        setPicking(false);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div>
      <Label def={def} />
      <input type="hidden" name={`field.${def.name}`} value={current} />

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas">
          {current ? (
            <Image
              src={current}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
              unoptimized={current.startsWith("http")}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-fg-subtle">
              None
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={pending}
              className="h-9 cursor-pointer rounded-lg bg-accent px-3.5 text-xs font-medium text-fg-on-accent shadow-console-xs transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? "Uploading…" : "Upload from device"}
            </button>
            <button
              type="button"
              onClick={() => setPicking((v) => !v)}
              className="h-9 cursor-pointer rounded-lg border border-line bg-surface-raised px-3.5 text-xs font-medium text-fg shadow-console-xs transition-colors hover:border-accent hover:text-accent"
            >
              {picking ? "Close library" : "Choose from library"}
            </button>
            {current && (
              <button
                type="button"
                onClick={() => setCurrent("")}
                className="h-9 cursor-pointer px-2 text-xs text-fg-subtle transition-colors hover:text-critical"
              >
                Remove
              </button>
            )}
          </div>

          {/* Drag-and-drop target doubles as the manual path input. */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <input
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="/photos/example.jpg or https://…"
            className={`${adminControl} font-mono text-xs`}
            aria-label={`${def.label} path`}
          />
          {error && <p className="text-xs text-critical">{error}</p>}
        </div>
      </div>

      {picking && (
        <div className="no-scrollbar mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-line bg-canvas p-2 sm:grid-cols-5">
          {library.length === 0 && (
            <p className="col-span-full p-3 text-xs text-fg-subtle">
              Nothing uploaded yet. Use “Upload from device”.
            </p>
          )}
          {library.map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => {
                setCurrent(item.url);
                setPicking(false);
              }}
              title={item.name}
              className="relative aspect-4/3 cursor-pointer overflow-hidden rounded-lg border border-line transition-colors hover:border-accent"
            >
              <Image
                src={item.url}
                alt={item.name}
                fill
                sizes="120px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- icon --- */

export function IconField({ def, value }: { def: FieldDef; value: string }) {
  const [current, setCurrent] = useState(value ?? "");
  const names = Object.keys(iconMap) as (keyof typeof iconMap)[];

  return (
    <div>
      <Label def={def} />
      <input type="hidden" name={`field.${def.name}`} value={current} />
      <div className="mt-2 grid grid-cols-8 gap-1.5 rounded-xl border border-line bg-canvas p-2 sm:grid-cols-12">
        {names.map((name) => {
          const Icon = iconMap[name];
          const active = current === name;
          return (
            <button
              key={name}
              type="button"
              title={name.replace("Icon", "")}
              onClick={() => setCurrent(name)}
              aria-pressed={active}
              className={`flex aspect-square cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                active
                  ? "border-accent bg-accent-wash text-accent"
                  : "border-transparent text-fg-muted hover:border-line hover:bg-surface-raised hover:text-fg"
              }`}
            >
              <Icon width={18} height={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- list --- */

export function ListField({ def, value }: { def: FieldDef; value: string[] }) {
  return (
    <label className="block">
      <Label def={def} />
      <textarea
        name={`field.${def.name}`}
        rows={Math.min(Math.max(value.length + 2, 4), 12)}
        defaultValue={value.join("\n")}
        placeholder="One per line"
        className={`${adminControl} mt-2 leading-relaxed`}
      />
    </label>
  );
}

/* ---------------------------------------------------------------- pairs --- */

export function PairsField({
  def,
  value,
}: {
  def: FieldDef;
  value: Record<string, unknown>[];
}) {
  const [a, b] = def.pairKeys ?? ["key", "value"];
  const lines = value
    .map((row) => `${String(row[a] ?? "")} | ${String(row[b] ?? "")}`)
    .join("\n");

  return (
    <label className="block">
      <Label def={def} />
      <span className="mt-0.5 block text-xs text-fg-subtle">
        One per line, as <code className="font-mono">{a} | {b}</code>
      </span>
      <textarea
        name={`field.${def.name}`}
        rows={Math.min(Math.max(value.length + 2, 3), 10)}
        defaultValue={lines}
        className={`${adminControl} mt-2 font-mono text-[0.8125rem] leading-relaxed`}
      />
    </label>
  );
}

/* --------------------------------------------------------------- simple --- */

export function SimpleField({
  def,
  value,
}: {
  def: FieldDef;
  value: string | number;
}) {
  const name = `field.${def.name}`;

  if (def.type === "select") {
    return (
      <label className="block">
        <Label def={def} />
        <select name={name} defaultValue={String(value ?? "")} className={`${adminControl} mt-2 appearance-none`}>
          {(def.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option === "" ? "— none —" : option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (def.type === "textarea") {
    return (
      <label className="block">
        <Label def={def} />
        <textarea
          name={name}
          rows={def.rows ?? 4}
          defaultValue={String(value ?? "")}
          className={`${adminControl} mt-2 leading-relaxed`}
        />
      </label>
    );
  }

  return (
    <label className="block">
      <Label def={def} />
      <input
        name={name}
        type={def.type === "number" ? "number" : "text"}
        step={def.type === "number" ? "any" : undefined}
        defaultValue={String(value ?? "")}
        className={`${adminControl} mt-2`}
      />
    </label>
  );
}
