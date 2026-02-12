import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formatío",
  description: "Tools For Christian Education",
  openGraph: {
    title: "Formatío",
    description: "Tools For Christian Education",
    url: "https://Formatio.church",
    siteName: "Formatío",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Formatío – Tools For Christian Education",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formatío",
    description: "Tools For Christian Education",
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
