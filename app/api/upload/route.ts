import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { put, del } from "@vercel/blob";

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

    const hasBlobConfig =
      Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
      Boolean(process.env.BLOB_STORE_ID);

    if (!hasBlobConfig) {
      return NextResponse.json(
        { error: "Vercel Blob tidak dikonfigurasi. Set BLOB_READ_WRITE_TOKEN atau BLOB_STORE_ID." },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putOptions: {
      access: "public";
      contentType: string;
      token?: string;
      storeId?: string;
    } = {
      access: "public",
      contentType: file.type,
    };

    if (process.env.BLOB_STORE_ID) {
      putOptions.storeId = process.env.BLOB_STORE_ID;
    } else if (process.env.BLOB_READ_WRITE_TOKEN) {
      putOptions.token = process.env.BLOB_READ_WRITE_TOKEN;
    }

    const blob = await put(filename, buffer, putOptions);

    return NextResponse.json({ url: blob.url });
  } catch (error: unknown) {
    console.error("Upload error detail:", error);
    const message = error instanceof Error ? error.message : "Gagal mengupload file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL wajib diisi." }, { status: 400 });
    }

    const hasBlobConfig =
      Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
      Boolean(process.env.BLOB_STORE_ID);

    if (!hasBlobConfig || !url.includes("blob.vercel-storage.com")) {
      return NextResponse.json({ success: true });
    }

    const delOptions: { token?: string; storeId?: string } = {};
    if (process.env.BLOB_STORE_ID) {
      delOptions.storeId = process.env.BLOB_STORE_ID;
    } else if (process.env.BLOB_READ_WRITE_TOKEN) {
      delOptions.token = process.env.BLOB_READ_WRITE_TOKEN;
    }

    await del(url, delOptions);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: true }); // Silent fail for cleanup
  }
}
