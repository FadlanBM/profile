import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Ticker } from "./components/Ticker";
import { ProjectsSection } from "./components/ProjectsSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { CertificatesSection } from "./components/CertificatesSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFBF6]">
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
