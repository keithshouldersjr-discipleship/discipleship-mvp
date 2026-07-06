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
    <main className="dbd-page flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="dbd-card w-full max-w-md space-y-4 p-6"
      >
        <h1 className="dbd-serif text-3xl font-semibold text-[var(--ink)]">Get your PDF</h1>
        <p className="text-sm text-[var(--muted)]">
          Enter your email and we’ll unlock PDF download and send you updates.
        </p>

        <div>
          <label className="dbd-label">
            Name (optional)
          </label>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className="dbd-input"
            placeholder="Keith"
          />
        </div>

        <div>
          <label className="dbd-label">
            Church (optional)
          </label>
          <input
            value={church}
            onChange={(ev) => setChurch(ev.target.value)}
            className="dbd-input"
            placeholder="David’s Temple"
          />
        </div>

        <div>
          <label className="dbd-label">Email</label>
          <input
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            type="email"
            required
            className="dbd-input"
            placeholder="you@domain.com"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="dbd-btn dbd-btn-primary w-full disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Unlock PDF"}
        </button>

        <p className="text-xs text-[var(--muted)]">You can unsubscribe anytime.</p>
      </form>
    </main>
  );
}
