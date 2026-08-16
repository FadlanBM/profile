import { NextResponse } from "next/server";
import db, { ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export interface HeroData {
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

export async function GET() {
  try {
    await ensureDB();
    const res = await db.execute("SELECT * FROM hero WHERE id = 1");
    const hero = res.rows[0] as any;

    if (!hero) {
      return NextResponse.json({ error: "Hero data not found" }, { status: 404 });
    }

    const data: HeroData = {
      ...hero,
      skills: JSON.parse((hero.skills as string) || "[]"),
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data hero." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    await ensureDB();
    const body = await request.json();
    const {
      greeting,
      title_line1,
      title_highlight,
      title_line2,
      description,
      availability_badge,
      location,
      role,
      skills,
      profile_image,
      greeting_en,
      description_en,
      cv_url,
    } = body;

    if (!greeting || !title_line1 || !title_highlight || !title_line2) {
      return NextResponse.json(
        { error: "greeting, title_line1, title_highlight, dan title_line2 wajib diisi." },
        { status: 400 }
      );
    }

    const skillsJson = JSON.stringify(skills);

    await db.execute({
      sql: `
        INSERT INTO hero (id, greeting, title_line1, title_highlight, title_line2, description, availability_badge, location, role, skills, profile_image, greeting_en, description_en, cv_url)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          greeting = excluded.greeting,
          title_line1 = excluded.title_line1,
          title_highlight = excluded.title_highlight,
          title_line2 = excluded.title_line2,
          description = excluded.description,
          availability_badge = excluded.availability_badge,
          location = excluded.location,
          role = excluded.role,
          skills = excluded.skills,
          profile_image = excluded.profile_image,
          greeting_en = excluded.greeting_en,
          description_en = excluded.description_en,
          cv_url = excluded.cv_url
      `,
      args: [
        greeting,
        title_line1,
        title_highlight,
        title_line2,
        description || "",
        availability_badge || "",
        location || "",
        role || "",
        skillsJson,
        profile_image || "/profile.JPG",
        greeting_en || "",
        description_en || "",
        cv_url || "",
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan data hero." },
      { status: 500 }
    );
  }
}
