import { fetchPlaybookById } from "@/lib/playbook-repo";
import { pdf } from "@react-pdf/renderer";
import { buildPlaybookPdfDocument } from "../../../../../lib/pdf/playbook-pdf";

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

  const playbook = await fetchPlaybookById(id);
  if (!playbook) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const doc = buildPlaybookPdfDocument(playbook);

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
    playbook.header.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() ||
    "playbook";

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="formatio-${filenameSafe}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}