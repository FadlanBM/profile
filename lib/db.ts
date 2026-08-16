import { createClient, type Client } from "@libsql/client";
import path from "path";
import fs from "fs";

// Turso (remote) configuration — used when deploying to Vercel.
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

// Local SQLite file fallback — used during local development.
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const localDbPath = path.join(dataDir, "portfolio.db").replace(/\\/g, "/");

export const db: Client = TURSO_URL
  ? createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })
  : createClient({ url: `file:${localDbPath}` });

// Initialize Database Schemas (idempotent).
export async function initDB() {
  // Create Projects Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL,
      color TEXT NOT NULL,
      demoUrl TEXT NOT NULL,
      githubUrl TEXT NOT NULL,
      featured INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      title_en TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT ''
    );
  `);

  // Create Experiences Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      skills TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      description_en TEXT NOT NULL DEFAULT '',
      period_en TEXT NOT NULL DEFAULT ''
    );
  `);

  // Create Hero Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS hero (
      id INTEGER PRIMARY KEY DEFAULT 1,
      greeting TEXT NOT NULL,
      title_line1 TEXT NOT NULL,
      title_highlight TEXT NOT NULL,
      title_line2 TEXT NOT NULL,
      description TEXT NOT NULL,
      availability_badge TEXT NOT NULL,
      location TEXT NOT NULL,
      role TEXT NOT NULL,
      skills TEXT NOT NULL,
      profile_image TEXT NOT NULL DEFAULT '/profile.JPG',
      greeting_en TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      cv_url TEXT NOT NULL DEFAULT ''
    );
  `);

  // Auto-migration: ensure cv_url column exists in hero table if created previously
  try {
    await db.execute("ALTER TABLE hero ADD COLUMN cv_url TEXT NOT NULL DEFAULT ''");
  } catch {
    // Column already exists
  }

  // Create Certificates Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issued_date TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      credential_url TEXT NOT NULL DEFAULT '',
      title_en TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL
    );
  `);

  // Create Categories Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      name_en TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL
    );
  `);

  // Seed default Categories if empty
  const catCount = (await db.execute("SELECT COUNT(*) as count FROM categories")).rows[0] as unknown as { count: number };
  if ((catCount?.count ?? 0) === 0) {
    const now = Date.now();
    await db.batch([
      { sql: "INSERT INTO categories (id, name, name_en, createdAt) VALUES (?, ?, ?, ?)", args: ["1", "WEB APP", "WEB APP", now] },
      { sql: "INSERT INTO categories (id, name, name_en, createdAt) VALUES (?, ?, ?, ?)", args: ["2", "AI / SAAS", "AI / SAAS", now] },
      { sql: "INSERT INTO categories (id, name, name_en, createdAt) VALUES (?, ?, ?, ?)", args: ["3", "MOBILE / HYBRID", "MOBILE / HYBRID", now] },
      { sql: "INSERT INTO categories (id, name, name_en, createdAt) VALUES (?, ?, ?, ?)", args: ["4", "PRODUCTIVITY", "PRODUCTIVITY", now] },
    ]);
  }

  // Seed default Projects if empty
  const projectCount = (await db.execute("SELECT COUNT(*) as count FROM projects")).rows[0] as unknown as { count: number };
  if ((projectCount?.count ?? 0) === 0) {
    const defaultProjects = [
      {
        id: "1",
        title: "FinTech Dashboard Pro",
        category: "WEB APP",
        description: "Platform analitik keuangan real-time dengan chart interaktif, ekspor laporan otomatis, dan manajemen aset terenkripsi.",
        tags: JSON.stringify(["Next.js", "TypeScript", "TailwindCSS", "Recharts"]),
        color: "bg-[#E0F2FE]",
        demoUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: 1,
        title_en: "FinTech Dashboard Pro",
        description_en: "Real-time financial analytics platform with interactive charts, automated report exports, and encrypted asset management.",
      },
      {
        id: "2",
        title: "AI Commerce Engine",
        category: "AI / SAAS",
        description: "Sistem e-commerce berbasis AI dengan rekomendasi produk cerdas, integrasi payment gateway, dan manajemen stok otomatis.",
        tags: JSON.stringify(["React", "Node.js", "OpenAI API", "PostgreSQL"]),
        color: "bg-[#FDE047]",
        demoUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: 1,
        title_en: "AI Commerce Engine",
        description_en: "AI-powered e-commerce system with intelligent product recommendations, payment gateway integration, and automated stock management.",
      },
      {
        id: "3",
        title: "Pulse Social Community",
        category: "MOBILE / HYBRID",
        description: "Aplikasi komunitas developer dengan diskusi real-time, sharing snippet kode, dan sistem badge reputasi.",
        tags: JSON.stringify(["React Native", "Firebase", "Tailwind", "Zustand"]),
        color: "bg-[#F472B6]",
        demoUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: 0,
        title_en: "Pulse Social Community",
        description_en: "Developer community app with real-time discussions, code snippet sharing, and a reputation badge system.",
      },
      {
        id: "4",
        title: "TaskCraft Workflow Studio",
        category: "PRODUCTIVITY",
        description: "Visual kanban & board manajemen proyek dengan fitur otomasi alur kerja dan integrasi webhook.",
        tags: JSON.stringify(["Next.js", "Prisma", "TailwindCSS", "TRPC"]),
        color: "bg-[#86EFAC]",
        demoUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: 0,
        title_en: "TaskCraft Workflow Studio",
        description_en: "Visual kanban & project management board with workflow automation and webhook integration.",
      },
    ];

    const now = Date.now();
    const batch = defaultProjects.map((p, i) => ({
      sql: `INSERT INTO projects (id, title, category, description, tags, color, demoUrl, githubUrl, featured, createdAt, title_en, description_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id, p.title, p.category, p.description, p.tags, p.color,
        p.demoUrl, p.githubUrl, p.featured, now - (3 - i) * 1000, p.title_en, p.description_en,
      ],
    }));
    await db.batch(batch);
  }

  // Seed default Experiences if empty
  const expCount = (await db.execute("SELECT COUNT(*) as count FROM experiences")).rows[0] as unknown as { count: number };
  if ((expCount?.count ?? 0) === 0) {
    const defaultExperiences = [
      {
        id: "1",
        role: "Senior Full-Stack Engineer",
        company: "TechNova Studio",
        period: "2024 — SEKARANG",
        description: "Memimpin pengembangan web app skalabel berbasis Next.js & Microservices, meningkatkan performa sistem sebesar 40% dan mengelola tim 5 developer.",
        skills: JSON.stringify(["Next.js 16", "TypeScript", "Node.js", "PostgreSQL", "Docker"]),
        color: "bg-[#FDE047]",
        description_en: "Led the development of scalable web apps using Next.js & Microservices, improved system performance by 40% and managed a team of 5 developers.",
        period_en: "2024 — PRESENT",
      },
      {
        id: "2",
        role: "Frontend Developer",
        company: "PixelCraft Agency",
        period: "2022 — 2024",
        description: "Mengembangkan lebih dari 20+ landing page dan web portal interaktif dengan animasi kustom, responsive design, dan skor Lighthouse 95+.",
        skills: JSON.stringify(["React", "TailwindCSS", "Framer Motion", "GraphQL"]),
        color: "bg-[#F472B6]",
        description_en: "Developed 20+ landing pages and interactive web portals with custom animations, responsive design, and 95+ Lighthouse scores.",
        period_en: "2022 — 2024",
      },
      {
        id: "3",
        role: "Junior Web Developer",
        company: "Solusi Digital ID",
        period: "2021 — 2022",
        description: "Membangun REST API dan modul admin dashboard untuk sistem manajemen persediaan e-commerce.",
        skills: JSON.stringify(["JavaScript", "Express.js", "MongoDB", "CSS Modules"]),
        color: "bg-[#60A5FA]",
        description_en: "Built REST APIs and admin dashboard modules for an e-commerce inventory management system.",
        period_en: "2021 — 2022",
      },
    ];

    const now = Date.now();
    const batch = defaultExperiences.map((e, i) => ({
      sql: `INSERT INTO experiences (id, role, company, period, description, skills, color, createdAt, description_en, period_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        e.id, e.role, e.company, e.period, e.description, e.skills,
        e.color, now - (2 - i) * 1000, e.description_en, e.period_en,
      ],
    }));
    await db.batch(batch);
  }

  // Seed default Certificates if empty
  const certCount = (await db.execute("SELECT COUNT(*) as count FROM certificates")).rows[0] as unknown as { count: number };
  if ((certCount?.count ?? 0) === 0) {
    const defaultCerts = [
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
      },
    ];

    const now = Date.now();
    const batch = defaultCerts.map((c, i) => ({
      sql: `INSERT INTO certificates (id, title, issuer, issued_date, description, image_url, credential_url, title_en, description_en, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        c.id, c.title, c.issuer, c.issued_date, c.description, c.image_url,
        c.credential_url, c.title_en, c.description_en, now - (1 - i) * 1000,
      ],
    }));
    await db.batch(batch);
  }
}

// A shared init promise so multiple concurrent requests don't re-run seeding.
let initPromise: Promise<void> | null = null;
export function ensureDB(): Promise<void> {
  if (!initPromise) {
    initPromise = initDB();
  }
  return initPromise;
}

export default db;