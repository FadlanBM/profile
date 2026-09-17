import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getFirebaseStorage } from "@/lib/firebase";

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

    // Generate unique filename
    const ext = file.name.split(".").pop() ?? (isPdf ? "pdf" : "jpg");
    const folder = isPdf ? "cv" : "certificates";
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload to Firebase Storage
    const storage = getFirebaseStorage();
    const bucket = storage.bucket();

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000",
      },
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    console.error("Upload error detail:", error);
    const message = error instanceof Error ? error.message : "Gagal mengupload file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
