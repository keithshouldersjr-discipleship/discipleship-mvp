import { fetchBlueprintById } from "@/lib/blueprint-repo";
import { pdf } from "@react-pdf/renderer";
import { buildBlueprintPdfDocument } from "../../../../../lib/pdf/blueprint-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PdfInstance = {
  toBlob: () => Promise<Blob>;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const blueprint = await fetchBlueprintById(id);
  if (!blueprint) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const doc = buildBlueprintPdfDocument(blueprint);

  // ✅ Use toBlob() → arrayBuffer() (most reliable)
  const instance = pdf(doc) as unknown as PdfInstance;
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();

  // Hard guard: never return a “blank” PDF file
  if (arrayBuffer.byteLength === 0) {
    return new Response(
      JSON.stringify({ error: "PDF renderer returned 0 bytes." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const filenameSafe =
    blueprint.header.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() ||
    "blueprint";

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="formatio-${filenameSafe}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}