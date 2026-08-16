"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown, Download, Mail, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useI18n } from "@/lib/i18n";

interface HeroData {
  greeting: string;
  title_line1: string;
  title_highlight: string;
  title_line2: string;
  description: string;
  availability_badge: string;
  location: string;
  role: string;
  skills: string[];
  profile_image: string;
  greeting_en: string;
  description_en: string;
  cv_url: string;
}

const defaultHero: HeroData = {
  greeting: "HELLO, SAYA FADLAN 👋",
  title_line1: "I BUILD BOLD",
  title_highlight: "DIGITAL",
  title_line2: "THINGS.",
  description: "Full-stack developer yang mengubah ide kompleks menjadi produk digital yang cepat, jelas, dan memorable.",
  availability_badge: "OPEN TO WORK — JAKARTA, ID",
  location: "// Yogyakarta, INDONESIA",
  role: "Senior Full-Stack Engineer",
  skills: ["React / Next.js", "TypeScript", "Node.js"],
  profile_image: "/profile.JPG",
  greeting_en: "HELLO, I'M FADLAN 👋",
  description_en: "Full-stack developer turning complex ideas into fast, clear, and memorable digital products.",
  cv_url: "",
};

const SKILL_COLORS = [
  "bg-[#86EFAC]",
  "bg-[#FDE047]",
  "bg-[#C084FC]",
  "bg-[#60A5FA]",
  "bg-[#F472B6]",
];

export const Hero: React.FC = () => {
  const [hero, setHero] = useState<HeroData>(defaultHero);
  const { lang, t } = useI18n();

  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setHero(data);
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  const greeting = lang === "en" && hero.greeting_en ? hero.greeting_en : hero.greeting;
  const description = lang === "en" && hero.description_en ? hero.description_en : hero.description;

  return (
    <section id="about" className="relative py-16 md:py-24 bg-[#FEFBF6] bg-grid-pattern overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text & Actions */}
          <div className="lg:col-span-7 flex flex-col gap-6 items-start">
            {/* Availability Badge */}
            <Badge variant="green" className="py-1.5 px-3.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] animate-pulse" />
              {hero.availability_badge}
            </Badge>

            {/* Eyebrow */}
            <p className="font-mono text-sm md:text-base font-extrabold text-[#1A1A1A]">
              {greeting}
            </p>

            {/* Main Title */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-[#1A1A1A] tracking-tight uppercase">
              {hero.title_line1} <br />
              <span className="bg-[#FDE047] px-2 border-3 border-[#1A1A1A] shadow-brutal inline-block rotate-[-1deg]">
                {hero.title_highlight}
              </span>{" "}
              {hero.title_line2}
            </h1>

            {/* Description */}
            <p className="font-sans text-lg md:text-xl font-medium text-[#1A1A1A] leading-relaxed max-w-2xl">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#projects">
                <Button variant="primary" size="lg">
                  {t("hero.view_projects")} <ArrowDown className="w-5 h-5" />
                </Button>
              </a>
              {hero.cv_url ? (
                <a href={hero.cv_url} target="_blank" rel="noreferrer">
                  <Button variant="white" size="lg">
                    {t("hero.download_cv")} <Download className="w-5 h-5" />
                  </Button>
                </a>
              ) : (
                <Button
                  variant="white"
                  size="lg"
                  onClick={() => alert("File CV belum di-upload oleh Admin.")}
                >
                  {t("hero.download_cv")} <Download className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 pt-4">
              <a href="https://github.com/FadlanBM" target="_blank" rel="noreferrer">
                <Badge variant="blue" className="hover:scale-105 transition-transform cursor-pointer py-1 px-3">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GITHUB
                </Badge>
              </a>
              <a href="https://www.linkedin.com/in/fadlandev" target="_blank" rel="noreferrer">
                <Badge variant="blue" className="hover:scale-105 transition-transform cursor-pointer py-1 px-3">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LINKEDIN
                </Badge>
              </a>
              <a href="mailto:fadlanbuwono@gmail.com">
                <Badge variant="blue" className="hover:scale-105 transition-transform cursor-pointer py-1 px-3">
                  <Mail className="w-4 h-4" /> EMAIL
                </Badge>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Portrait Composition with Neobrutalism Layering */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-[4/5]">
              {/* Hard Offset Shadow Frame */}
              <div className="absolute inset-0 bg-[#1A1A1A] rounded-2xl transform translate-x-4 translate-y-4" />

              {/* Main Photo Card */}
              <div className="relative w-full h-full bg-[#60A5FA] border-4 border-[#1A1A1A] rounded-2xl overflow-hidden flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <Badge variant="yellow" className="text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> {t("hero.developer_creator")}
                  </Badge>
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-[#FDE047] flex items-center justify-center font-display text-sm">
                    ★
                  </div>
                </div>

                {/* Developer Profile Photo Card */}
                <div className="my-auto relative bg-[#FEFBF6] border-3 border-[#1A1A1A] rounded-xl shadow-brutal overflow-hidden">
                  <img
                    src={hero.profile_image}
                    alt="Profile Photo"
                    className="w-full aspect-[3/4] object-cover scale-110"
                  />
                  {/* Overlay info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#FEFBF6]/90 backdrop-blur-sm border-t-3 border-[#1A1A1A] px-4 py-3 text-center">
                    <p className="font-mono text-xs text-[#1A1A1A] font-bold">
                      {hero.role}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-h-20 overflow-y-auto py-0.5 px-1">
                      {hero.skills.map((skill, i) => (
                        <span
                          key={skill}
                          className={`px-2 py-0.5 ${SKILL_COLORS[i % SKILL_COLORS.length]} border-2 border-[#1A1A1A] font-mono text-[10px] font-bold rounded whitespace-nowrap`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="font-mono text-xs font-bold text-[#1A1A1A] text-right mt-2">
                  {hero.location}
                </p>
              </div>

              {/* Code + Craft Floating Sticker */}
              <div className="absolute -bottom-6 -left-6 bg-[#FDE047] border-3 border-[#1A1A1A] rounded-xl px-5 py-3 shadow-brutal-lg rotate-[-4deg] animate-bounce-subtle">
                <p className="font-mono text-sm font-black text-[#1A1A1A] flex items-center gap-1.5">
                  <span className="text-lg">⚡</span> {"{ CODE + CRAFT }"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};