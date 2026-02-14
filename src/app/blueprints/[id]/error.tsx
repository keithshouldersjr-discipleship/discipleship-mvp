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
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-2xl font-semibold text-[#C6A75E]">
          Something went wrong loading this blueprint
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-white/60 mb-2">Error</div>
          <pre className="whitespace-pre-wrap text-sm text-white/80">
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : ""}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black"
          >
            Try again
          </button>
          <Link
            href="/blueprints"
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm text-white/80"
          >
            My Blueprints
          </Link>
        </div>
      </div>
    </main>
  );
}
