import { NextResponse } from "next/server";
import db, { ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDB();
    const res = await db.execute("SELECT * FROM experiences ORDER BY createdAt DESC");
    const experiences = res.rows as any[];

    const formattedExperiences = experiences.map((e) => ({
      ...e,
      skills: JSON.parse((e.skills as string) || "[]"),
    }));

    return NextResponse.json(formattedExperiences);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pengalaman kerja dari database." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureDB();
    const body = await request.json();
    const { role, company, period, description, skills, color, description_en, period_en } = body;

    if (!role || !company || !period) {
      return NextResponse.json({ error: "Role, Company, dan Period wajib diisi." }, { status: 400 });
    }

    const id = Date.now().toString();
    const createdAt = Date.now();
    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);

    await db.execute({
      sql: `
        INSERT INTO experiences (id, role, company, period, description, skills, color, createdAt, description_en, period_en)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        role,
        company,
        period,
        description || "",
        skillsJson,
        color || "bg-[#FEFBF6]",
        createdAt,
        description_en || "",
        period_en || "",
      ],
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan pengalaman ke database." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureDB();
    const body = await request.json();
    const { id, role, company, period, description, skills, color, description_en, period_en } = body;

    if (!id || !role || !company) {
      return NextResponse.json({ error: "ID, Role, dan Company wajib diisi." }, { status: 400 });
    }

    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);

    await db.execute({
      sql: `
        UPDATE experiences
        SET role = ?, company = ?, period = ?, description = ?, skills = ?, color = ?, description_en = ?, period_en = ?
        WHERE id = ?
      `,
      args: [
        role,
        company,
        period,
        description,
        skillsJson,
        color,
        description_en || "",
        period_en || "",
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui pengalaman di database." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID pengalaman wajib diisi." }, { status: 400 });
    }

    await db.execute({
      sql: "DELETE FROM experiences WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pengalaman dari database." }, { status: 500 });
  }
}
