import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageProvider, type Language } from "@/lib/i18n";
import { isLanguage, LANGUAGES } from "@/lib/languages";
import { getDictionary } from "@/lib/dictionary";
import { SITE_URL } from "@/lib/site";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLanguage(lang)) return {};
  const dict = getDictionary(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: dict.meta.title,
    description: dict.meta.description,
    authors: [{ name: dict.meta.author }],
    // Canonical + hreflang: marks these as language variants of one page
    // instead of duplicate content, and lets crawlers pick per-user language.
    alternates: {
      canonical: `/${lang}`,
      languages: {
        id: "/id",
        en: "/en",
        "x-default": "/id",
      },
    },
    openGraph: {
      type: "website",
      url: `/${lang}`,
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: dict.meta.author,
      locale: lang === "id" ? "id_ID" : "en_US",
      alternateLocale: lang === "id" ? "en_US" : "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();

  return (
    <html lang={lang} className={`${fontVariables} scroll-smooth h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FEFBF6] text-[#1A1A1A] selection:bg-[#FDE047] selection:text-[#1A1A1A]">
        <LanguageProvider lang={lang as Language}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
