import Link from "next/link";
import Image from "next/image";
import { fetchMyBlueprints } from "@/lib/blueprint-repo";
import { AppTopBar } from "@/components/AppTopBar";
import type { BlueprintListItem } from "@/lib/blueprint-repo";

export const dynamic = "force-dynamic";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="dbd-pill">
      {children}
    </span>
  );
}

export default async function BlueprintsPage() {
  const items = await fetchMyBlueprints();

  return (
    <main className="dbd-page">
      <AppTopBar />

      <div className="dbd-shell max-w-4xl py-10 space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
              <Image
                src="/dd-logo.png"
                alt="Blueprint"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--muted)]">
                Blueprint
              </div>
              <div className="dbd-serif text-3xl font-semibold text-[var(--ink)]">
                My Blueprints
              </div>
            </div>
          </div>

          <Link
            href="/intake"
            className="dbd-btn dbd-btn-primary"
          >
            New Blueprint
          </Link>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="dbd-card p-6 text-[var(--muted)]">
            You haven’t generated any blueprints yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((bp: BlueprintListItem) => (
              <div
                key={bp.id}
                className="dbd-card p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-base font-extrabold text-[var(--ink)]">
                      {bp.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill>{bp.role}</Pill>
                      <Pill>{bp.groupName}</Pill>
                      <Pill>{new Date(bp.createdAt).toLocaleDateString()}</Pill>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/blueprints/${bp.id}`}
                      className="dbd-btn dbd-btn-secondary min-h-0 py-2"
                    >
                      View
                    </Link>

                    <a
                      href={`/api/blueprint/${bp.id}/pdf`}
                      className="dbd-btn dbd-btn-gold min-h-0 py-2"
                    >
                      PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/" className="dbd-link text-sm">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
