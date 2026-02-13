import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discipleship By Design",
  description: "Discipleship By Design",
  openGraph: {
    title: "Discipleship By Design",
    description: "Discipleship By Design",
    url: "https://Discipleship.design",
    siteName: "Discipleship By Design",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Discipleship By Design – Discipleship By Design",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discipleship By Design",
    description: "Discipleship By Design",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
