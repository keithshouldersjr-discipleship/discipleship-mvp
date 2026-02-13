import { NextResponse } from "next/server";
import { getBlueprint } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const blueprint = getBlueprint(id);

  if (!blueprint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ blueprint });
}