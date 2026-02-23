// src/app/api/convertkit/subscribe/route.ts

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubscribeBody = {
  email?: string;
  name?: string;
  church?: string;
};

type EdgeErrorShape =
  | { error?: unknown; message?: string; code?: number }
  | unknown;

function isValidEmail(email: string): boolean {
  return email.includes("@") && email.includes(".");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubscribeBody;

    const email = (body.email ?? "").trim().toLowerCase();
    const name = (body.name ?? "").trim();
    const church = (body.church ?? "").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email." },
        { status: 400 },
      );
    }

    // ✅ NEW enqueue-only edge function
    const edgeUrl = process.env.SUPABASE_EDGE_ENQUEUE_URL;
    const workerSecret = process.env.WORKER_SECRET;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!edgeUrl || !workerSecret || !supabaseAnon) {
      return NextResponse.json(
        { ok: false, error: "Missing server configuration." },
        { status: 500 },
      );
    }
console.log("SUBSCRIBE -> edgeUrl:", edgeUrl);
    const r = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // Required by Supabase Edge gateway
        apikey: supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`,

        // Your own secret gate
        "x-worker-secret": workerSecret,
      },
      body: JSON.stringify({
        email,
        name: name || null,
        church: church || null,
        source: "pdf_gate",
      }),
    });

    const data: EdgeErrorShape = await r.json().catch(() => ({}));

    // ✅ 202 = success (job queued)
    if (r.status === 202 || r.status === 200) {
      return NextResponse.json({ ok: true });
    }

    console.error("Enqueue edge function error:", {
      status: r.status,
      data,
    });

    const msg =
      typeof data === "object" && data !== null
        ? "error" in data && (data as { error?: unknown }).error
          ? (data as { error?: unknown }).error
          : "message" in data
            ? (data as { message?: string }).message
            : data
        : data;

    return NextResponse.json(
      { ok: false, error: msg ?? "Enqueue failed." },
      { status: 502 },
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500 },
    );
  }
}