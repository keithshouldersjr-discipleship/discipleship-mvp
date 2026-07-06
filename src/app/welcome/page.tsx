"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function WelcomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [church, setChurch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If they already have a session, skip the form
  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/");
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = supabaseBrowser();

      // 1) Anonymous session (device-based)
      const { error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) throw anonErr;

      // 2) Save email + church to profile (server checks session)
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          church: church.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile.");

      // 3) Go to authenticated home
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setLoading(false);
    }
  }

  return (
    <main className="dbd-page flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="dbd-card w-full max-w-md space-y-4 p-6"
      >
        <h1 className="dbd-serif text-3xl font-semibold text-[var(--ink)]">
          Welcome to Blueprint
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Enter your email + church once to personalize your blueprints.
        </p>

        <div>
          <label className="dbd-label">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="dbd-input"
            placeholder="you@church.org"
          />
        </div>

        <div>
          <label className="dbd-label">Church</label>
          <input
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            required
            className="dbd-input"
            placeholder="David’s Temple"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="dbd-btn dbd-btn-primary w-full disabled:opacity-60"
        >
          {loading ? "Saving…" : "Continue"}
        </button>

        <p className="text-xs text-[var(--muted)]">
          This creates device-based access. Clearing cookies or switching
          devices will reset access until we add account recovery.
        </p>
      </form>
    </main>
  );
}
