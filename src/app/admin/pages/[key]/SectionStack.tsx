"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { addSection, deleteSection, moveSection, toggleSection } from "../../actions";
import { AdminBadge, AdminCard, adminControl } from "../../ui";
import { SECTION_TYPES } from "../section-types";

type Section = {
  id: string;
  page_slug: string;
  type: string;
  position: number;
  published: boolean;
};

/**
 * The blocks this page is built from, top to bottom.
 *
 * Types come from a fixed list because the renderer maps each one to a
 * component — free text would let someone add a block that renders nothing.
 */
export function SectionStack({
  pageSlug,
  sections,
}: {
  pageSlug: string;
  sections: Section[];
}) {
  return (
    <AdminCard
      title="Sections"
      description="The blocks stacked down this page, in order."
      flush
      footer={
        <form action={addSection} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="page_slug" value={pageSlug} />
          <select
            name="type"
            aria-label="Section to add"
            className={`${adminControl} h-11 w-auto min-w-56 appearance-none py-0`}
          >
            {Object.entries(SECTION_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 cursor-pointer rounded-lg border border-line bg-surface-raised px-4 text-sm font-medium text-fg shadow-console-xs transition-colors hover:border-accent hover:text-accent"
          >
            Add section
          </button>
        </form>
      }
    >
      {sections.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-fg-muted">
          No sections yet — add one below.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {sections.map((section, i) => (
            <li
              key={section.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-canvas/60 sm:px-6"
            >
              <span className="w-6 shrink-0 font-mono text-xs text-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                {SECTION_TYPES[section.type] ?? section.type}
              </span>
              {!section.published && (
                <AdminBadge tone="warning" className="hidden sm:inline-flex">
                  Hidden
                </AdminBadge>
              )}

              <div className="flex shrink-0 items-center gap-1">
                {(["up", "down"] as const).map((direction) => (
                  <form key={direction} action={moveSection}>
                    <input type="hidden" name="id" value={section.id} />
                    <input type="hidden" name="page_slug" value={pageSlug} />
                    <input type="hidden" name="direction" value={direction} />
                    <button
                      type="submit"
                      title={direction === "up" ? "Move up" : "Move down"}
                      disabled={direction === "up" ? i === 0 : i === sections.length - 1}
                      className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-sunken hover:text-fg disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      {direction === "up" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </form>
                ))}
                <form action={toggleSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="published" value={String(section.published)} />
                  <button
                    type="submit"
                    title={section.published ? "Hide" : "Show"}
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-sunken hover:text-fg"
                  >
                    {section.published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </form>
                <form action={deleteSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <button
                    type="submit"
                    title="Remove section"
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-critical/10 hover:text-critical"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
