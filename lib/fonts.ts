import { Anton, Inter, IBM_Plex_Mono } from "next/font/google";

export const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const fontVariables = `${anton.variable} ${inter.variable} ${ibmPlexMono.variable}`;
