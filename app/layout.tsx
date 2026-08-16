import type { Metadata } from "next";
import { Anton, Inter, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fadlan Buwono Mukti — Full-Stack Developer & Creative Coder",
  description: "Portfolio digital Fadlan Buwono Mukti, Full-stack developer yang mengubah ide kompleks menjadi produk digital yang cepat, jelas, dan memorable.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${anton.variable} ${inter.variable} ${ibmPlexMono.variable} scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FEFBF6] text-[#1A1A1A] selection:bg-[#FDE047] selection:text-[#1A1A1A]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

