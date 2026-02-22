import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahesh College Counseling | 1:1 College Mentorship",
  description:
    "Selective 1:1 mentorship for high-achieving students. Essays, extracurricular strategy, Common App, and college planning.",
  keywords: [
    "college counseling mentorship",
    "1:1 college advisor",
    "college application help",
    "Ross Michigan admissions",
    "college essay coaching",
  ],
  openGraph: {
    title: "Mahesh College Counseling | 1:1 College Mentorship",
    description:
      "Selective 1:1 mentorship for high-achieving students. Essays, extracurricular strategy, Common App, and college planning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body className="antialiased min-h-screen bg-[#0a0a0a] text-white font-serif">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
