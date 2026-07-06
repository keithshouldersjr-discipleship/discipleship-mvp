"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MenuItem = { label: string; href: string };

const MENU: MenuItem[] = [
  { label: "New Blueprint", href: "/intake" },
  { label: "My Blueprints", href: "/blueprints" },
  { label: "Methodology", href: "/about" },
  { label: "Home", href: "/" },
];

export function AppMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 transition hover:bg-[var(--sage-soft)]"
      >
        <div className="flex flex-col gap-1">
          <span className="block h-0.5 w-5 bg-[var(--forest)]" />
          <span className="block h-0.5 w-5 bg-[var(--forest)]" />
          <span className="block h-0.5 w-5 bg-[var(--forest)]" />
          <span className="block h-0.5 w-5 bg-[var(--forest)]" />
        </div>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-[rgba(22,48,42,0.5)] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-[320px] max-w-[85vw]",
          "border-l border-[var(--line)] bg-[rgba(250,249,245,0.96)] backdrop-blur",
          "transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <div className="text-sm font-extrabold text-[var(--ink)]">
              Blueprint
            </div>
            <div className="text-xs font-semibold text-[var(--muted)]">
              Lesson builder
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--sage-soft)]"
          >
            Close
          </button>
        </div>

        <nav className="p-5 space-y-2">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg border border-[var(--line)] bg-white/70 px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--sage-soft)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
