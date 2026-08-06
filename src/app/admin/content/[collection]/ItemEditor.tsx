"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useActionState, useState } from "react";
import {
  deleteContentItem,
  moveContentItem,
  saveContentItem,
  type ActionResult,
} from "../../actions";
import { ImageField, IconField, ListField, PairsField, SimpleField } from "../../fields";
import type { CollectionSchema, FieldDef } from "../../schema";
import { AdminBadge, AdminButton } from "../../ui";

type Row = Record<string, unknown>;
type Media = { name: string; url: string };

/** Renders one field according to its declared type. */
function Field({
  def,
  data,
  library,
}: {
  def: FieldDef;
  data: Row;
  library: Media[];
}) {
  const value = data[def.name];

  switch (def.type) {
    case "image":
      return <ImageField def={def} value={String(value ?? "")} library={library} />;
    case "icon":
      return <IconField def={def} value={String(value ?? "")} />;
    case "list":
      return (
        <ListField def={def} value={Array.isArray(value) ? value.map(String) : []} />
      );
    case "pairs":
      return (
        <PairsField
          def={def}
          value={Array.isArray(value) ? (value as Row[]) : []}
        />
      );
    default:
      return <SimpleField def={def} value={(value as string | number) ?? ""} />;
  }
}

/** Fields the form posts, and everything else preserved verbatim. */
function partition(data: Row, schema: CollectionSchema) {
  const modelled = new Set(schema.fields.map((f) => f.name));
  const rest: Row = {};
  for (const [key, value] of Object.entries(data)) {
    if (!modelled.has(key)) rest[key] = value;
  }

  const types = Object.fromEntries(schema.fields.map((f) => [f.name, f.type]));
  return { rest, types };
}

function FormBody({
  schema,
  data,
  library,
}: {
  schema: CollectionSchema;
  data: Row;
  library: Media[];
}) {
  const { rest, types } = partition(data, schema);

  return (
    <>
      <input type="hidden" name="__types" value={JSON.stringify(types)} />
      <input type="hidden" name="__rest" value={JSON.stringify(rest)} />
      {schema.fields
        .filter((f) => f.type === "pairs")
        .map((f) => (
          <input
            key={f.name}
            type="hidden"
            name={`pairkeys.${f.name}`}
            value={(f.pairKeys ?? ["key", "value"]).join("|")}
          />
        ))}

      <div className="space-y-5">
        {schema.fields.map((def) => (
          <Field key={def.name} def={def} data={data} library={library} />
        ))}
      </div>

      {Object.keys(rest).length > 0 && (
        <p className="mt-5 rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-xs text-fg-subtle">
          Also stored on this item and kept unchanged:{" "}
          <span className="font-mono">{Object.keys(rest).join(", ")}</span>
        </p>
      )}
    </>
  );
}

export function ItemEditor({
  id,
  collection,
  schema,
  data,
  published,
  thumb,
  index,
  isFirst,
  isLast,
  library,
}: {
  id: string;
  collection: string;
  schema: CollectionSchema;
  data: Row;
  published: boolean;
  /** Resolved server-side, so bundled paths preview as their stored image. */
  thumb: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  library: Media[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    saveContentItem,
    null,
  );

  const title = String(data[schema.titleField] ?? "") || "Untitled";
  const subtitle = schema.subtitleField
    ? String(data[schema.subtitleField] ?? "")
    : "";
  const reference = typeof data.code === "string" ? data.code : "";

  return (
    <li className={open ? "bg-canvas" : "transition-colors hover:bg-canvas/60"}>
      <div className="flex items-center gap-4 px-5 py-3 sm:px-6">
        <span className="w-6 shrink-0 font-mono text-xs text-fg-subtle">
          {String(index + 1).padStart(2, "0")}
        </span>

        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host
          <img
            src={thumb}
            alt=""
            className="h-11 w-16 shrink-0 rounded-lg border border-line object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-11 w-16 shrink-0 place-items-center rounded-lg border border-dashed border-line-strong text-[0.625rem] text-fg-subtle"
          >
            {reference || "—"}
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-fg">{title}</span>
            {reference && thumb && (
              <span className="shrink-0 rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[0.625rem] text-fg-subtle">
                {reference}
              </span>
            )}
          </span>
          {subtitle && (
            <span className="mt-0.5 line-clamp-1 block text-xs text-fg-muted">
              {subtitle}
            </span>
          )}
        </button>

        <AdminBadge
          tone={published ? "positive" : "warning"}
          className="hidden shrink-0 sm:inline-flex"
        >
          {published ? "Visible" : "Hidden"}
        </AdminBadge>

        <div className="flex shrink-0 items-center gap-1">
          {(["up", "down"] as const).map((direction) => (
            <form key={direction} action={moveContentItem}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="collection" value={collection} />
              <input type="hidden" name="direction" value={direction} />
              <button
                type="submit"
                title={direction === "up" ? "Move up" : "Move down"}
                disabled={direction === "up" ? isFirst : isLast}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-sunken hover:text-fg disabled:cursor-not-allowed disabled:opacity-25"
              >
                {direction === "up" ? (
                  <ChevronUp size={14} aria-hidden />
                ) : (
                  <ChevronDown size={14} aria-hidden />
                )}
              </button>
            </form>
          ))}
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            className="ml-1"
          >
            {open ? "Close" : "Edit"}
          </AdminButton>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-surface-raised px-5 py-6 sm:px-6">
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="collection" value={collection} />
            <FormBody schema={schema} data={data} library={library} />

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={published}
                  className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                />
                Visible on site
              </label>
              <AdminButton type="submit">Save changes</AdminButton>
              {state && (
                <span
                  role="status"
                  className={`text-sm ${state.ok ? "text-positive" : "text-danger"}`}
                >
                  {state.message}
                </span>
              )}
            </div>
          </form>

          <form action={deleteContentItem} className="mt-5 border-t border-line pt-4">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="collection" value={collection} />
            <button
              type="submit"
              className="cursor-pointer text-xs text-fg-subtle transition-colors hover:text-critical"
            >
              Delete this item permanently
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

export function NewItem({
  collection,
  schema,
  position,
  library,
  onCancel,
}: {
  collection: string;
  schema: CollectionSchema;
  position: number;
  library: Media[];
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    saveContentItem,
    null,
  );

  return (
    <div className="rounded-2xl border border-accent/35 bg-surface-raised shadow-console-sm">
      <h2 className="border-b border-line px-5 py-4 text-sm font-semibold text-fg sm:px-6">
        New item
      </h2>
      <form action={formAction} className="px-5 py-5 sm:px-6">
        <input type="hidden" name="collection" value={collection} />
        <input type="hidden" name="position" value={position} />
        <FormBody schema={schema} data={{}} library={library} />

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              name="published"
              defaultChecked
              className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
            />
            Visible on site
          </label>
          <AdminButton type="submit">Add item</AdminButton>
          <AdminButton type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </AdminButton>
          {state && (
            <span
              role="status"
              className={`text-sm ${state.ok ? "text-positive" : "text-danger"}`}
            >
              {state.message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
