"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function EmailGateClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = sp.get("next") || "/intake";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [church, setChurch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dbd_onboarding");
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string; church?: string };
        if (parsed.name) setName(parsed.name);
        if (parsed.church) setChurch(parsed.church);
      }
    } catch {}
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
      const res = await fetch("/api/convertkit/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          church: church.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok)
        throw new Error(data.error || "Failed to subscribe.");

      localStorage.setItem("dbd_email", email.trim());

      // go back to wherever you came from
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
