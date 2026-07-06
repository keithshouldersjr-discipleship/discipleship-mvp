import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blueprint.discipleship.design"),
  title: "Blueprint | Discipleship by Design",
  description:
    "Blueprint is a lesson builder from Discipleship by Design for creating intentional discipleship lessons.",
  openGraph: {
    title: "Blueprint | Discipleship by Design",
    description:
      "Design clear, purposeful discipleship lessons with Blueprint.",
    url: "https://blueprint.discipleship.design",
    siteName: "Discipleship by Design",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blueprint by Discipleship by Design",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blueprint | Discipleship by Design",
    description:
      "Design clear, purposeful discipleship lessons with Blueprint.",
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
