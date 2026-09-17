import { NextResponse } from "next/server";
import { getDb, COLLECTIONS, ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Experience } from "@/lib/firestore";

export async function GET() {
  try {
    await ensureDB();
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.EXPERIENCES)
      .orderBy("createdAt", "desc")
      .get();

    const experiences: Experience[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Experience, "id">),
    }));

    return NextResponse.json(experiences);
  } catch (error: unknown) {
    console.error("Error fetching experiences:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data pengalaman kerja dari database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    await ensureDB();
    const db = getDb();
    const body = await request.json();
    const { role, company, period, description, skills, color, description_en, period_en } = body;

    if (!role || !company || !period) {
      return NextResponse.json(
        { error: "Role, Company, dan Period wajib diisi." },
        { status: 400 }
      );
    }

    const id = Date.now().toString();
    const experience: Experience = {
      id,
      role,
      company,
      period,
      description: description || "",
      skills: Array.isArray(skills) ? skills : [],
      color: color || "bg-[#FEFBF6]",
      description_en: description_en || "",
      period_en: period_en || "",
      createdAt: Date.now(),
    };

    await db.collection(COLLECTIONS.EXPERIENCES).doc(id).set(experience);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating experience:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan pengalaman ke database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    await ensureDB();
    const db = getDb();
    const body = await request.json();
    const { id, role, company, period, description, skills, color, description_en, period_en } = body;

    if (!id || !role || !company) {
      return NextResponse.json(
        { error: "ID, Role, dan Company wajib diisi." },
        { status: 400 }
      );
    }

    const updateData: Partial<Experience> = {
      role,
      company,
      period,
      description,
      skills: Array.isArray(skills) ? skills : [],
      color,
      description_en: description_en || "",
      period_en: period_en || "",
    };

    await db.collection(COLLECTIONS.EXPERIENCES).doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error updating experience:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui pengalaman di database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    await ensureDB();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID pengalaman wajib diisi." },
        { status: 400 }
      );
    }

    await db.collection(COLLECTIONS.EXPERIENCES).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting experience:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus pengalaman dari database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
