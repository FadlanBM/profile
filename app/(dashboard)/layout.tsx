import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Admin — Fadlan Buwono Mukti",
  // Admin and login must never be indexed.
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${fontVariables} scroll-smooth h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FEFBF6] text-[#1A1A1A]">
        {children}
      </body>
    </html>
  );
}
