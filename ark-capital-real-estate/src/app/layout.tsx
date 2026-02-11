import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, EB_Garamond } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-hero",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARK Capital Real Estate | Southern California",
  description:
    "Acquisition and repositioning of single-family and multifamily properties across Southern California. Unlocking value, improving communities, and creating long-term growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${sourceSans.variable} ${ebGaramond.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
