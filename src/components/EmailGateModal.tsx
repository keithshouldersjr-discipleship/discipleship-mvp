"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function EmailGateModal({
  open,
  onClose,
  onSuccess,
  reason = "save and download your blueprint",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reason?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function sendMagicLink() {
    try {
      setStatus("sending");
      setError(null);

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (otpErr) throw otpErr;

      // ConvertKit subscribe now (or do it after callback—either works)
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tags: ["app-user", "teacher"],
        }),
      });

      setStatus("sent");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to send link.");
    }
  }

  // Poll session after user clicks magic link and returns
  async function checkSignedIn() {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email) {
      onSuccess();
      onClose();
    } else {
      setError("Still not signed in yet. Try again after opening the link.");
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-24 w-full max-w-md rounded-3xl border border-white/10 bg-black/90 p-6 text-white shadow-2xl">
        <div className="text-lg font-semibold text-[#C6A75E]">
          Quick email check
        </div>
        <p className="mt-2 text-sm text-white/70">
          Enter your email to {reason}. We’ll send a magic link (no password).
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
        />

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={sendMagicLink}
            disabled={status === "sending" || !email.includes("@")}
            className="flex-1 rounded-full bg-[#C6A75E] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80"
          >
            Not now
          </button>
        </div>

        {status === "sent" ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold">Check your email</div>
            <p className="mt-1 text-sm text-white/70">
              Open the link, then come back here and click:
            </p>
            <button
              type="button"
              onClick={checkSignedIn}
              className="mt-3 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/85"
            >
              I clicked the link
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
