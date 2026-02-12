import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formatio",
  description: "Intelligent formation design for the local church.",
  openGraph: {
    title: "Formatio",
    description: "Intelligent formation design for the local church.",
    url: "https://formatio.church",
    siteName: "Formatio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Formatio – Architecting Discipleship",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formatio",
    description: "Intelligent formation design for the local church.",
    images: ["/og-image.png"],
  },
};