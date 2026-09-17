import { getDb, COLLECTIONS } from "./firebase";
import type { Timestamp } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  title_en: string;
  description_en: string;
  createdAt: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  color: string;
  description_en: string;
  period_en: string;
  createdAt: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issued_date: string;
  description: string;
  image_url: string;
  credential_url: string;
  title_en: string;
  description_en: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  name_en: string;
  createdAt: number;
}

export interface Hero {
  id: string;
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

// ---------------------------------------------------------------------------
// Default seed data
// ---------------------------------------------------------------------------

const DEFAULT_HERO: Hero = {
  id: "main",
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

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "WEB APP", name_en: "WEB APP", createdAt: Date.now() },
  { id: "2", name: "AI / SAAS", name_en: "AI / SAAS", createdAt: Date.now() },
  { id: "3", name: "MOBILE / HYBRID", name_en: "MOBILE / HYBRID", createdAt: Date.now() },
  { id: "4", name: "PRODUCTIVITY", name_en: "PRODUCTIVITY", createdAt: Date.now() },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "1",
    title: "FinTech Dashboard Pro",
    category: "WEB APP",
    description: "Platform analitik keuangan real-time dengan chart interaktif, ekspor laporan otomatis, dan manajemen aset terenkripsi.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "Recharts"],
    color: "bg-[#E0F2FE]",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
    title_en: "FinTech Dashboard Pro",
    description_en: "Real-time financial analytics platform with interactive charts, automated report exports, and encrypted asset management.",
    createdAt: Date.now() - 3000,
  },
  {
    id: "2",
    title: "AI Commerce Engine",
    category: "AI / SAAS",
    description: "Sistem e-commerce berbasis AI dengan rekomendasi produk cerdas, integrasi payment gateway, dan manajemen stok otomatis.",
    tags: ["React", "Node.js", "OpenAI API", "PostgreSQL"],
    color: "bg-[#FDE047]",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
    title_en: "AI Commerce Engine",
    description_en: "AI-powered e-commerce system with intelligent product recommendations, payment gateway integration, and automated stock management.",
    createdAt: Date.now() - 2000,
  },
  {
    id: "3",
    title: "Pulse Social Community",
    category: "MOBILE / HYBRID",
    description: "Aplikasi komunitas developer dengan diskusi real-time, sharing snippet kode, dan sistem badge reputasi.",
    tags: ["React Native", "Firebase", "Tailwind", "Zustand"],
    color: "bg-[#F472B6]",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: false,
    title_en: "Pulse Social Community",
    description_en: "Developer community app with real-time discussions, code snippet sharing, and a reputation badge system.",
    createdAt: Date.now() - 1000,
  },
  {
    id: "4",
    title: "TaskCraft Workflow Studio",
    category: "PRODUCTIVITY",
    description: "Visual kanban & board manajemen proyek dengan fitur otomasi alur kerja dan integrasi webhook.",
    tags: ["Next.js", "Prisma", "TailwindCSS", "TRPC"],
    color: "bg-[#86EFAC]",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: false,
    title_en: "TaskCraft Workflow Studio",
    description_en: "Visual kanban & project management board with workflow automation and webhook integration.",
    createdAt: Date.now(),
  },
];

