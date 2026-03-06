import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export const metadata: Metadata = {
  title: "WikipIA - Générateur de questions",
  description:
    "Une application pour générer des questions à partir de thèmes donnés, avec une touche d'humour et une erreur volontaire pour stimuler la réflexion.",
  creator: "Vinny Momo, " + "Maxime Marme, " + "Mathieu",
  publisher: "Vinny Momo, " + "Maxime Marme, " + "Mathieu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(canonicalUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WikipIA - Générateur de questions",
    description:
      "Une application pour générer des questions à partir de thèmes donnés, avec une touche d'humour et une erreur volontaire pour stimuler la réflexion.",
    url: canonicalUrl,
    siteName: "WikipIA - Générateur de questions",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: `${canonicalUrl}/screenshot.png`,
        width: 1200,
        height: 630,
        alt: "WikipIA - Générateur de questions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WikipIA - Générateur de questions",
    description:
      "Une application pour générer des questions à partir de thèmes donnés, avec une touche d'humour et une erreur volontaire pour stimuler la réflexion.",
    images: [`${canonicalUrl}/screenshot.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
      </head>
      <body className={`${montserrat.variable} antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
