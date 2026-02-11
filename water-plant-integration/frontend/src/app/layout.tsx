import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScadaHeader from "@/components/ScadaHeader";

export const metadata: Metadata = {
  title: "Plant integration | SCADA, WIMS, CMMS, E-Log",
  description: "One screen for SCADA, WIMS, CMMS, and E-Logs. Review once, approve, data syncs everywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen flex flex-col bg-[var(--bg-canvas)]">
        <ThemeProvider>
          <ScadaHeader />
          <main className="flex-1 w-full px-4 md:px-6 py-4 md:py-6 max-w-[1400px] mx-auto">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
