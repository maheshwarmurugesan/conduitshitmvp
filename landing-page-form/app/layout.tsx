import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mahesh Waran Murugesan | Join the network",
  description: "Personal site — share your details to join the network and get invited to events.",
  metadataBase: new URL("https://maheshwarmurugesan.com"),
  openGraph: {
    title: "Mahesh Waran Murugesan | Join the network",
    description: "Share your details to join the network and get invited to events.",
    url: "https://maheshwarmurugesan.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahesh Waran Murugesan | Join the network",
    description: "Share your details to join the network and get invited to events.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${shareTechMono.variable} ${jetbrainsMono.variable} antialiased scanlines bg-grid min-h-screen`}
      >
        <div className="tv-static tv-flicker min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
