import OpenAI from "openai";
import {
  IntakeSchema,
  BlueprintSchema,
  type Intake,
  type Blueprint,
} from "@/lib/schema";
import { buildBlueprintPrompt } from "@/lib/prompt";
import { insertBlueprint } from "@/lib/blueprint-repo";

type GenerateBlueprintResult = { id: string; blueprint: Blueprint };

export async function generateBlueprint(
  userId: string,
  input: unknown
): Promise<GenerateBlueprintResult> {
  const intake: Intake = IntakeSchema.parse(input);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

  const client = new OpenAI({ apiKey });

  const prompt = buildBlueprintPrompt(intake);

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "Return ONLY valid JSON. No markdown. No commentary. Return a single JSON object.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("Model returned empty output.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Model returned invalid JSON.");
  }

  const blueprint: Blueprint = BlueprintSchema.parse(parsed);

  const id = await insertBlueprint(userId, intake, blueprint);

  return { id, blueprint };
}