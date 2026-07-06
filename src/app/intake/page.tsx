"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { AppTopBar } from "@/components/AppTopBar";

import {
  ConstraintOptions,
  AgeGroupOptions,
  SettingOptions,
  DurationOptions,
  type Constraint,
  type AgeGroup,
  type Setting,
  type Duration,
} from "@/lib/options";

type FormData = {
  // Step 1
  desiredOutcome: string;
  topicOrText: string;

  // Step 2
  ageGroup: AgeGroup | "";
  groupName: string;
  leaderName: string;

  // Step 3
  setting: Setting | "";
  settingDetail: string;

  duration: Duration | "";
  durationCustomMinutes: string;

  constraintsSelected: Constraint[];
};

type SetFormData = Dispatch<SetStateAction<FormData>>;

function CardButton({
  selected,
  onClick,
  children,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-lg border p-4 text-left transition",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        selected
          ? "border-[var(--forest)] bg-[var(--sage-soft)] shadow-sm"
          : "border-[var(--line)] bg-white/70 hover:border-[rgba(31,77,63,0.32)] hover:bg-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function PremiumThinkingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[rgba(22,48,42,0.62)] backdrop-blur-sm" />

      <div className="relative h-full w-full flex items-center justify-center px-6">
        <div className="dbd-card w-full max-w-md p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
              <Image
                src="/dd-logo.png"
                alt="Blueprint"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--muted)]">
                Blueprint
              </div>
              <div className="text-lg font-extrabold tracking-tight text-[var(--forest)]">
                Designing your blueprint…
              </div>
            </div>

            <div className="h-9 w-9 rounded-full border border-[var(--line)] flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[rgba(31,77,63,0.2)] border-t-[var(--forest)]" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--sage-soft)]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--gold)]" />
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              We’re building your plan with clear outcomes, pacing, prompts, and
              practical activities. This usually takes a few seconds.
            </p>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--sage-soft)] p-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
                What’s happening
              </div>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ink)]">
                <li>Interpreting your goal and audience</li>
                <li>Structuring the session flow</li>
                <li>Generating Inform / Inspire / Involve prompts</li>
              </ul>
            </div>
          </div>

          <p className="mt-4 text-xs text-[var(--muted)]">
            Tip: keep this tab open until the blueprint loads.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IntakePage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    desiredOutcome: "",
    topicOrText: "",

    ageGroup: "",
    groupName: "",
    leaderName: "",

    setting: "",
    settingDetail: "",

    duration: "",
    durationCustomMinutes: "",

    constraintsSelected: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // Step gates
  const canGoStep1 = formData.desiredOutcome.trim().length >= 10;
  const canGoStep2 =
    formData.ageGroup !== "" && formData.groupName.trim().length > 0;

  const durationNeedsCustom =
    formData.duration === "Custom" &&
    formData.durationCustomMinutes.trim().length > 0;

  const canSubmit = useMemo(() => {
    const settingOk =
      formData.setting !== "" &&
      (formData.setting !== "Other" ||
        formData.settingDetail.trim().length > 0);

    const durationOk =
      formData.duration !== "" &&
      (formData.duration !== "Custom" || durationNeedsCustom);

    return canGoStep1 && canGoStep2 && settingOk && durationOk;
  }, [
    canGoStep1,
    canGoStep2,
    formData.setting,
    formData.settingDetail,
    formData.duration,
    durationNeedsCustom,
  ]);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const durationCustomMinutes =
        formData.duration === "Custom"
          ? Number(formData.durationCustomMinutes)
          : undefined;

      const payload = {
        ageGroup: formData.ageGroup,
        groupName: formData.groupName.trim(),
        leaderName: formData.leaderName.trim() || undefined,

        desiredOutcome: formData.desiredOutcome.trim(),
        topicOrText: formData.topicOrText.trim() || "",

        setting: formData.setting,
        settingDetail:
          formData.setting === "Other"
            ? formData.settingDetail.trim()
            : undefined,

        duration: formData.duration,
        durationCustomMinutes,

        constraints: formData.constraintsSelected.length
          ? formData.constraintsSelected
          : undefined,

        // Optional: you can set role here explicitly if you want,
        // but your API already defaults role to Teacher.
        // role: "Teacher",
      };

      const res = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        id?: string;
        error?: string;
        details?: unknown;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate blueprint.");
      }

      if (!data.id)
        throw new Error("Blueprint generation did not return an id.");

      router.push(`/blueprints/${data.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dbd-page">
      <AppTopBar />
      <PremiumThinkingOverlay show={isSubmitting} />

      <div className="dbd-shell grid min-h-[calc(100vh-73px)] items-center py-10">
        <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
            <Image
              src="/dd-logo.png"
              alt="Blueprint"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-extrabold tracking-tight text-[var(--ink)]">
              Blueprint
            </div>
            <div className="text-sm font-semibold text-[var(--muted)]">
              Teach with intent.
            </div>
          </div>
        </div>

        <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
          Step {step} of 3
        </p>

        <div className="dbd-card p-6 sm:p-8">
          {step === 1 ? (
            <StepOneOutcome
              formData={formData}
              setFormData={setFormData}
              next={next}
              canNext={canGoStep1}
            />
          ) : null}

          {step === 2 ? (
            <StepTwoAudience
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
              canNext={canGoStep2}
            />
          ) : null}

          {step === 3 ? (
            <StepThreeContext
              formData={formData}
              setFormData={setFormData}
              back={back}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onSubmit={handleSubmit}
            />
          ) : null}
        </div>
        </div>
      </div>
    </main>
  );
}

/* -----------------------------
   Step 1: Outcome + topic/text
   (This is your old Step 3, unchanged)
------------------------------ */
function StepOneOutcome({
  formData,
  setFormData,
  next,
  canNext,
}: {
  formData: FormData;
  setFormData: SetFormData;
  next: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="dbd-serif mb-2 text-3xl font-semibold text-[var(--ink)]">
          Desired formation outcome
        </h2>
        <p className="text-[var(--muted)]">
          What should learners understand, believe, or practice because of this?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="dbd-label">
            Outcome (write 1–3 sentences)
          </label>
          <textarea
            value={formData.desiredOutcome}
            onChange={(e) =>
              setFormData((p) => ({ ...p, desiredOutcome: e.target.value }))
            }
            rows={5}
            className="dbd-input"
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            Tip: Write it as observable change, not a vague desire.
          </p>
        </div>

        <div>
          <label className="dbd-label">
            Scripture or topic (optional)
          </label>
          <input
            value={formData.topicOrText}
            onChange={(e) =>
              setFormData((p) => ({ ...p, topicOrText: e.target.value }))
            }
            className="dbd-input"
            placeholder="Example: Mark 2:13–17 or Prayer"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!canNext}
        onClick={next}
        className="dbd-btn dbd-btn-primary disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

/* -----------------------------
   Step 2: Audience (unchanged from your old Step 2)
------------------------------ */
function StepTwoAudience({
  formData,
  setFormData,
  next,
  back,
  canNext,
}: {
  formData: FormData;
  setFormData: SetFormData;
  next: () => void;
  back: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="dbd-serif mb-2 text-3xl font-semibold text-[var(--ink)]">Who are you leading?</h2>
        <p className="text-[var(--muted)]">
          This shapes tone, pacing, and engagement.
        </p>
      </div>

      <div className="space-y-3">
        <div className="dbd-label">Age group</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {AgeGroupOptions.map((a) => (
            <CardButton
              key={a}
              selected={formData.ageGroup === a}
              onClick={() => setFormData((p) => ({ ...p, ageGroup: a }))}
            >
              <div className="font-semibold">{a}</div>
            </CardButton>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="dbd-label">Group name</label>
          <input
            value={formData.groupName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, groupName: e.target.value }))
            }
            className="dbd-input"
            placeholder="e.g., Nehemiah’s Table"
          />
        </div>

        <div>
          <label className="dbd-label">
            Your name (optional)
          </label>
          <input
            value={formData.leaderName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, leaderName: e.target.value }))
            }
            className="dbd-input"
            placeholder="e.g., Keith"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={back}
          className="dbd-link"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="dbd-btn dbd-btn-primary disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 3: Context + duration + constraints
   (This is your old Step 4, moved to step 3)
------------------------------ */
function StepThreeContext({
  formData,
  setFormData,
  back,
  canSubmit,
  isSubmitting,
  submitError,
  onSubmit,
}: {
  formData: FormData;
  setFormData: SetFormData;
  back: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="dbd-serif mb-2 text-3xl font-semibold text-[var(--ink)]">Context & constraints</h2>
        <p className="text-[var(--muted)]">
          Select up to two constraints so we can focus on the biggest hurdles.
        </p>
      </div>

      <div className="space-y-3">
        <div className="dbd-label">Setting</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SettingOptions.map((s) => (
            <CardButton
              key={s}
              selected={formData.setting === s}
              onClick={() => setFormData((p) => ({ ...p, setting: s }))}
            >
              <div className="font-semibold">{s}</div>
            </CardButton>
          ))}
        </div>

        {formData.setting === "Other" ? (
          <div>
            <label className="dbd-label">
              Describe the setting
            </label>
            <input
              value={formData.settingDetail}
              onChange={(e) =>
                setFormData((p) => ({ ...p, settingDetail: e.target.value }))
              }
              className="dbd-input"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="dbd-label">Typical session length</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {DurationOptions.map((d) => (
            <CardButton
              key={d}
              selected={formData.duration === d}
              onClick={() => setFormData((p) => ({ ...p, duration: d }))}
            >
              <div className="font-semibold">{d}</div>
            </CardButton>
          ))}
        </div>

        {formData.duration === "Custom" ? (
          <div>
            <label className="dbd-label">
              Custom minutes
            </label>
            <input
              value={formData.durationCustomMinutes}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  durationCustomMinutes: e.target.value,
                }))
              }
              className="dbd-input"
              inputMode="numeric"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="dbd-label">Constraints (pick up to 2)</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ConstraintOptions.map((c) => {
            const selected = formData.constraintsSelected.includes(c);
            const atMax = !selected && formData.constraintsSelected.length >= 2;

            return (
              <CardButton
                key={c}
                selected={selected}
                disabled={atMax}
                onClick={() => {
                  setFormData((p) => {
                    const exists = p.constraintsSelected.includes(c);
                    if (exists) {
                      return {
                        ...p,
                        constraintsSelected: p.constraintsSelected.filter(
                          (x) => x !== c,
                        ),
                      };
                    }
                    if (p.constraintsSelected.length >= 2) return p;
                    return {
                      ...p,
                      constraintsSelected: [...p.constraintsSelected, c],
                    };
                  });
                }}
              >
                <div className="font-semibold">{c}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {selected ? "Selected" : atMax ? "Max 2 selected" : "Select"}
                </div>
              </CardButton>
            );
          })}
        </div>

        {formData.constraintsSelected.length ? (
          <p className="text-xs text-[var(--muted)]">
            Selected: {formData.constraintsSelected.join(" · ")}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p className="text-sm text-red-400 whitespace-pre-wrap">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={back}
          className="dbd-link"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
          className="dbd-btn dbd-btn-primary disabled:opacity-60"
        >
          {isSubmitting ? "Designing…" : "Generate Blueprint"}
        </button>
      </div>
    </div>
  );
}
