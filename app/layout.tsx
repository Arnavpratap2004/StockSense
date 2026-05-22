import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/SessionProvider";
import ToastProvider from "@/components/providers/ToastProvider";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StockSense — Stock Maintenance System",
  description:
    "Precision inventory management system for tracking stock, transactions, and generating reports.",
  keywords: ["inventory", "stock management", "SMS", "StockSense"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${ibmPlexMono.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
