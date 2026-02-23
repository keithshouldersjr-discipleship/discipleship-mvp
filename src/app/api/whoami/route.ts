import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await supabaseRoute();
  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json({
    user: data?.user ?? null,
    error: error?.message ?? null,
  });
}