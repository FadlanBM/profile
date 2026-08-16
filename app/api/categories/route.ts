import { NextResponse } from "next/server";
import db, { ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    await ensureDB();
    const res = await db.execute("SELECT * FROM categories ORDER BY createdAt ASC");
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data kategori." },
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
    const { name, name_en } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });
    }

    const trimmedName = name.trim();

    const existingRes = await db.execute({
      sql: "SELECT id FROM categories WHERE name = ?",
      args: [trimmedName],
    });
    if (existingRes.rows.length > 0) {
      return NextResponse.json({ error: "Kategori dengan nama ini sudah ada." }, { status: 400 });
    }

    const id = Date.now().toString();
    await db.execute({
      sql: "INSERT INTO categories (id, name, name_en, createdAt) VALUES (?, ?, ?, ?)",
      args: [id, trimmedName, name_en || "", Date.now()],
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan kategori." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureDB();
    const body = await request.json();
    const { id, name, name_en } = body;

    if (!id) {
      return NextResponse.json({ error: "ID kategori wajib diisi." }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const categoryRes = await db.execute({
      sql: "SELECT * FROM categories WHERE id = ?",
      args: [id],
    });
    const category = categoryRes.rows[0] as any;
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });
    }

    // Check duplicate name
    const duplicateRes = await db.execute({
      sql: "SELECT id FROM categories WHERE name = ? AND id != ?",
      args: [trimmedName, id],
    });
    if (duplicateRes.rows.length > 0) {
      return NextResponse.json({ error: "Kategori dengan nama ini sudah ada." }, { status: 400 });
    }

    const oldName = category.name as string;
    await db.execute({
      sql: "UPDATE categories SET name = ?, name_en = ? WHERE id = ?",
      args: [trimmedName, name_en || "", id],
    });

    // Cascade: update projects using the old category name
    if (trimmedName !== oldName) {
      await db.execute({
        sql: "UPDATE projects SET category = ? WHERE category = ?",
        args: [trimmedName, oldName],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui kategori." }, { status: 500 });
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
      return NextResponse.json({ error: "ID kategori wajib diisi." }, { status: 400 });
    }

    const categoryRes = await db.execute({
      sql: "SELECT * FROM categories WHERE id = ?",
      args: [id],
    });
    const category = categoryRes.rows[0] as any;
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });
    }

    // Dependency check: refuse deletion if any project uses this category
    const usageRes = await db.execute({
      sql: "SELECT COUNT(*) as count FROM projects WHERE category = ?",
      args: [category.name],
    });
    const usage = usageRes.rows[0] as unknown as { count: number };
    if ((usage?.count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Kategori masih digunakan oleh proyek. Pindahkan proyek tersebut ke kategori lain terlebih dahulu." },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "DELETE FROM categories WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kategori." }, { status: 500 });
  }
}
