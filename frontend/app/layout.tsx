import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/app/components/layout/AppShell";

export const metadata: Metadata = {
  title: "ShadowTrace • Blockchain Forensics & Intelligence",
  description:
    "Real-time cryptocurrency fraud investigation, transaction intelligence graph, fund flow tracing, and investigator-ready evidence reporting.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
