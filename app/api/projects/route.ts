import { NextResponse } from "next/server";
import { getDb, COLLECTIONS, ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Project } from "@/lib/firestore";

export async function GET() {
  try {
    await ensureDB();
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.PROJECTS)
      .orderBy("createdAt", "desc")
      .get();

    const projects: Project[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Project, "id">),
    }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data proyek dari database." },
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
    const {
      title,
      category,
      description,
      tags,
      color,
      demoUrl,
      githubUrl,
      featured,
      title_en,
      description_en,
    } = body;

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Title, Category, dan Description wajib diisi." },
        { status: 400 }
      );
    }

    const id = Date.now().toString();
    const project: Project = {
      id,
      title,
      category,
      description,
      tags: Array.isArray(tags) ? tags : [],
      color: color || "bg-[#FEFBF6]",
      demoUrl: demoUrl || "",
      githubUrl: githubUrl || "",
      featured: Boolean(featured),
      title_en: title_en || "",
      description_en: description_en || "",
      createdAt: Date.now(),
    };

    await db.collection(COLLECTIONS.PROJECTS).doc(id).set(project);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan proyek ke database." },
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
    const {
      id,
      title,
      category,
      description,
      tags,
      color,
      demoUrl,
      githubUrl,
      featured,
      title_en,
      description_en,
    } = body;

    if (!id || !title || !category) {
      return NextResponse.json(
        { error: "ID, Title, dan Category wajib diisi." },
        { status: 400 }
      );
    }

    const updateData: Partial<Project> = {
      title,
      category,
      description,
      tags: Array.isArray(tags) ? tags : [],
      color,
      demoUrl,
      githubUrl,
      featured: Boolean(featured),
      title_en: title_en || "",
      description_en: description_en || "",
    };

    await db.collection(COLLECTIONS.PROJECTS).doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui proyek di database." },
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
        { error: "ID proyek wajib diisi." },
        { status: 400 }
      );
    }

    await db.collection(COLLECTIONS.PROJECTS).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Gagal menghapus proyek dari database." },
      { status: 500 }
    );
  }
}
