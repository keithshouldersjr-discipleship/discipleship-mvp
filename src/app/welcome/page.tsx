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
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-[#C6A75E]">
          Discipleship by Design
        </h1>
        <p className="text-sm text-white/60">
          Enter your email + church once to personalize your blueprints.
        </p>

        <div>
          <label className="block text-sm text-white/70 mb-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="you@church.org"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Church</label>
          <input
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            required
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="David’s Temple"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {loading ? "Saving…" : "Continue"}
        </button>

        <p className="text-xs text-white/40">
          This creates device-based access. Clearing cookies or switching
          devices will reset access until we add account recovery.
        </p>
      </form>
    </main>
  );
}
