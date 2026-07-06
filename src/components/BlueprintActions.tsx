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
    a.download = "Blueprint-Lesson-Plan.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/intake"
        className="dbd-btn dbd-btn-secondary min-h-0 py-2"
      >
        New blueprint
      </a>

      <button
        type="button"
        onClick={handleDownloadPdf}
        className="dbd-btn dbd-btn-gold min-h-0 py-2"
      >
        Download PDF
      </button>
    </div>
  );
}
