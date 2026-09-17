import { NextResponse } from "next/server";
import { getDb, COLLECTIONS, ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Category, Project } from "@/lib/firestore";

export async function GET() {
  try {
    await ensureDB();
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .orderBy("createdAt", "asc")
      .get();

    const categories: Category[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Category, "id">),
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kategori." },
      { status: 500 }
    );
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
    const { name, name_en } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check for duplicate name
    const existingSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("name", "==", trimmedName)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: "Kategori dengan nama ini sudah ada." },
        { status: 400 }
      );
    }

    const id = Date.now().toString();
    const category: Category = {
      id,
      name: trimmedName,
      name_en: name_en || "",
      createdAt: Date.now(),
    };

    await db.collection(COLLECTIONS.CATEGORIES).doc(id).set(category);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan kategori." },
      { status: 500 }
    );
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
    const { id, name, name_en } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID kategori wajib diisi." },
        { status: 400 }
      );
    }
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if category exists
    const categoryDoc = await db.collection(COLLECTIONS.CATEGORIES).doc(id).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    const oldData = categoryDoc.data() as Category;

    // Check for duplicate name
    const duplicateSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("name", "==", trimmedName)
      .get();

    const isDuplicate = duplicateSnapshot.docs.some((doc) => doc.id !== id);
    if (isDuplicate) {
      return NextResponse.json(
        { error: "Kategori dengan nama ini sudah ada." },
        { status: 400 }
      );
    }

    // Update category
    await db.collection(COLLECTIONS.CATEGORIES).doc(id).update({
      name: trimmedName,
      name_en: name_en || "",
    });

    // Cascade: update all projects using this category
    if (trimmedName !== oldData.name) {
      const projectsSnapshot = await db
        .collection(COLLECTIONS.PROJECTS)
        .where("category", "==", oldData.name)
        .get();

      const batch = db.batch();
      projectsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { category: trimmedName });
      });
      await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui kategori." },
      { status: 500 }
    );
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
        { error: "ID kategori wajib diisi." },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryDoc = await db.collection(COLLECTIONS.CATEGORIES).doc(id).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    const categoryData = categoryDoc.data() as Category;

    // Check if any project uses this category
    const projectsSnapshot = await db
      .collection(COLLECTIONS.PROJECTS)
      .where("category", "==", categoryData.name)
      .limit(1)
      .get();

    if (!projectsSnapshot.empty) {
      return NextResponse.json(
        { error: "Kategori masih digunakan oleh proyek. Pindahkan proyek tersebut ke kategori lain terlebih dahulu." },
        { status: 400 }
      );
    }

    await db.collection(COLLECTIONS.CATEGORIES).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kategori." },
      { status: 500 }
    );
  }
}
