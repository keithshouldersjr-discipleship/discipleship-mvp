"use client";

import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("dbd_onboarding");
    if (!raw) return;

    const parsed = JSON.parse(raw) as { name?: string; church?: string };
    if (!parsed?.name || !parsed?.church) return;

    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: parsed.name, church: parsed.church }),
    })
      .then(() => {
        setSaved(true);
        localStorage.removeItem("dbd_onboarding");
      })
      .catch(() => {
        // If this fails, user can still proceed; you can show a warning if desired
      });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-2xl font-semibold text-[#C6A75E]">
          Welcome to Discipleship by Design
        </h1>

        <p className="text-white/70">
          {saved
            ? "You’re signed in — and your profile is set."
            : "You’re signed in. Finishing setup…"}
        </p>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h2 className="text-sm font-semibold text-white">
            Get new frameworks + training tools by email
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Optional — subscribe to the newsletter.
          </p>

          {/* Paste your Substack embed iframe here */}
          <div className="mt-4">
            {/* Example placeholder: replace with your actual Substack embed code */}
            <div className="text-sm text-white/50">
              Paste your Substack embed iframe here (Settings → Growth
              features).
            </div>
          </div>
        </div>

        <a
          href="/intake"
          className="inline-flex rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black"
        >
          Continue to generate a blueprint
        </a>
      </div>
    </main>
  );
}
