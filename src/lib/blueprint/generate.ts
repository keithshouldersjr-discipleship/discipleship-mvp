import OpenAI from "openai";
import { IntakeSchema, BlueprintSchema, type Intake, type Blueprint } from "@/lib/schema";
import { buildBlueprintPrompt } from "@/lib/prompt";
import { insertBlueprint } from "@/lib/blueprint-repo"; // rename or keep playbook-repo

export async function generateBlueprint(input: unknown): Promise<{ id: string; blueprint: Blueprint }> {
  const intake: Intake = IntakeSchema.parse(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = buildBlueprintPrompt(intake);

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const json = JSON.parse(text);

  const blueprint: Blueprint = BlueprintSchema.parse(json);

  const id = await insertBlueprint(intake, blueprint);

  return { id, blueprint };
}