"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function extractBlueprintId(nextPath: string): string | null {
  // Matches /blueprints/<uuid>
  const m = nextPath.match(
    /\/blueprints\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i,
  );
  return m?.[1] ?? null;
}

async function downloadPdfInPlace(pdfUrl: string) {
  const r = await fetch(pdfUrl, { method: "GET" });
  if (!r.ok) throw new Error("PDF download failed.");

  const blob = await r.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  // Let your API response Content-Disposition choose the filename
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export default function EmailGatePage() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = sp.get("next") || "/intake";

  // Optional: allow passing a direct pdf URL via query param if you ever want:
  // /email-gate?next=/blueprints/<id>&pdf=/api/blueprint/<id>/pdf
  const pdfFromQuery = sp.get("pdf");

  const blueprintId = extractBlueprintId(next);
  const pdfUrl =
    pdfFromQuery || (blueprintId ? `/api/blueprint/${blueprintId}/pdf` : null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [church, setChurch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill if you stored onboarding earlier
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dbd_onboarding");
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string; church?: string };
        if (parsed.name) setName(parsed.name);
        if (parsed.church) setChurch(parsed.church);
      }
    } catch {
      // ignore
    }
  }, []);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return e.includes("@") && e.includes(".");
  }, [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // 1) Subscribe (enqueue)
      const res = await fetch("/api/convertkit/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          church: church.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to subscribe.");
      }

      // Mark locally so we don't ask again on this browser
      localStorage.setItem("dbd_email", email.trim());

      // 2) Download the PDF (WITHOUT navigating away)
      if (pdfUrl) {
        await downloadPdfInPlace(pdfUrl);
      }

      // 3) Return them to the blueprint they were viewing
      router.replace(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-[#C6A75E]">Get your PDF</h1>
        <p className="text-sm text-white/70">
          Enter your email and we’ll unlock PDF download and send you updates.
        </p>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Name (optional)
          </label>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="Keith"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Church (optional)
          </label>
          <input
            value={church}
            onChange={(ev) => setChurch(ev.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="David’s Temple"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Email</label>
          <input
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            type="email"
            required
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="you@domain.com"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Unlock PDF"}
        </button>

        <p className="text-xs text-white/50">You can unsubscribe anytime.</p>
      </form>
    </main>
  );
}
