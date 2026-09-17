"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isLanguage, DEFAULT_LANGUAGE, type Language } from "./languages";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { Language };
export { LANGUAGES, DEFAULT_LANGUAGE, isLanguage } from "./languages";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

// ---------------------------------------------------------------------------
// Translation dictionaries
// ---------------------------------------------------------------------------

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "nav.tentang": { id: "TENTANG", en: "ABOUT" },
  "nav.proyek": { id: "PROYEK", en: "PROJECTS" },
  "nav.pengalaman": { id: "PENGALAMAN", en: "EXPERIENCE" },
  "nav.kontak": { id: "KONTAK", en: "CONTACT" },

  // Hero
  "hero.view_projects": { id: "LIHAT PROYEK", en: "VIEW PROJECTS" },
  "hero.download_cv": { id: "DOWNLOAD CV", en: "DOWNLOAD CV" },
  "hero.developer_creator": { id: "DEVELOPER & CREATOR", en: "DEVELOPER & CREATOR" },

  // Projects
  "projects.header_badge": { id: "PORTFOLIO PROYEK", en: "PROJECT PORTFOLIO" },
  "projects.heading": { id: "PROYEK PILIHAN", en: "SELECTED PROJECTS" },
  "projects.subtitle": { id: "Kumpulan aplikasi dan produk digital yang saya rancang dan kembangkan dengan fokus pada performa dan UX.", en: "A collection of apps and digital products I designed and built with a focus on performance and UX." },
  "projects.demo_live": { id: "DEMO LIVE", en: "LIVE DEMO" },
  "projects.code": { id: "CODE", en: "CODE" },
  "projects.featured": { id: "FEATURED", en: "FEATURED" },
  "projects.empty": { id: "BELUM ADA PROYEK", en: "NO PROJECTS YET" },
  "projects.empty_filtered": { id: "Tidak ada proyek pada kategori ini.", en: "No projects in this category." },
  "projects.all": { id: "SEMUA", en: "ALL" },

  // Experience
  "experience.header_badge": { id: "REKAM JEJAK", en: "TRACK RECORD" },
  "experience.heading": { id: "PENGALAMAN KERJA", en: "WORK EXPERIENCE" },
  "experience.skills_badge": { id: "KEAHLIAN", en: "SKILLS" },
  "experience.skills_heading": { id: "TECH STACK", en: "TECH STACK" },
  "experience.excellence_title": { id: "COMMITTED TO EXCELLENCE", en: "COMMITTED TO EXCELLENCE" },
  "experience.excellence_desc": { id: "Selalu menerapkan best practice, koding berstandar tinggi, dan arsitektur modular yang mudah di-maintain.", en: "Always applying best practices, high-standard coding, and modular architecture that's easy to maintain." },

  // Contact
  "contact.header_badge": { id: "HUBUNGI SAYA", en: "GET IN TOUCH" },
  "contact.heading": { id: "MARI BEKERJASAMA!", en: "LET'S WORK TOGETHER!" },
  "contact.desc": { id: "Punya ide proyek menarik, butuh bantuan konsultasi pengembangan web, atau ingin merekrut saya ke dalam tim Anda? Jangan ragu untuk mengirim pesan!", en: "Have an interesting project idea, need web development consulting, or want to recruit me to your team? Don't hesitate to send a message!" },
  "contact.email_label": { id: "EMAIL", en: "EMAIL" },
  "contact.location_label": { id: "LOKASI", en: "LOCATION" },
  "contact.location_value": { id: "Yogyakarta, Indonesia (WFA / Remote Ready)", en: "Yogyakarta, Indonesia (WFA / Remote Ready)" },
  "contact.form_title": { id: "FORMULIR KONTAK", en: "CONTACT FORM" },
  "contact.name_label": { id: "NAMA LENGKAP *", en: "FULL NAME *" },
  "contact.name_placeholder": { id: "Masukkan nama Anda...", en: "Enter your name..." },
  "contact.email_form_label": { id: "ALAMAT EMAIL *", en: "EMAIL ADDRESS *" },
  "contact.email_placeholder": { id: "nama@email.com", en: "name@email.com" },
  "contact.message_label": { id: "PESAN / RENCANA PROYEK *", en: "MESSAGE / PROJECT PLAN *" },
  "contact.message_placeholder": { id: "Ceritakan detail proyek atau pesan Anda...", en: "Tell me about your project or message..." },
  "contact.submit": { id: "KIRIM PESAN SEKARANG", en: "SEND MESSAGE NOW" },
  "contact.sending": { id: "MENGIRIM...", en: "SENDING..." },
  "contact.thanks_title": { id: "TERIMA KASIH!", en: "THANK YOU!" },
  "contact.thanks_desc": { id: "Pesan Anda telah berhasil dikirim. Saya akan menghubungi Anda dalam waktu 24 jam.", en: "Your message has been sent successfully. I'll get back to you within 24 hours." },
  "contact.send_another": { id: "KIRIM PESAN LAIN", en: "SEND ANOTHER MESSAGE" },

  // Footer
  "footer.made_with": { id: "MADE WITH", en: "MADE WITH" },
  "footer.in_Yogyakarta": { id: "IN Yogyakarta", en: "IN Yogyakarta" },
  "footer.built_with": { id: "Built with Next.js & Neobrutalism UI.", en: "Built with Next.js & Neobrutalism UI." },
  "footer.back_to_top": { id: "KEMBALI KE ATAS", en: "BACK TO TOP" },

  // Ticker
  "ticker.fullstack": { id: "FULL-STACK DEVELOPER", en: "FULL-STACK DEVELOPER" },
  "ticker.creative": { id: "CREATIVE CODER", en: "CREATIVE CODER" },
  "ticker.problem_solver": { id: "PROBLEM SOLVER", en: "PROBLEM SOLVER" },
  "ticker.open_collab": { id: "OPEN FOR COLLABORATION", en: "OPEN FOR COLLABORATION" },
  "ticker.nextjs_expert": { id: "NEXT.JS & REACT EXPERT", en: "NEXT.JS & REACT EXPERT" },
  "ticker.uiux_enthusiast": { id: "UI/UX ENTHUSIAST", en: "UI/UX ENTHUSIAST" },

  // Tech Stack section labels
  "techstack.frontend": { id: "Frontend", en: "Frontend" },
  "techstack.backend": { id: "Backend", en: "Backend" },
  "techstack.tools": { id: "Tools & DevOps", en: "Tools & DevOps" },

  // Certificates
  "certificates.badge": { id: "SERTIFIKAT", en: "CERTIFICATES" },
  "certificates.heading": { id: "SERTIFIKASI & PENGHARGAAN", en: "CERTIFICATIONS & AWARDS" },
  "certificates.verify": { id: "VERIFIKASI", en: "VERIFY" },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANGUAGE,
  setLang: () => { },
  t: (key) => key,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function LanguageProvider({
  lang,
  children,
}: {
  lang: Language;
  children: React.ReactNode;
}) {
  const router = useRouter();
  // The language is sourced from the URL so every locale has its own crawlable
  // address (SEO). `setLang` navigates rather than mutating local state.
  const setLang = useCallback((next: Language) => {
    if (typeof window === "undefined" || next === lang) return;
    const { pathname, search, hash } = window.location;
    const segments = pathname.split("/").filter(Boolean);
    const rest = isLanguage(segments[0]) ? segments.slice(1) : segments;
    const target = `/${next}${rest.length ? `/${rest.join("/")}` : ""}${search}${hash}`;
    router.push(target);
  }, [lang, router]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const entry = translations[key];
      if (!entry) return fallback ?? key;
      return entry[lang] ?? fallback ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useI18n() {
  return useContext(LanguageContext);
}
