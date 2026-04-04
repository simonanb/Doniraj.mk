import type { Metadata } from "next";
import { Montserrat, Amatic_SC, Neucha } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});

const amaticSC = Amatic_SC({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-amatic-sc",
  display: "swap",
});

// Cyrillic fallback — Neucha has native Cyrillic support
const neucha = Neucha({
  weight: ["400"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-neucha",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Донирај.мк",
  description: "Бесплатна платформа за донации во Македонија",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mk" className={`${montserrat.variable} ${amaticSC.variable} ${neucha.variable}`}>
      <body style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif", background: "#FFF9F0", margin: 0 }}>
        {children}
        <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
