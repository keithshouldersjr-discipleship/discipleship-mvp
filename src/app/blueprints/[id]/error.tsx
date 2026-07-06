// src/app/blueprints/[id]/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BlueprintError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[blueprints/[id]] error boundary:", error);
  }, [error]);

  return (
    <main className="dbd-page px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="dbd-serif text-3xl font-semibold text-[var(--ink)]">
          Something went wrong loading this blueprint
        </div>

        <div className="dbd-card p-5">
          <div className="mb-2 text-sm font-extrabold text-[var(--muted)]">Error</div>
          <pre className="whitespace-pre-wrap text-sm text-[var(--muted)]">
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : ""}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="dbd-btn dbd-btn-primary"
          >
            Try again
          </button>
          <Link
            href="/blueprints"
            className="dbd-btn dbd-btn-secondary"
          >
            My Blueprints
          </Link>
        </div>
      </div>
    </main>
  );
}
