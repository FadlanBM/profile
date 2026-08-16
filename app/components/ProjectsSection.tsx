"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Code2, FolderGit2, Star, Loader2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useI18n } from "@/lib/i18n";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
  demoUrl: string;
  githubUrl: string;
  featured?: boolean;
  title_en?: string;
  description_en?: string;
}

interface Category {
  id: string;
  name: string;
  name_en: string;
}

export const ProjectsSection: React.FC = () => {
  const [filter, setFilter] = useState<string>("ALL");
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { lang, t } = useI18n();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.map((c: Category) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  const filteredProjects = filter === "ALL"
    ? projects
    : projects.filter(p => p.category === filter);

  const getTitle = (p: Project) => lang === "en" && p.title_en ? p.title_en : p.title;
  const getDesc = (p: Project) => lang === "en" && p.description_en ? p.description_en : p.description;

  return (
    <section id="projects" className="py-20 bg-[#FEFBF6] border-b-4 border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant="pink" className="mb-3">
              <FolderGit2 className="w-3.5 h-3.5" /> {t("projects.header_badge")}
            </Badge>
            <h2 className="font-display text-4xl md:text-6xl text-[#1A1A1A] uppercase tracking-tight">
              {t("projects.heading")}
            </h2>
          </div>
          <p className="font-sans text-base font-medium text-[#1A1A1A] max-w-md">
            {t("projects.subtitle")}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 border-2 border-[#1A1A1A] rounded-md font-mono text-xs font-bold transition-all shadow-brutal-sm cursor-pointer ${
                filter === cat
                  ? "bg-[#1A1A1A] text-[#FEFBF6]"
                  : "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#FDE047]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (  
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FDE047] border-3 border-[#1A1A1A] shadow-brutal flex items-center justify-center mb-4">
              <FolderGit2 className="w-8 h-8 text-[#1A1A1A]" />
            </div>
            <p className="font-display text-2xl text-[#1A1A1A] uppercase tracking-tight max-w-md">
              {projects.length === 0 ? t("projects.empty") : t("projects.empty_filtered")}
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                bgColor={project.color}
                shadowSize="lg"
                className="flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="white" className="text-[10px]">
                      {project.category}
                    </Badge>
                    {project.featured && (
                      <span className="flex items-center gap-1 font-mono text-xs font-bold bg-[#1A1A1A] text-[#FDE047] px-2 py-0.5 rounded border border-[#1A1A1A]">
                        <Star className="w-3 h-3 fill-[#FDE047]" /> {t("projects.featured")}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-3xl text-[#1A1A1A] mb-3">
                    {getTitle(project)}
                  </h3>
                  <p className="font-sans text-sm font-medium text-[#1A1A1A] mb-6 leading-relaxed">
                    {getDesc(project)}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-[#FFFFFF] border-2 border-[#1A1A1A] font-mono text-xs font-bold rounded shadow-brutal-sm text-[#1A1A1A]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-[#1A1A1A]/20">
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="dark" size="sm" className="w-full">
                      {t("projects.demo_live")} <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    <Button variant="white" size="sm">
                      <Code2 className="w-3.5 h-3.5" /> {t("projects.code")}
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};