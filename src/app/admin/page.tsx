import Link from "next/link";
import {
  ArrowUpRight,
  EyeOff,
  FileStack,
  Layers,
  LibraryBig,
} from "lucide-react";
import { adminClient } from "@/lib/supabase";
import { adminNav } from "./nav";
import { AdminBadge, AdminCard, AdminMetric, AdminPage } from "./ui";

export const dynamic = "force-dynamic";

/**
 * Landing screen. Answers the two questions someone opening the panel actually
 * has: what can I change, and is anything currently hidden from the site.
 *
 * The figures lead because "is anything hidden?" is answerable at a glance and
 * expensive to get wrong; the directory below is the same set of destinations
 * as the rail, but with the hints attached, so the first visit doesn't require
 * hovering every item to find out what it does.
 */
export default async function AdminHome() {
  const supabase = adminClient();

  const [items, sections, pages] = await Promise.all([
    supabase?.from("content_items").select("published"),
    supabase?.from("sections").select("published"),
    supabase?.from("pages").select("published"),
  ]);

  const hidden =
    (items?.data?.filter((i) => !i.published).length ?? 0) +
    (sections?.data?.filter((s) => !s.published).length ?? 0) +
    (pages?.data?.filter((p) => !p.published).length ?? 0);

  return (
    <AdminPage
      title="Site management"
      description="Pick the page you want to change — everything on it is in one place. Site-wide settings and shared content are below."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Pages"
          value={pages?.data?.length ?? 0}
          icon={<FileStack size={19} aria-hidden />}
          hint="Routes on the public site"
        />
        <AdminMetric
          label="Sections"
          value={sections?.data?.length ?? 0}
          icon={<Layers size={19} aria-hidden />}
          hint="Blocks stacked down those pages"
        />
        <AdminMetric
          label="Content items"
          value={items?.data?.length ?? 0}
          icon={<LibraryBig size={19} aria-hidden />}
          hint="Rows across every collection"
        />
        <AdminMetric
          label="Hidden"
          value={hidden}
          icon={<EyeOff size={19} aria-hidden />}
          hint={hidden > 0 ? "Not visible to the public" : "Everything is live"}
          tone="alert"
        />
      </div>

      {hidden > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brass/25 bg-brass-wash px-5 py-4">
          <AdminBadge tone="warning">
            <EyeOff size={12} aria-hidden />
            Hidden
          </AdminBadge>
          <p className="text-sm text-fg">
            {hidden} item{hidden === 1 ? " is" : "s are"} hidden and will not
            appear on the public site.
          </p>
        </div>
      )}

      {adminNav.map((group) => (
        <AdminCard key={group.title} title={group.title}>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex h-full items-start gap-3 rounded-xl border border-line bg-canvas/60 p-4 transition-colors hover:border-accent/40 hover:bg-accent-wash"
                >
                  {link.icon ? (
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-raised text-fg-muted transition-colors group-hover:border-accent/30 group-hover:text-accent"
                    >
                      <link.icon size={17} />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-fg">
                      {link.label}
                      <ArrowUpRight
                        size={14}
                        aria-hidden
                        className="shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </span>
                    {link.hint && (
                      <span className="mt-1 block text-xs leading-relaxed text-fg-muted">
                        {link.hint}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      ))}
    </AdminPage>
  );
}
