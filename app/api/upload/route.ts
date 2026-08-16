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

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Hanya file gambar atau PDF yang diizinkan." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? (isPdf ? "pdf" : "jpg");
    const filename = `${isPdf ? "cv" : "certificates"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // If BLOB_READ_WRITE_TOKEN is set (Vercel Production), use Vercel Blob SDK
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, {
        access: "public",
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local fallback: save to public/uploads/[folder]/
    const subfolder = isPdf ? "cv" : "certificates";
    const dir = path.join(process.cwd(), "public", "uploads", subfolder);
    fs.mkdirSync(dir, { recursive: true });

    const localFilename = path.basename(filename);
    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, localFilename), buf);

    return NextResponse.json({ url: `/uploads/${subfolder}/${localFilename}` });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupload file." }, { status: 500 });
  }
}
