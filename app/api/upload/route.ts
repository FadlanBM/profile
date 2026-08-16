import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diupload." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5 MB." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Hanya file gambar yang diizinkan." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `certificates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // If BLOB_READ_WRITE_TOKEN is set (Vercel Production), use Vercel Blob SDK
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, {
        access: "public",
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local fallback: save to public/uploads/certificates/
    const dir = path.join(process.cwd(), "public", "uploads", "certificates");
    fs.mkdirSync(dir, { recursive: true });

    const localFilename = path.basename(filename);
    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, localFilename), buf);

    return NextResponse.json({ url: `/uploads/certificates/${localFilename}` });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupload file." }, { status: 500 });
  }
}
