"use client";

import { useRouter } from "next/navigation";

export function BlueprintActions({ blueprintId }: { blueprintId: string }) {
  const router = useRouter();

  function handleDownloadPdf() {
    const email =
      typeof window !== "undefined" ? localStorage.getItem("dbd_email") : null;

    const nextUrl = `/blueprints/${blueprintId}`;
    const pdfUrl = `/api/blueprint/${blueprintId}/pdf`;

    // If we don't have email yet -> go to email gate first
    if (!email) {
      router.push(
        `/email-gate?next=${encodeURIComponent(nextUrl)}&pdf=${encodeURIComponent(
          pdfUrl,
        )}`,
      );
      return;
    }

    // If email exists -> download directly without leaving page (desktop),
    // and with navigation (mobile) for reliability.
    downloadPdfSmart(pdfUrl);
  }

  async function downloadPdfSmart(pdfUrl: string) {
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Mobile: simplest + most reliable
    if (isMobile) {
      window.location.href = pdfUrl;
      return;
    }

    // Desktop: fetch -> blob -> download (keeps them on the blueprint page)
    const res = await fetch(pdfUrl);
    if (!res.ok) {
      // fallback: still try navigation if fetch download fails
      window.location.href = pdfUrl;
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    // Let server filename win if possible; if not, browser uses this.
    a.download = "Discipleship-by-Design-Blueprint.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/intake"
        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07] transition"
      >
        New blueprint
      </a>

      <button
        type="button"
        onClick={handleDownloadPdf}
        className="rounded-full bg-[#C6A75E] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition"
      >
        Download PDF
      </button>
    </div>
  );
}
