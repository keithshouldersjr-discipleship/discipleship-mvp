import { fetchBlueprintById } from "@/lib/blueprint-repo";
import { pdf } from "@react-pdf/renderer";
import { buildBlueprintPdfDocument } from "@/lib/pdf/blueprint-pdf";
import type { Blueprint } from "@/lib/schema";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PdfInstance = {
  toBlob: () => Promise<Blob>;
};

function sanitizeFilePart(value: string | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "") // remove weird characters
    .replace(/\s+/g, "-"); // spaces → dashes
}

function buildPdfFileName(blueprint: Blueprint): string {
  const group = sanitizeFilePart(blueprint.header?.preparedFor?.groupName);
  const role = sanitizeFilePart(blueprint.header?.role);
  const title = sanitizeFilePart(blueprint.header?.title);

  return (
    [
      "Discipleship-by-Design",
      group,
      role,
      title, // include title (optional but nice)
      "Blueprint",
    ]
      .filter(Boolean)
      .join("_") + ".pdf"
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

    // ✅ AUTH GATE: require sign-in for PDF downloads only
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Next.js cookies API (object form)
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

 /*  if (!data.user) {
    // send user to sign-in, then back to this PDF route
    const url = new URL("/sign-in", _req.url);
    url.searchParams.set("next", `/api/blueprint/${id}/pdf`);
    return NextResponse.redirect(url);
  } */

  // Guard bad routes like /pdf/undefined
  if (!id || id === "undefined") {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const blueprint = await fetchBlueprintById(id);
  if (!blueprint) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const doc = buildBlueprintPdfDocument(blueprint);

  // ✅ Reliable bytes path: toBlob() -> arrayBuffer()
  const instance = pdf(doc) as unknown as PdfInstance;
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    return new Response(
      JSON.stringify({ error: "PDF renderer returned 0 bytes." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const filename = buildPdfFileName(blueprint);

  // ✅ Return the bytes directly
  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}