// src/app/api/generate-playbook/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { IntakeSchema, PlaybookSchema } from "@/lib/schema";
import { buildPlaybookPrompt } from "@/lib/prompt";
import { insertPlaybook } from "@/lib/playbook-repo";

// IMPORTANT: do not instantiate OpenAI at module scope if your build environment
// might not have env vars present during build. Create it inside POST instead.

export const runtime = "nodejs"; // ensure Node runtime (needed for service-role + server-only patterns)
export const dynamic = "force-dynamic";

type ErrorBody = { error: string };

function jsonError(message: string, status = 500) {
  return NextResponse.json<ErrorBody>({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    // 1) Parse/validate intake from the request body
    const body: unknown = await req.json();
    const intake = IntakeSchema.parse(body);

    // 2) Build prompt
    const prompt = buildPlaybookPrompt(intake);

    // 3) Create OpenAI client (runtime-safe)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonError("Server misconfigured; OPENAI_API_KEY is missing.", 500);
    }

    const openai = new OpenAI({ apiKey });

    // 4) Call the model
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a JSON-only generator. Return strictly valid JSON. No markdown, no commentary, no trailing commas.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return jsonError("No response from model.", 502);

    // 5) Parse JSON (strip accidental code fences defensively)
    const cleaned = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    let json: unknown;
    try {
      json = JSON.parse(cleaned);
    } catch {
      return jsonError("Model did not return valid JSON.", 502);
    }

    // 6) Validate playbook against schema (critical)
    const playbook = PlaybookSchema.parse(json);

    // 7) Persist to Supabase
    const id = await insertPlaybook(intake, playbook);

    // 8) Return id
    return NextResponse.json({ id });
  } catch (err: unknown) {
    // Zod errors (intake or playbook)
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: err },
        { status: 400 }
      );
    }

    console.error("generate-playbook POST error:", err);
    return jsonError(err instanceof Error ? err.message : "Unexpected server error.", 500);
  }
}