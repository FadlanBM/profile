import { NextResponse } from "next/server";
import db, { ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDB();
    const res = await db.execute("SELECT * FROM projects ORDER BY createdAt DESC");
    const projects = res.rows as any[];

    const formattedProjects = projects.map((p) => ({
      ...p,
      featured: Boolean(p.featured),
      tags: JSON.parse((p.tags as string) || "[]"),
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data proyek dari database." },
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
    const { title, category, description, tags, color, demoUrl, githubUrl, featured, title_en, description_en } = body;

    if (!title || !category || !description) {
      return NextResponse.json({ error: "Title, Category, dan Description wajib diisi." }, { status: 400 });
    }

    const id = Date.now().toString();
    const createdAt = Date.now();
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    await db.execute({
      sql: `
        INSERT INTO projects (id, title, category, description, tags, color, demoUrl, githubUrl, featured, createdAt, title_en, description_en)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        title,
        category,
        description,
        tagsJson,
        color || "bg-[#FEFBF6]",
        demoUrl || "",
        githubUrl || "",
        featured ? 1 : 0,
        createdAt,
        title_en || "",
        description_en || "",
      ],
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan proyek ke database." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureDB();
    const body = await request.json();
    const { id, title, category, description, tags, color, demoUrl, githubUrl, featured, title_en, description_en } = body;

    if (!id || !title || !category) {
      return NextResponse.json({ error: "ID, Title, dan Category wajib diisi." }, { status: 400 });
    }

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    await db.execute({
      sql: `
        UPDATE projects
        SET title = ?, category = ?, description = ?, tags = ?, color = ?, demoUrl = ?, githubUrl = ?, featured = ?, title_en = ?, description_en = ?
        WHERE id = ?
      `,
      args: [
        title,
        category,
        description,
        tagsJson,
        color,
        demoUrl,
        githubUrl,
        featured ? 1 : 0,
        title_en || "",
        description_en || "",
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui proyek di database." }, { status: 500 });
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
      return NextResponse.json({ error: "ID proyek wajib diisi." }, { status: 400 });
    }

    await db.execute({
      sql: "DELETE FROM projects WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus proyek dari database." }, { status: 500 });
  }
}