const DEFAULT_EXPERIENCES: Experience[] = [
  {
    id: "1",
    role: "Senior Full-Stack Engineer",
    company: "TechNova Studio",
    period: "2024 — SEKARANG",
    description: "Memimpin pengembangan web app skalabel berbasis Next.js & Microservices, meningkatkan performa sistem sebesar 40% dan mengelola tim 5 developer.",
    skills: ["Next.js 16", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    color: "bg-[#FDE047]",
    description_en: "Led the development of scalable web apps using Next.js & Microservices, improved system performance by 40% and managed a team of 5 developers.",
    period_en: "2024 — PRESENT",
    createdAt: Date.now() - 2000,
  },
  {
    id: "2",
    role: "Frontend Developer",
    company: "PixelCraft Agency",
    period: "2022 — 2024",
    description: "Mengembangkan lebih dari 20+ landing page dan web portal interaktif dengan animasi kustom, responsive design, dan skor Lighthouse 95+.",
    skills: ["React", "TailwindCSS", "Framer Motion", "GraphQL"],
    color: "bg-[#F472B6]",
    description_en: "Developed 20+ landing pages and interactive web portals with custom animations, responsive design, and 95+ Lighthouse scores.",
    period_en: "2022 — 2024",
    createdAt: Date.now() - 1000,
  },
  {
    id: "3",
    role: "Junior Web Developer",
    company: "Solusi Digital ID",
    period: "2021 — 2022",
    description: "Membangun REST API dan modul admin dashboard untuk sistem manajemen persediaan e-commerce.",
    skills: ["JavaScript", "Express.js", "MongoDB", "CSS Modules"],
    color: "bg-[#60A5FA]",
    description_en: "Built REST APIs and admin dashboard modules for an e-commerce inventory management system.",
    period_en: "2021 — 2022",
    createdAt: Date.now(),
  },
];

const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: "1",
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    issued_date: "2024-06",
    description: "Sertifikasi arsitektur solusi cloud AWS tingkat associate.",
    image_url: "/profile.JPG",
    credential_url: "https://aws.amazon.com/certification/",
    title_en: "AWS Certified Solutions Architect",
    description_en: "Associate-level AWS cloud solutions architecture certification.",
    createdAt: Date.now() - 1000,
  },
  {
    id: "2",
    title: "Google UX Design Professional",
    issuer: "Google / Coursera",
    issued_date: "2023-12",
    description: "Sertifikasi desain UX profesional dari Google.",
    image_url: "/profile.JPG",
    credential_url: "https://coursera.org/",
    title_en: "Google UX Design Professional",
    description_en: "Professional UX design certification from Google.",
    createdAt: Date.now(),
  },
];

// ---------------------------------------------------------------------------
// Seed Functions
// ---------------------------------------------------------------------------

async function seedHero(): Promise<void> {
  const db = getDb();
  const heroRef = db.collection(COLLECTIONS.HERO).doc("main");
  const doc = await heroRef.get();

  if (!doc.exists) {
    await heroRef.set(DEFAULT_HERO);
    console.log("✅ Seeded default hero data");
  }
}

async function seedCategories(): Promise<void> {
  const db = getDb();
  const snapshot = await db.collection(COLLECTIONS.CATEGORIES).limit(1).get();

  if (snapshot.empty) {
    const batch = db.batch();
    for (const cat of DEFAULT_CATEGORIES) {
      const ref = db.collection(COLLECTIONS.CATEGORIES).doc(cat.id);
      batch.set(ref, cat);
    }
    await batch.commit();
    console.log("✅ Seeded default categories");
  }
}

async function seedProjects(): Promise<void> {
  const db = getDb();
  const snapshot = await db.collection(COLLECTIONS.PROJECTS).limit(1).get();

  if (snapshot.empty) {
    const batch = db.batch();
    for (const project of DEFAULT_PROJECTS) {
      const ref = db.collection(COLLECTIONS.PROJECTS).doc(project.id);
      batch.set(ref, project);
    }
    await batch.commit();
    console.log("✅ Seeded default projects");
  }
}

async function seedExperiences(): Promise<void> {
  const db = getDb();
  const snapshot = await db.collection(COLLECTIONS.EXPERIENCES).limit(1).get();

  if (snapshot.empty) {
    const batch = db.batch();
    for (const exp of DEFAULT_EXPERIENCES) {
      const ref = db.collection(COLLECTIONS.EXPERIENCES).doc(exp.id);
      batch.set(ref, exp);
    }
    await batch.commit();
    console.log("✅ Seeded default experiences");
  }
}

async function seedCertificates(): Promise<void> {
  const db = getDb();
  const snapshot = await db.collection(COLLECTIONS.CERTIFICATES).limit(1).get();

  if (snapshot.empty) {
    const batch = db.batch();
    for (const cert of DEFAULT_CERTIFICATES) {
      const ref = db.collection(COLLECTIONS.CERTIFICATES).doc(cert.id);
      batch.set(ref, cert);
    }
    await batch.commit();
    console.log("✅ Seeded default certificates");
  }
}

// ---------------------------------------------------------------------------
// Init Database
// ---------------------------------------------------------------------------

let initPromise: Promise<void> | null = null;

/**
 * Initialize Firestore with seed data if collections are empty.
 * Should be called at least once during app startup.
 */
export async function initDB(): Promise<void> {
  await Promise.all([
    seedHero(),
    seedCategories(),
    seedProjects(),
    seedExperiences(),
    seedCertificates(),
  ]);
}

/**
 * Ensure database is initialized (singleton pattern).
 */
export function ensureDB(): Promise<void> {
  if (!initPromise) {
    initPromise = initDB();
  }
  return initPromise;
}

// Re-export types
export type { Timestamp };
