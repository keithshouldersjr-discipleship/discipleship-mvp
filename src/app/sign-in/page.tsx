"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export default function SignInPage() {
  const [name, setName] = useState("");
  const [church, setChurch] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // Save onboarding info locally until the user clicks the magic link
      localStorage.setItem(
        "dbd_onboarding",
        JSON.stringify({ name: name.trim(), church: church.trim() }),
      );

      const supabase = supabaseBrowser();

      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
          // optional: prevent automatic user creation (usually you WANT creation)
          // shouldCreateUser: true,
        },
      });

      if (otpError) throw otpError;

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-xl font-semibold text-[#C6A75E]">
            Check your email
          </h1>
          <p className="mt-2 text-white/70">
            We sent a sign-in link to{" "}
            <span className="text-white">{email}</span>.
          </p>
          <p className="mt-2 text-xs text-white/50">(No password required.)</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-[#C6A75E]">
          Sign in to Discipleship by Design
        </h1>

        <div>
          <label className="block text-sm text-white/70 mb-2">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Church</label>
          <input
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black"
        >
          Email me a sign-in link
        </button>
      </form>
    </main>
  );
}
