import { NextResponse } from "next/server";
import db, { ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { del } from "@vercel/blob";

export async function GET() {
  try {
    await ensureDB();
    const res = await db.execute("SELECT * FROM certificates ORDER BY createdAt DESC");
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data sertifikat." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    await ensureDB();
    const body = await request.json();
    const { title, issuer, issued_date, description, image_url, credential_url, title_en, description_en } = body;

    if (!title || !issuer || !image_url) {
      return NextResponse.json(
        { error: "Title, Issuer, dan Image wajib diisi." },
        { status: 400 }
      );
    }

    const id = Date.now().toString();

    await db.execute({
      sql: `
        INSERT INTO certificates (id, title, issuer, issued_date, description, image_url, credential_url, title_en, description_en, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        title,
        issuer,
        issued_date || "",
        description || "",
        image_url,
        credential_url || "",
        title_en || "",
        description_en || "",
        Date.now(),
      ],
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error("Certificate POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menyimpan sertifikat." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    await ensureDB();
    const body = await request.json();
    const { id, title, issuer, issued_date, description, image_url, credential_url, title_en, description_en } = body;

    if (!id) {
      return NextResponse.json({ error: "ID sertifikat wajib diisi." }, { status: 400 });
    }

    await db.execute({
      sql: `
        UPDATE certificates
        SET title = ?, issuer = ?, issued_date = ?, description = ?, image_url = ?, credential_url = ?, title_en = ?, description_en = ?
        WHERE id = ?
      `,
      args: [
        title,
        issuer,
        issued_date || "",
        description || "",
        image_url,
        credential_url || "",
        title_en || "",
        description_en || "",
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Certificate PUT error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui sertifikat." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    await ensureDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID sertifikat wajib diisi." }, { status: 400 });
    }

    // Fetch certificate first to get image_url for blob cleanup
    const certRes = await db.execute({
      sql: "SELECT image_url FROM certificates WHERE id = ?",
      args: [id],
    });
    const cert = certRes.rows[0] as { image_url?: string } | undefined;

    await db.execute({
      sql: "DELETE FROM certificates WHERE id = ?",
      args: [id],
    });

    // If the image was stored in Vercel Blob, delete it from blob storage too
    let rawBlobUrl = cert?.image_url;
    if (rawBlobUrl?.includes("url=")) {
      try {
        const u = new URL(rawBlobUrl, "http://localhost");
        rawBlobUrl = u.searchParams.get("url") || rawBlobUrl;
      } catch {}
    }

    const hasBlobConfig =
      Boolean(process.env.BLOB_READ_WRITE_TOKEN) || Boolean(process.env.BLOB_STORE_ID);

    if (rawBlobUrl && rawBlobUrl.includes("vercel-storage.com") && hasBlobConfig) {
      try {
        const delOptions: any = {};
        if (process.env.BLOB_STORE_ID) {
          delOptions.storeId = process.env.BLOB_STORE_ID;
        } else if (process.env.BLOB_READ_WRITE_TOKEN) {
          delOptions.token = process.env.BLOB_READ_WRITE_TOKEN;
        }
        await del(rawBlobUrl, delOptions);
      } catch {
        // Silently ignore blob deletion failures — the certificate row is already gone
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus sertifikat." },
      { status: 500 }
    );
  }
}
