"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X, Globe } from "lucide-react";
import { Button } from "./ui/Button";
import { useI18n } from "@/lib/i18n";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const { lang, setLang, t } = useI18n();

  const navLinks = [
    { label: t("nav.tentang"), id: "about", href: "#about" },
    { label: t("nav.proyek"), id: "projects", href: "#projects" },
    { label: t("nav.pengalaman"), id: "experience", href: "#experience" },
    { label: t("nav.kontak"), id: "contact", href: "#contact" },
  ];

  useEffect(() => {
    const sectionIds = ["about", "projects", "experience", "contact"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          return;
        }
      }
      setActiveSection(sectionIds[0]);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = () => {
    setLang(lang === "id" ? "en" : "id");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FDE047] border-b-4 border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Wordmark */}
        <a
          href="#"
          className="font-display text-3xl tracking-wider text-[#1A1A1A] hover:text-[#1A1A1A]/80 transition-colors"
        >
          FADLAN.DEV
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-3">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`px-4 py-2 border-2 border-[#1A1A1A] rounded-md font-mono text-xs font-bold uppercase transition-all shadow-brutal-sm ${
                activeSection === link.id
                  ? "bg-[#1A1A1A] text-[#FDE047]"
                  : "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#FEFBF6]"
              }`}
            >
              {link.label}
            </a>
          ))}

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="ml-2 px-3 py-2 border-2 border-[#1A1A1A] rounded-md bg-[#FFFFFF] font-mono text-xs font-bold uppercase text-[#1A1A1A] hover:bg-[#FEFBF6] transition-all shadow-brutal-sm flex items-center gap-1.5 cursor-pointer"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "id" ? "EN" : "ID"}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 border-2 border-[#1A1A1A] rounded-md bg-[#FFFFFF] shadow-brutal-sm cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDE047] border-b-4 border-[#1A1A1A] px-6 py-6 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 border-2 border-[#1A1A1A] rounded-md font-mono text-sm font-bold uppercase transition-all shadow-brutal-sm ${
                activeSection === link.id
                  ? "bg-[#1A1A1A] text-[#FDE047]"
                  : "bg-[#FFFFFF] text-[#1A1A1A]"
              }`}
            >
              {link.label}
            </a>
          ))}
          {/* Mobile Lang Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#1A1A1A] rounded-md bg-[#FFFFFF] font-mono text-sm font-bold uppercase text-[#1A1A1A] shadow-brutal-sm cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            {lang === "id" ? "English" : "Bahasa Indonesia"}
          </button>
        </div>
      )}
    </header>
  );
};