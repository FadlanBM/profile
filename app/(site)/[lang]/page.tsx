import { Navbar } from "@/app/components/Navbar";
import { Hero } from "@/app/components/Hero";
import { Ticker } from "@/app/components/Ticker";
import { ProjectsSection } from "@/app/components/ProjectsSection";
import { ExperienceSection } from "@/app/components/ExperienceSection";
import { ContactSection } from "@/app/components/ContactSection";
import { Footer } from "@/app/components/Footer";
import { CertificatesSection } from "@/app/components/CertificatesSection";
import { JsonLd } from "@/app/components/JsonLd";
import { getDictionary } from "@/lib/dictionary";
import { isLanguage, type Language } from "@/lib/languages";
import { notFound } from "next/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFBF6]">
      <JsonLd lang={lang as Language} dict={dict} />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Ticker />
        <ProjectsSection />
        <ExperienceSection />
        <CertificatesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
