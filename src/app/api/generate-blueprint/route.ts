import { NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/blueprint/generate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = await generateBlueprint(body);
    return NextResponse.json({ id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}