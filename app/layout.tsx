import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-nunito",
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
    <html lang="mk" className={nunito.variable}>
      <body style={{ fontFamily: "var(--font-nunito), sans-serif", background: "#FFF9F0", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
