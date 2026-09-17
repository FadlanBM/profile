"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit3, LogOut, ArrowLeft, FolderGit2, Briefcase, 
  Check, X, Star, ExternalLink, Sparkles, User, Award, Upload, Image as ImageIcon, Tag
} from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  title_en?: string;
  description_en?: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  color: string;
  description_en?: string;
  period_en?: string;
}

interface Category {
  id: string;
  name: string;
  name_en: string;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issued_date: string;
  description: string;
  image_url: string;
  credential_url: string;
  title_en?: string;
  description_en?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"projects" | "experiences" | "hero" | "certificates" | "categories">("projects");

  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Project Modal State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    category: "WEB APP",
    description: "",
    tagsStr: "",
    color: "bg-[#E0F2FE]",
    demoUrl: "",
    githubUrl: "",
    featured: false,
    title_en: "",
    description_en: "",
  });

  // Experience Modal State
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [expForm, setExpForm] = useState({
    role: "",
    company: "",
    period: "",
    description: "",
    skillsStr: "",
    color: "bg-[#FDE047]",
    description_en: "",
    period_en: "",
  });

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [certForm, setCertForm] = useState({
    title: "",
    issuer: "",
    issued_date: "",
    description: "",
    image_url: "",
    credential_url: "",
    title_en: "",
    description_en: "",
  });

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    name_en: "",
  });

  // Hero State
  const [heroData, setHeroData] = useState({
    greeting: "",
    title_line1: "",
    title_highlight: "",
    title_line2: "",
    description: "",
    availability_badge: "",
    location: "",
    role: "",
    skillsStr: "",
    profile_image: "/profile.JPG",
    greeting_en: "",
    description_en: "",
    cv_url: "",
  });
  const [heroLoaded, setHeroLoaded] = useState(false);

  const fetchData = async () => {
    const [projRes, expRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/experiences"),
    ]);

    if (projRes.ok) setProjects(await projRes.json());
    if (expRes.ok) setExperiences(await expRes.json());

    // Fetch certificates data
    const certRes = await fetch("/api/certificates");
    if (certRes.ok) setCertificates(await certRes.json());

    // Fetch categories data
    const catRes = await fetch("/api/categories");
    if (catRes.ok) setCategories(await catRes.json());

    // Fetch hero data
    const heroRes = await fetch("/api/hero");
    if (heroRes.ok) {
      const hero = await heroRes.json();
      if (!hero.error) {
        setHeroData({
          greeting: hero.greeting || "",
          title_line1: hero.title_line1 || "",
          title_highlight: hero.title_highlight || "",
          title_line2: hero.title_line2 || "",
          description: hero.description || "",
          availability_badge: hero.availability_badge || "",
          location: hero.location || "",
          role: hero.role || "",
          skillsStr: Array.isArray(hero.skills) ? hero.skills.join(", ") : "",
          profile_image: hero.profile_image || "/profile.JPG",
          greeting_en: hero.greeting_en || "",
          description_en: hero.description_en || "",
          cv_url: hero.cv_url || "",
        });
      }
    }
    setHeroLoaded(true);
  };

  // Verify Auth on Mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setAuthenticated(true);
          fetchData();
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // --- PROJECT CRUD ---
  const openProjectModal = (p?: Project) => {
    if (p) {
      setEditingProject(p);
      setProjectForm({
        title: p.title,
        category: p.category,
        description: p.description,
        tagsStr: p.tags.join(", "),
        color: p.color,
        demoUrl: p.demoUrl,
        githubUrl: p.githubUrl,
        featured: p.featured,
        title_en: p.title_en || "",
        description_en: p.description_en || "",
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: "",
        category: "WEB APP",
        description: "",
        tagsStr: "",
        color: "bg-[#E0F2FE]",
        demoUrl: "",
        githubUrl: "",
        featured: false,
        title_en: "",
        description_en: "",
      });
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = projectForm.tagsStr.split(",").map((t) => t.trim()).filter(Boolean);

    const payload = {
      id: editingProject?.id,
      title: projectForm.title,
      category: projectForm.category,
      description: projectForm.description,
      tags,
      color: projectForm.color,
      demoUrl: projectForm.demoUrl,
      githubUrl: projectForm.githubUrl,
      featured: projectForm.featured,
      title_en: projectForm.title_en,
      description_en: projectForm.description_en,
    };

    const method = editingProject ? "PUT" : "POST";
    const res = await fetch("/api/projects", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setProjectModalOpen(false);
      fetchData();
    } else {
      alert("Gagal menyimpan proyek");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Yakin ingin menghapus proyek ini?")) return;
    const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  // --- EXPERIENCE CRUD ---
  const openExpModal = (e?: Experience) => {
    if (e) {
      setEditingExp(e);
      setExpForm({
        role: e.role,
        company: e.company,
        period: e.period,
        description: e.description,
        skillsStr: e.skills.join(", "),
        color: e.color,
        description_en: e.description_en || "",
        period_en: e.period_en || "",
      });
    } else {
      setEditingExp(null);
      setExpForm({
        role: "",
        company: "",
        period: "",
        description: "",
        skillsStr: "",
        color: "bg-[#FDE047]",
        description_en: "",
        period_en: "",
      });
    }
    setExpModalOpen(true);
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = expForm.skillsStr.split(",").map((s) => s.trim()).filter(Boolean);

    const payload = {
      id: editingExp?.id,
      role: expForm.role,
      company: expForm.company,
      period: expForm.period,
      description: expForm.description,
      skills,
      color: expForm.color,
      description_en: expForm.description_en,
      period_en: expForm.period_en,
    };
    const method = editingExp ? "PUT" : "POST";
    const res = await fetch("/api/experiences", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setExpModalOpen(false);
      fetchData();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal menyimpan pengalaman");
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengalaman kerja ini?")) return;
    const res = await fetch(`/api/experiences?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal menghapus pengalaman kerja");
    }
  };

  // --- CERTIFICATE CRUD ---
  const openCertModal = (c?: Certificate) => {
    if (c) {
      setEditingCert(c);
      setCertForm({
        title: c.title,
        issuer: c.issuer,
        issued_date: c.issued_date || "",
        description: c.description || "",
        image_url: c.image_url || "",
        credential_url: c.credential_url || "",
        title_en: c.title_en || "",
        description_en: c.description_en || "",
      });
    } else {
      setEditingCert(null);
      setCertForm({
        title: "",
        issuer: "",
        issued_date: "",
        description: "",
        image_url: "",
        credential_url: "",
        title_en: "",
        description_en: "",
      });
    }
    setCertModalOpen(true);
  };

  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setCertForm({ ...certForm, image_url: data.url });
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal mengupload gambar.");
    }
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.image_url) {
      alert("Silakan upload gambar sertifikat terlebih dahulu.");
      return;
    }

    const payload = {
      id: editingCert?.id,
      title: certForm.title,
      issuer: certForm.issuer,
      issued_date: certForm.issued_date,
      description: certForm.description,
      image_url: certForm.image_url,
      credential_url: certForm.credential_url,
      title_en: certForm.title_en,
      description_en: certForm.description_en,
    };

    const method = editingCert ? "PUT" : "POST";
    const res = await fetch("/api/certificates", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setCertModalOpen(false);
      fetchData();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal menyimpan sertifikat");
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm("Yakin ingin menghapus sertifikat ini?")) return;
    const res = await fetch(`/api/certificates?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  // --- CATEGORY CRUD ---
  const openCatModal = (c?: Category) => {
    if (c) {
      setEditingCat(c);
      setCatForm({ name: c.name, name_en: c.name_en || "" });
    } else {
      setEditingCat(null);
      setCatForm({ name: "", name_en: "" });
    }
    setCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: editingCat?.id,
      name: catForm.name,
      name_en: catForm.name_en,
    };

    const method = editingCat ? "PUT" : "POST";
    const res = await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setCatModalOpen(false);
      fetchData();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal menyimpan kategori");
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal menghapus kategori");
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setHeroData({ ...heroData, cv_url: data.url });
      alert("CV berhasil diupload! Jangan lupa klik SIMPAN HERO.");
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal mengupload CV.");
    }
  };

  const handleSaveHero = async () => {
    if (!confirm("Yakin ingin menyimpan perubahan data Hero?")) return;
    const skills = heroData.skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        greeting: heroData.greeting,
        title_line1: heroData.title_line1,
        title_highlight: heroData.title_highlight,
        title_line2: heroData.title_line2,
        description: heroData.description,
        availability_badge: heroData.availability_badge,
        location: heroData.location,
        role: heroData.role,
        skills,
        profile_image: heroData.profile_image,
        greeting_en: heroData.greeting_en,
        description_en: heroData.description_en,
        cv_url: heroData.cv_url,
      }),
    });

    if (res.ok) {
      alert("Hero section berhasil disimpan!");
      fetchData();
    } else {
      alert("Gagal menyimpan hero section.");
    }
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#FEFBF6] flex items-center justify-center p-6 font-mono font-bold">
        Memverifikasi Sesi Admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFBF6] bg-grid-pattern pb-16">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A] text-[#FEFBF6] border-b-4 border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-xs font-bold bg-[#FDE047] text-[#1A1A1A] px-3 py-1.5 rounded border-2 border-white shadow-brutal-sm hover:scale-105 transition-transform flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> LIHAT PORTFOLIO
            </Link>
            <h1 className="font-display text-2xl tracking-wide hidden sm:block">
              ADMIN DASHBOARD
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="green" className="text-xs py-1 px-3">
              <Sparkles className="w-3.5 h-3.5" /> LOGGED IN AS ADMIN
            </Badge>
            <Button variant="primary" size="sm" onClick={handleLogout}>
              LOGOUT <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-6 py-3 border-3 border-[#1A1A1A] rounded-lg font-display text-lg tracking-wide shadow-brutal cursor-pointer transition-all ${
              activeTab === "projects"
                ? "bg-[#FDE047] text-[#1A1A1A] translate-x-1 translate-y-1 shadow-none"
                : "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#E0F2FE]"
            }`}
          >
            <FolderGit2 className="w-5 h-5" /> KELOLA PROYEK ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab("experiences")}
            className={`flex items-center gap-2 px-6 py-3 border-3 border-[#1A1A1A] rounded-lg font-display text-lg tracking-wide shadow-brutal cursor-pointer transition-all ${
              activeTab === "experiences"
                ? "bg-[#F472B6] text-[#1A1A1A] translate-x-1 translate-y-1 shadow-none"
                : "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#E0F2FE]"
            }`}
          >
            <Briefcase className="w-5 h-5" /> KELOLA PENGALAMAN ({experiences.length})
          </button>

          <button
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-2 px-6 py-3 border-3 border-[#1A1A1A] rounded-lg font-display text-lg tracking-wide shadow-brutal cursor-pointer transition-all ${
              activeTab === "hero"
                ? "bg-[#60A5FA] text-[#1A1A1A] translate-x-1 translate-y-1 shadow-none"
                : "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#E0F2FE]"
            }`}
          >
            <User className="w-5 h-5" /> EDIT HERO SECTION
          </button>

          <button
            onClick={() => setActiveTab("certificates")}
            className={`flex items-center gap-2 px-6 py-3 border-3 border-[#1A1A1A] rounded-lg font-display text-lg tracking-wide shadow-brutal cursor-pointer transition-all ${
              activeTab === "certificates"
                ? "bg-[#C084FC] text-[#1A1A1A] translate-x-1 translate-y-1 shadow-none"
                : "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#E0F2FE]"
            }`}
          >
            <Award className="w-5 h-5" /> KELOLA SERTIFIKAT ({certificates.length})
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-6 py-3 border-3 border-[#1A1A1A] rounded-lg font-display text-lg tracking-wide shadow-brutal cursor-pointer transition-all ${
              activeTab === "categories"
                ? "bg-[#86EFAC] text-[#1A1A1A] translate-x-1 translate-y-1 shadow-none"
                : "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#E0F2FE]"
            }`}
          >
            <Tag className="w-5 h-5" /> KELOLA KATEGORI ({categories.length})
          </button>
        </div>

        {/* TAB 1: PROJECTS */}
        {activeTab === "projects" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl text-[#1A1A1A] uppercase">
                DAFTAR PROYEK PORTFOLIO
              </h2>
              <Button variant="secondary" size="md" onClick={() => openProjectModal()}>
                <Plus className="w-5 h-5" /> TAMBAH PROYEK BARU
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <Card key={p.id} bgColor={p.color} shadowSize="lg" className="flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="white" className="text-[10px]">
                        {p.category}
                      </Badge>
                      {p.featured && (
                        <span className="flex items-center gap-1 font-mono text-xs font-bold bg-[#1A1A1A] text-[#FDE047] px-2 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-[#FDE047]" /> FEATURED
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl text-[#1A1A1A] mb-2">{p.title}</h3>
                    <p className="font-sans text-sm font-medium text-[#1A1A1A] mb-4">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#1A1A1A] font-mono text-[10px] font-bold rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#1A1A1A]/20">
                    <Button variant="white" size="sm" onClick={() => openProjectModal(p)}>
                      <Edit3 className="w-4 h-4" /> EDIT
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleDeleteProject(p.id)}>
                      <Trash2 className="w-4 h-4" /> HAPUS
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EXPERIENCES */}
        {activeTab === "experiences" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl text-[#1A1A1A] uppercase">
                DAFTAR PENGALAMAN KERJA
              </h2>
              <Button variant="primary" size="md" onClick={() => openExpModal()}>
                <Plus className="w-5 h-5" /> TAMBAH PENGALAMAN BARU
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              {experiences.map((e) => (
                <Card key={e.id} bgColor={e.color} shadowSize="md">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <h3 className="font-display text-2xl text-[#1A1A1A]">
                      {e.role} <span className="font-sans text-base text-[#1A1A1A]/80 font-bold">@ {e.company}</span>
                    </h3>
                    <Badge variant="dark" className="text-xs">{e.period}</Badge>
                  </div>
                  <p className="font-sans text-sm font-medium text-[#1A1A1A] mb-4">{e.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {e.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#1A1A1A] font-mono text-xs font-bold rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#1A1A1A]/20">
                    <Button variant="white" size="sm" onClick={() => openExpModal(e)}>
                      <Edit3 className="w-4 h-4" /> EDIT
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleDeleteExp(e.id)}>
                      <Trash2 className="w-4 h-4" /> HAPUS
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CERTIFICATES */}
        {activeTab === "certificates" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl text-[#1A1A1A] uppercase">
                DAFTAR SERTIFIKAT
              </h2>
              <Button variant="secondary" size="md" onClick={() => openCertModal()}>
                <Plus className="w-5 h-5" /> TAMBAH SERTIFIKAT BARU
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((c) => (
                <Card key={c.id} bgColor="bg-[#FFFFFF]" shadowSize="lg" className="flex flex-col justify-between">
                  <div className="flex gap-4">
                    <div className="w-28 h-28 shrink-0 bg-[#F3F4F6] border-2 border-[#1A1A1A] rounded-lg overflow-hidden">
                      <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl text-[#1A1A1A] mb-1 truncate">{c.title}</h3>
                      <p className="font-mono text-xs font-semibold text-[#60A5FA] mb-1">{c.issuer}</p>
                      {c.issued_date && (
                        <p className="font-mono text-xs text-[#9CA3AF] mb-2">{c.issued_date}</p>
                      )}
                      <p className="font-sans text-sm text-[#1A1A1A] line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#1A1A1A]/20 mt-4">
                    <Button variant="white" size="sm" onClick={() => openCertModal(c)}>
                      <Edit3 className="w-4 h-4" /> EDIT
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleDeleteCert(c.id)}>
                      <Trash2 className="w-4 h-4" /> HAPUS
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORIES */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl text-[#1A1A1A] uppercase">
                DAFTAR KATEGORI PROYEK
              </h2>
              <Button variant="secondary" size="md" onClick={() => openCatModal()}>
                <Plus className="w-5 h-5" /> TAMBAH KATEGORI BARU
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((c) => (
                <Card key={c.id} bgColor="bg-[#FFFFFF]" shadowSize="md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-xl text-[#1A1A1A] truncate">{c.name}</h3>
                      {c.name_en && (
                        <p className="font-mono text-xs text-[#60A5FA] mt-0.5">{c.name_en}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="white" size="sm" onClick={() => openCatModal(c)}>
                        <Edit3 className="w-4 h-4" /> EDIT
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleDeleteCat(c.id)}>
                        <Trash2 className="w-4 h-4" /> HAPUS
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* PROJECT MODAL */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4 overflow-y-auto">
          <Card bgColor="bg-[#FFFFFF]" shadowSize="xl" className="max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center border-b-3 border-[#1A1A1A] pb-3 mb-6">
              <h3 className="font-display text-2xl text-[#1A1A1A]">
                {editingProject ? "EDIT PROYEK" : "TAMBAH PROYEK BARU"}
              </h3>
              <button onClick={() => setProjectModalOpen(false)} className="p-1 border-2 border-[#1A1A1A] rounded bg-[#FDE047]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">JUDUL PROYEK *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">JUDUL (ENGLISH)</label>
                  <input
                    type="text"
                    value={projectForm.title_en}
                    onChange={(e) => setProjectForm({ ...projectForm, title_en: e.target.value })}
                    className="px-3 py-2 border-2 border-[#60A5FA] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">KATEGORI *</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">DESKRIPSI *</label>
                <textarea
                  required
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">DESKRIPSI (ENGLISH)</label>
                <textarea
                  rows={3}
                  value={projectForm.description_en}
                  onChange={(e) => setProjectForm({ ...projectForm, description_en: e.target.value })}
                  className="px-3 py-2 border-2 border-[#60A5FA] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">TAGS / TECH STACK (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Next.js, React, TailwindCSS"
                  value={projectForm.tagsStr}
                  onChange={(e) => setProjectForm({ ...projectForm, tagsStr: e.target.value })}
                  className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">DEMO URL</label>
                  <input
                    type="url"
                    placeholder="https://demo.com"
                    value={projectForm.demoUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">GITHUB REPO URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/user/repo"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">WARNA KARTU</label>
                  <select
                    value={projectForm.color}
                    onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  >
                    <option value="bg-[#E0F2FE]">Blue Pastel (#E0F2FE)</option>
                    <option value="bg-[#FDE047]">Yellow (#FDE047)</option>
                    <option value="bg-[#F472B6]">Pink (#F472B6)</option>
                    <option value="bg-[#86EFAC]">Green (#86EFAC)</option>
                    <option value="bg-[#C084FC]">Purple (#C084FC)</option>
                    <option value="bg-[#FFFFFF]">White (#FFFFFF)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={projectForm.featured}
                    onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    className="w-5 h-5 accent-[#1A1A1A]"
                  />
                  <label htmlFor="featured" className="font-mono text-xs font-bold uppercase cursor-pointer">
                    TAMPILKAN SEBAGAI FEATURED ⭐
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#1A1A1A]/20">
                <Button variant="white" size="md" type="button" onClick={() => setProjectModalOpen(false)}>
                  BATAL
                </Button>
                <Button variant="secondary" size="md" type="submit">
                  SIMPAN PROYEK <Check className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EXPERIENCE MODAL */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4 overflow-y-auto">
          <Card bgColor="bg-[#FFFFFF]" shadowSize="xl" className="max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center border-b-3 border-[#1A1A1A] pb-3 mb-6">
              <h3 className="font-display text-2xl text-[#1A1A1A]">
                {editingExp ? "EDIT PENGALAMAN KERJA" : "TAMBAH PENGALAMAN KERJA BARU"}
              </h3>
              <button onClick={() => setExpModalOpen(false)} className="p-1 border-2 border-[#1A1A1A] rounded bg-[#FDE047]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">ROLE / POSISI *</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Full-Stack Engineer"
                    value={expForm.role}
                    onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">PERUSAHAAN / ORGANISASI *</label>
                  <input
                    type="text"
                    required
                    placeholder="TechNova Studio"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">PERIODE KERJA *</label>
                  <input
                    type="text"
                    required
                    placeholder="2024 — SEKARANG"
                    value={expForm.period}
                    onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">PERIODE KERJA (ENGLISH)</label>
                  <input
                    type="text"
                    placeholder="2024 — PRESENT"
                    value={expForm.period_en}
                    onChange={(e) => setExpForm({ ...expForm, period_en: e.target.value })}
                    className="px-3 py-2 border-2 border-[#60A5FA] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">WARNA KARTU</label>
                  <select
                    value={expForm.color}
                    onChange={(e) => setExpForm({ ...expForm, color: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  >
                    <option value="bg-[#FDE047]">Yellow (#FDE047)</option>
                    <option value="bg-[#F472B6]">Pink (#F472B6)</option>
                    <option value="bg-[#60A5FA]">Blue (#60A5FA)</option>
                    <option value="bg-[#86EFAC]">Green (#86EFAC)</option>
                    <option value="bg-[#C084FC]">Purple (#C084FC)</option>
                    <option value="bg-[#FFFFFF]">White (#FFFFFF)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">DESKRIPSI TUGAS & PRESTASI</label>
                <textarea
                  rows={3}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">DESKRIPSI (ENGLISH)</label>
                <textarea
                  rows={3}
                  value={expForm.description_en}
                  onChange={(e) => setExpForm({ ...expForm, description_en: e.target.value })}
                  className="px-3 py-2 border-2 border-[#60A5FA] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">SKILLS / TEKNOLOGI (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Next.js, React, Node.js, Docker"
                  value={expForm.skillsStr}
                  onChange={(e) => setExpForm({ ...expForm, skillsStr: e.target.value })}
                  className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#1A1A1A]/20">
                <Button variant="white" size="md" type="button" onClick={() => setExpModalOpen(false)}>
                  BATAL
                </Button>
                <Button variant="primary" size="md" type="submit">
                  SIMPAN PENGALAMAN <Check className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4 overflow-y-auto">
          <Card bgColor="bg-[#FFFFFF]" shadowSize="xl" className="max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center border-b-3 border-[#1A1A1A] pb-3 mb-6">
              <h3 className="font-display text-2xl text-[#1A1A1A]">
                {editingCert ? "EDIT SERTIFIKAT" : "TAMBAH SERTIFIKAT BARU"}
              </h3>
              <button onClick={() => setCertModalOpen(false)} className="p-1 border-2 border-[#1A1A1A] rounded bg-[#FDE047]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">NAMA SERTIFIKAT *</label>
                  <input
                    type="text"
                    required
                    placeholder="AWS Certified Solutions Architect"
                    value={certForm.title}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">NAMA (ENGLISH)</label>
                  <input
                    type="text"
                    value={certForm.title_en}
                    onChange={(e) => setCertForm({ ...certForm, title_en: e.target.value })}
                    className="px-3 py-2 border-2 border-[#60A5FA] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">PENERBIT / ISSUER *</label>
                  <input
                    type="text"
                    required
                    placeholder="Amazon Web Services"
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">TANGGAL TERBIT</label>
                  <input
                    type="text"
                    placeholder="2024-06"
                    value={certForm.issued_date}
                    onChange={(e) => setCertForm({ ...certForm, issued_date: e.target.value })}
                    className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">DESKRIPSI</label>
                <textarea
                  rows={3}
                  value={certForm.description}
                  onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                  className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">DESKRIPSI (ENGLISH)</label>
                <textarea
                  rows={2}
                  value={certForm.description_en}
                  onChange={(e) => setCertForm({ ...certForm, description_en: e.target.value })}
                  className="px-3 py-2 border-2 border-[#60A5FA] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">GAMBAR SERTIFIKAT *</label>
                <div className="flex items-center gap-4">
                  {certForm.image_url ? (
                    <img src={certForm.image_url} alt="Preview" className="w-24 h-20 object-cover border-2 border-[#1A1A1A] rounded" />
                  ) : (
                    <div className="w-24 h-20 bg-[#F3F4F6] border-2 border-dashed border-[#1A1A1A] rounded flex items-center justify-center text-[#9CA3AF]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs font-bold text-[#1A1A1A] bg-[#E0F2FE] border-2 border-[#1A1A1A] rounded px-3 py-2 hover:bg-[#BFDBFE] transition-colors">
                    <Upload className="w-3.5 h-3.5" /> UPLOAD GAMBAR
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCertImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">CREDENTIAL / VERIFIKASI URL</label>
                <input
                  type="url"
                  placeholder="https://credential.com/verify/12345"
                  value={certForm.credential_url}
                  onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                  className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#1A1A1A]/20">
                <Button variant="white" size="md" type="button" onClick={() => setCertModalOpen(false)}>
                  BATAL
                </Button>
                <Button variant="secondary" size="md" type="submit">
                  SIMPAN SERTIFIKAT <Check className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4 overflow-y-auto">
          <Card bgColor="bg-[#FFFFFF]" shadowSize="xl" className="max-w-xl w-full p-6 my-8">
            <div className="flex justify-between items-center border-b-3 border-[#1A1A1A] pb-3 mb-6">
              <h3 className="font-display text-2xl text-[#1A1A1A]">
                {editingCat ? "EDIT KATEGORI" : "TAMBAH KATEGORI BARU"}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="p-1 border-2 border-[#1A1A1A] rounded bg-[#FDE047]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">NAMA KATEGORI *</label>
                <input
                  type="text"
                  required
                  placeholder="WEB APP"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="px-3 py-2 border-2 border-[#1A1A1A] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">NAMA (ENGLISH)</label>
                <input
                  type="text"
                  placeholder="WEB APP"
                  value={catForm.name_en}
                  onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })}
                  className="px-3 py-2 border-2 border-[#60A5FA] rounded font-sans text-sm bg-[#FEFBF6]"
                />
              </div>

              <p className="font-mono text-xs text-[#9CA3AF]">
                Mengubah nama kategori akan otomatis memperbarui kategori semua proyek yang menggunakannya.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#1A1A1A]/20">
                <Button variant="white" size="md" type="button" onClick={() => setCatModalOpen(false)}>
                  BATAL
                </Button>
                <Button variant="secondary" size="md" type="submit">
                  SIMPAN KATEGORI <Check className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 3: HERO SECTION */}
      {activeTab === "hero" && heroLoaded && (
        <Card bgColor="bg-[#FFFFFF]" shadowSize="xl" className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#60A5FA] border-3 border-[#1A1A1A] rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A]">EDIT HERO SECTION</h2>
              <p className="font-mono text-xs text-[#1A1A1A]/70">
                Ubah teks greeting, judul, deskripsi, lokasi, role, skills, dan foto profil
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">GREETING</label>
                <input
                  type="text"
                  value={heroData.greeting}
                  onChange={(e) => setHeroData({ ...heroData, greeting: e.target.value })}
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">GREETING (ENGLISH)</label>
                <input
                  type="text"
                  value={heroData.greeting_en}
                  onChange={(e) => setHeroData({ ...heroData, greeting_en: e.target.value })}
                  className="px-4 py-2.5 border-3 border-[#60A5FA] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">TITLE LINE 1</label>
                  <input
                    type="text"
                    value={heroData.title_line1}
                    onChange={(e) => setHeroData({ ...heroData, title_line1: e.target.value })}
                    className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs font-bold uppercase">HIGHLIGHT</label>
                  <input
                    type="text"
                    value={heroData.title_highlight}
                    onChange={(e) => setHeroData({ ...heroData, title_highlight: e.target.value })}
                    className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">TITLE LINE 2</label>
                <input
                  type="text"
                  value={heroData.title_line2}
                  onChange={(e) => setHeroData({ ...heroData, title_line2: e.target.value })}
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">DESKRIPSI</label>
                <textarea
                  value={heroData.description}
                  onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                  rows={3}
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-sans text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold text-[#60A5FA] uppercase">DESKRIPSI (ENGLISH)</label>
                <textarea
                  value={heroData.description_en}
                  onChange={(e) => setHeroData({ ...heroData, description_en: e.target.value })}
                  rows={3}
                  className="px-4 py-2.5 border-3 border-[#60A5FA] rounded-md font-sans text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">AVAILABILITY BADGE</label>
                <input
                  type="text"
                  value={heroData.availability_badge}
                  onChange={(e) => setHeroData({ ...heroData, availability_badge: e.target.value })}
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">LOKASI</label>
                <input
                  type="text"
                  value={heroData.location}
                  onChange={(e) => setHeroData({ ...heroData, location: e.target.value })}
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">ROLE</label>
                <input
                  type="text"
                  value={heroData.role}
                  onChange={(e) => setHeroData({ ...heroData, role: e.target.value })}
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">SKILLS (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={heroData.skillsStr}
                  onChange={(e) => setHeroData({ ...heroData, skillsStr: e.target.value })}
                  placeholder="React / Next.js, TypeScript, Node.js"
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs font-bold uppercase">PROFILE IMAGE PATH</label>
                <input
                  type="text"
                  value={heroData.profile_image}
                  onChange={(e) => setHeroData({ ...heroData, profile_image: e.target.value })}
                  className="px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] shadow-brutal-sm"
                />
              </div>

              {/* CV Upload */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs font-bold uppercase">CV / RESUME (PDF)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs font-bold text-[#1A1A1A] bg-[#E0F2FE] border-2 border-[#1A1A1A] rounded px-3 py-2 hover:bg-[#BFDBFE] transition-colors">
                    <Upload className="w-3.5 h-3.5" /> UPLOAD PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleCvUpload}
                    />
                  </label>
                  {heroData.cv_url && (
                    <a
                      href={heroData.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs font-bold text-[#60A5FA] underline hover:text-[#3B82F6] truncate max-w-[220px]"
                    >
                      LIHAT CV
                    </a>
                  )}
                </div>
                {heroData.cv_url && (
                  <p className="font-mono text-[10px] text-[#1A1A1A]/60 break-all">{heroData.cv_url}</p>
                )}
              </div>

              {/* Preview */}
              <div className="bg-[#FEFBF6] border-3 border-[#1A1A1A] rounded-lg p-4 shadow-brutal-sm mt-2">
                <p className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]/60 mb-2">PREVIEW SKILLS:</p>
                <div className="flex flex-wrap gap-2">
                  {heroData.skillsStr
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill, i) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-[#86EFAC] border-2 border-[#1A1A1A] font-mono text-[10px] font-bold rounded"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t-3 border-[#1A1A1A]/20">
            <Button variant="white" size="md" onClick={() => fetchData()}>
              RESET
            </Button>
            <Button variant="primary" size="lg" onClick={handleSaveHero}>
              SIMPAN HERO <Check className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
