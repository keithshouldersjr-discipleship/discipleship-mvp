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
      <main className="dbd-page flex min-h-screen items-center justify-center px-6">
        <div className="dbd-card w-full max-w-md p-6">
          <h1 className="dbd-serif text-3xl font-semibold text-[var(--ink)]">
            Check your email
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            We sent a sign-in link to{" "}
            <span className="font-semibold text-[var(--ink)]">{email}</span>.
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">(No password required.)</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dbd-page flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="dbd-card w-full max-w-md space-y-4 p-6"
      >
        <h1 className="dbd-serif text-3xl font-semibold text-[var(--ink)]">
          Sign in to Blueprint
        </h1>

        <div>
          <label className="dbd-label">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dbd-input"
            required
          />
        </div>

        <div>
          <label className="dbd-label">Church</label>
          <input
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            className="dbd-input"
            required
          />
        </div>

        <div>
          <label className="dbd-label">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="dbd-input"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="dbd-btn dbd-btn-primary w-full"
        >
          Email me a sign-in link
        </button>
      </form>
    </main>
  );
}
