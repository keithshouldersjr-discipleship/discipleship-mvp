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
    <main className="dbd-page flex min-h-screen items-center justify-center px-6">
      <div className="dbd-card w-full max-w-2xl space-y-6 p-6">
        <h1 className="dbd-serif text-3xl font-semibold text-[var(--ink)]">
          Welcome to Blueprint
        </h1>

        <p className="text-[var(--muted)]">
          {saved
            ? "You’re signed in — and your profile is set."
            : "You’re signed in. Finishing setup…"}
        </p>

        <div className="dbd-card-muted p-4">
          <h2 className="text-sm font-extrabold text-[var(--ink)]">
            Get new frameworks + training tools by email
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Optional — subscribe to the newsletter.
          </p>

          {/* Paste your Substack embed iframe here */}
          <div className="mt-4">
            {/* Example placeholder: replace with your actual Substack embed code */}
            <div className="text-sm text-[var(--muted)]">
              Paste your Substack embed iframe here (Settings → Growth
              features).
            </div>
          </div>
        </div>

        <a
          href="/intake"
          className="dbd-btn dbd-btn-primary"
        >
          Continue to generate a blueprint
        </a>
      </div>
    </main>
  );
}
