import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, Layers3, PenLine, Sparkles } from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";

export const runtime = "nodejs";

export default function Home() {
  return (
    <main className="dbd-page">
      <AppTopBar />

      <section className="dbd-shell grid min-h-[calc(100vh-73px)] gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="dbd-eyebrow">A Discipleship by Design tool</div>
          <h1 className="dbd-serif mt-5 text-5xl leading-[0.98] tracking-normal text-[var(--ink)] md:text-7xl">
            Blueprint
            <span className="block text-[var(--forest)] italic">
              lesson builder.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Design clear, purposeful discipleship lessons from a passage, topic,
            or formation goal. Blueprint helps you move from a good idea to an
            intentional teaching plan.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/intake" className="dbd-btn dbd-btn-primary">
              Begin designing
            </Link>
            <Link href="/blueprints" className="dbd-btn dbd-btn-secondary">
              View my blueprints
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Outcome first", "Start with formation, not filler."],
              ["Structured flow", "Shape Inform, Inspire, and Involve."],
              ["Ready to use", "Leave with a practical lesson plan."],
            ].map(([title, copy]) => (
              <div key={title} className="dbd-card-muted p-4">
                <div className="text-sm font-extrabold text-[var(--ink)]">
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="dbd-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[#f3f0e6] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--gold)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--sage)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#87a9c8]" />
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
                <Image
                  src="/dd-logo.png"
                  alt="Blueprint"
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Blueprint draft
                </div>
                <div className="text-xl font-extrabold text-[var(--ink)]">
                  Teach with intent
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <PreviewRow
                icon={<PenLine className="h-5 w-5" />}
                title="Formation outcome"
                copy="What should learners understand, believe, or practice?"
              />
              <PreviewRow
                icon={<BookOpen className="h-5 w-5" />}
                title="Lesson movements"
                copy="Inform truth, inspire connection, involve practice."
              />
              <PreviewRow
                icon={<Layers3 className="h-5 w-5" />}
                title="Session flow"
                copy="A usable plan with timing, prompts, activities, and next steps."
              />
            </div>

            <div className="mt-8 rounded-lg border border-[var(--line)] bg-[var(--sage-soft)] p-5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--forest)]">
                <Sparkles className="h-4 w-4" />
                Designed for real ministry rhythms
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Use AI as a planning partner while keeping pastoral judgment and
                classroom context in the driver&apos;s seat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewRow({
  icon,
  title,
  copy,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="grid grid-cols-[44px_1fr] gap-4 rounded-lg border border-[var(--line)] bg-white p-4">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--gold-soft)] text-[var(--forest)]">
        {icon}
      </div>
      <div>
        <div className="font-extrabold text-[var(--ink)]">{title}</div>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{copy}</p>
      </div>
    </div>
  );
}
