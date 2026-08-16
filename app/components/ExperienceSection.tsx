"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Code2, Award, Terminal } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { useI18n } from "@/lib/i18n";

interface Experience {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  color: string;
  description_en?: string;
  period_en?: string;
}

export const ExperienceSection: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { lang, t } = useI18n();

  useEffect(() => {
    fetch("/api/experiences")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExperiences(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const techStack = [
    { name: t("techstack.frontend"), items: ["React", "Next.js", "TypeScript", "TailwindCSS", "HTML5/CSS3"] },
    { name: t("techstack.backend"), items: ["Node.js", "Express", "PostgreSQL", "Prisma", "REST & GraphQL"] },
    { name: t("techstack.tools"), items: ["Git", "Docker", "Vercel", "Jest", "CI/CD Pipelines"] },
  ];

  const getDesc = (e: Experience) => lang === "en" && e.description_en ? e.description_en : e.description;
  const getPeriod = (e: Experience) => lang === "en" && e.period_en ? e.period_en : e.period;

  return (
    <section id="experience" className="py-20 bg-[#E0F2FE] border-b-4 border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Work Experience Timeline */}
          <div className="lg:col-span-7">
            <Badge variant="yellow" className="mb-3">
              <Briefcase className="w-3.5 h-3.5" /> {t("experience.header_badge")}
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl text-[#1A1A1A] uppercase tracking-tight mb-8">
              {t("experience.heading")}
            </h2>

            <div className="flex flex-col gap-6">
              {experiences.map((exp, i) => (
                <Card key={i} bgColor={exp.color} shadowSize="md" className="relative">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <h3 className="font-display text-2xl text-[#1A1A1A]">
                      {exp.role} <span className="font-sans text-lg text-[#1A1A1A]/80 font-bold">@ {exp.company}</span>
                    </h3>
                    <Badge variant="dark" className="text-[10px]">
                      {getPeriod(exp)}
                    </Badge>
                  </div>
                  <p className="font-sans text-sm font-medium text-[#1A1A1A] mb-4 leading-relaxed">
                    {getDesc(exp)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-[#FFFFFF] border-2 border-[#1A1A1A] font-mono text-[11px] font-bold rounded shadow-brutal-sm text-[#1A1A1A]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column: Tech Stack & Skillset */}
          <div className="lg:col-span-5">
            <Badge variant="purple" className="mb-3">
              <Code2 className="w-3.5 h-3.5" /> {t("experience.skills_badge")}
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl text-[#1A1A1A] uppercase tracking-tight mb-8">
              {t("experience.skills_heading")}
            </h2>

            <div className="flex flex-col gap-6">
              {techStack.map((category, i) => (
                <Card key={i} bgColor="bg-[#FFFFFF]" shadowSize="md">
                  <h3 className="font-display text-xl text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#F472B6]" /> {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <Badge key={item} variant="yellow" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}

              {/* Achievement Highlight */}
              <div className="bg-[#86EFAC] border-3 border-[#1A1A1A] rounded-lg p-6 shadow-brutal flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-[#FDE047] flex items-center justify-center font-display text-2xl shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display text-lg text-[#1A1A1A]">{t("experience.excellence_title")}</h4>
                  <p className="font-sans text-xs font-bold text-[#1A1A1A]">
                    {t("experience.excellence_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};