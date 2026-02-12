import { NextResponse } from "next/server";
import OpenAI from "openai";
import { IntakeSchema, PlaybookSchema } from "@/lib/schema";
import { buildPlaybookPrompt } from "@/lib/prompt";
import { insertPlaybook } from "@/lib/playbook-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevents static evaluation

function safeJsonParse(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfigured: OPENAI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const body = await req.json();
    const intake = IntakeSchema.parse(body);

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: buildPlaybookPrompt(intake),
    });

    const text = response.output_text?.trim();
    if (!text) throw new Error("No output returned from model.");

    const json = safeJsonParse(text);
    const playbook = PlaybookSchema.parse(json);

    const id = await insertPlaybook(intake, playbook);

    return NextResponse.json({ id, playbook });
  } catch (err: unknown) {
    console.error("Playbook generation error:", err);

    const message = err instanceof Error ? err.message : "Unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}