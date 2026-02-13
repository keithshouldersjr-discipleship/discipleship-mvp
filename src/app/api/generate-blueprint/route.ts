// src/app/api/generate-blueprint/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { IntakeSchema, BlueprintSchema, type Intake, type Blueprint } from "@/lib/schema";
import { buildBlueprintPrompt } from "@/lib/prompt";
import { insertBlueprint } from "@/lib/blueprint-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateOk = { id: string };
type GenerateErr = { error: string; details?: unknown; raw?: string };

function jsonError(payload: GenerateErr, status: number): NextResponse<GenerateErr> {
  return NextResponse.json(payload, { status });
}

function hasIssues(e: unknown): e is { issues: unknown } {
  return typeof e === "object" && e !== null && "issues" in e;
}

/** Extract a JSON object from a string that may contain extra text. */
function extractJsonObject(text: string): string | null {
  const s = text.trim();
  if (!s) return null;

  // Fast path: looks like pure JSON object
  if (s.startsWith("{") && s.endsWith("}")) return s;

  // Otherwise, find the first balanced {...} object
  const start = s.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") depth--;

    if (depth === 0) {
      return s.slice(start, i + 1);
    }
  }

  return null;
}

/** If model wrapped the blueprint inside a common property, unwrap it. */
function unwrapCandidate(v: unknown): unknown {
  // double-encoded JSON string
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }

  if (typeof v !== "object" || v === null) return v;

  const obj = v as Record<string, unknown>;

  const b = obj.blueprint;
  if (typeof b === "object" && b !== null) return b;

  const r = obj.result;
  if (typeof r === "object" && r !== null) return r;

  const d = obj.data;
  if (typeof d === "object" && d !== null) return d;

  return v;
}

function keysOf(v: unknown): string[] | undefined {
  if (typeof v !== "object" || v === null) return undefined;
  return Object.keys(v as Record<string, unknown>).slice(0, 30);
}

export async function POST(req: Request) {
  try {
    // 1) Read + validate intake
    const body: unknown = await req.json();
    const intakeResult = IntakeSchema.safeParse(body);

    if (!intakeResult.success) {
      return jsonError(
        { error: "Invalid intake.", details: intakeResult.error.flatten() },
        400
      );
    }

    const intake: Intake = intakeResult.data;

    // 2) Build prompt
    const prompt = buildBlueprintPrompt(intake);

    // 3) OpenAI client
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonError(
        { error: "Server misconfigured: OPENAI_API_KEY is missing." },
        500
      );
    }

    const client = new OpenAI({ apiKey });

    // 4) Generate
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON. No markdown. No commentary. Return a single JSON object that matches the schema.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";

    if (!raw.trim()) {
      console.error("OpenAI returned empty content.");
      return jsonError({ error: "Model returned empty output." }, 502);
    }

    // 5) Parse JSON (with extraction fallback)
    let parsed: unknown;
    try {
      const extracted = extractJsonObject(raw) ?? raw.trim();
      parsed = JSON.parse(extracted);
    } catch {
      console.error("JSON parse failed. Raw (first 4000):\n", raw.slice(0, 4000));
      return jsonError(
        { error: "Model returned invalid JSON.", raw: raw.slice(0, 4000) },
        502
      );
    }

    // 6) Unwrap common wrapper shapes (blueprint/result/data)
    const candidate = unwrapCandidate(parsed);

    // 7) Validate blueprint output
    const bpResult = BlueprintSchema.safeParse(candidate);

    if (!bpResult.success) {
      const flat = bpResult.error.flatten();

      console.error("Blueprint schema validation failed:", flat);
      console.error("Candidate keys:", keysOf(candidate));
      console.error("Raw output (first 4000):\n", raw.slice(0, 4000));

      return jsonError(
        {
          error: "Blueprint schema validation failed.",
          details: flat,
          raw: raw.slice(0, 4000),
        },
        502
      );
    }

    const blueprint: Blueprint = bpResult.data;

    // 8) Persist (ties to user_id inside insertBlueprint)
    const id = await insertBlueprint(intake, blueprint);

    return NextResponse.json({ id } satisfies GenerateOk);
  } catch (err: unknown) {
    // If something threw a ZodError directly somewhere else, surface it cleanly
    if (hasIssues(err)) {
      return jsonError(
        { error: "Invalid intake or output schema.", details: (err as { issues: unknown }).issues },
        400
      );
    }

    const msg = err instanceof Error ? err.message : "Unexpected error";
    return jsonError({ error: msg }, 500);
  }
}