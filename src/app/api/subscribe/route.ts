import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = { email?: string; tags?: string[] };

export async function POST(req: Request) {
  try {
    const { email, tags } = (await req.json()) as Body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const apiKey = process.env.CONVERTKIT_API_KEY; // or KIT_API_KEY
    const formId = process.env.CONVERTKIT_FORM_ID; // create a form in ConvertKit

    if (!apiKey || !formId) {
      return NextResponse.json(
        { error: "ConvertKit env vars missing." },
        { status: 500 },
      );
    }

    // Subscribe to form
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        tags: Array.isArray(tags) ? tags : undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "ConvertKit subscribe failed.", details: data },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}