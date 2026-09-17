import { NextResponse } from "next/server";
import { getDb, COLLECTIONS, ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Hero } from "@/lib/firestore";

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
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.HERO).doc("main").get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Hero data not found" }, { status: 404 });
    }

    const data = doc.data() as Hero;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching hero:", error);
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
    const db = getDb();
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

    const heroData: Partial<Hero> = {
      greeting,
      title_line1,
      title_highlight,
      title_line2,
      description: description || "",
      availability_badge: availability_badge || "",
      location: location || "",
      role: role || "",
      skills: Array.isArray(skills) ? skills : [],
      profile_image: profile_image || "/profile.JPG",
      greeting_en: greeting_en || "",
      description_en: description_en || "",
      cv_url: cv_url || "",
    };

    await db.collection(COLLECTIONS.HERO).doc("main").set(heroData, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving hero:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data hero." },
      { status: 500 }
    );
  }
}
