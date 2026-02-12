import Image from "next/image";
import { notFound } from "next/navigation";
import { getPlaybook } from "@/lib/store";
import type { Playbook } from "@/lib/schema";
import { fetchPlaybookById } from "@/lib/playbook-repo";

export const dynamic = "force-dynamic";

function NotFoundView() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black">
            <Image
              src="/formatio-logo.png"
              alt="Formatio"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm text-white/60">Formatio</div>
            <div className="font-semibold tracking-tight text-[#C6A75E]">
              Playbook not found
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-white/70 leading-relaxed">
            This playbook isn’t available anymore. If you refreshed the page or
            redeployed, the temporary in-memory store may have been cleared.
          </p>

          <a
            href="/intake"
            className="mt-4 inline-flex rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black"
          >
            Generate a new playbook
          </a>

          <p className="mt-4 text-xs text-white/40">
            Persistence (Supabase) will make playbooks permanent.
          </p>
        </div>
      </div>
    </main>
  );
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const playbook = await fetchPlaybookById(id);
  if (!playbook) return notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* subtle premium background */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#C6A75E]/10 blur-3xl" />
        <div className="absolute left-[10%] top-[35%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        {/* Top bar */}
        <div className="sticky top-0 z-10 -mx-6 mb-8 border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image
                  src="/formatio-logo.png"
                  alt="Formatio"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm text-white/60">Formatio Playbook</div>
                <div className="font-semibold tracking-tight text-white">
                  {playbook.preparedFor.groupName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/intake"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07] transition"
              >
                New playbook
              </a>

              {/* PDF export comes after persistence */}
              <button
                type="button"
                disabled
                className="rounded-full bg-[#C6A75E] px-4 py-2 text-sm font-semibold text-black opacity-60"
                title="PDF export coming next"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Hero */}
        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
              Prepared for: {playbook.preparedFor.leaderName}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
              Context: {playbook.preparedFor.context}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
              Audience: {playbook.preparedFor.audience}
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#C6A75E]">
            {playbook.title}
          </h1>

          {playbook.subtitle ? (
            <p className="text-base text-white/70">{playbook.subtitle}</p>
          ) : null}

          <p className="max-w-3xl text-white/70 leading-relaxed">
            {playbook.executiveSummary}
          </p>
        </header>

        {/* Bloom objectives (core MVP section) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Bloom’s Objectives
            </h2>
            <p className="text-sm text-white/60">
              A progression of learning outcomes (head → heart → hands).
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            {playbook.bloomsObjectives.map((o, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[#C6A75E]">
                    {o.level}
                  </div>
                  <div className="text-xs text-white/50">Objective {i + 1}</div>
                </div>

                <div className="mt-2 text-sm text-white/85 leading-relaxed">
                  {o.objective}
                </div>

                <div className="mt-3 text-xs uppercase tracking-wider text-white/50">
                  Evidence of learning
                </div>
                <div className="mt-1 text-sm text-white/70 leading-relaxed">
                  {o.evidence}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-10 pb-6 text-center text-xs text-white/40">
          Generated by Formatio · Simple Christian Education
        </footer>
      </div>
    </main>
  );
}
