import { NextResponse } from "next/server";
import { getDb, COLLECTIONS, ensureDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { del } from "@vercel/blob";
import type { Certificate } from "@/lib/firestore";

export async function GET() {
  try {
    await ensureDB();
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.CERTIFICATES)
      .orderBy("createdAt", "desc")
      .get();

    const certificates: Certificate[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Certificate, "id">),
    }));

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
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
    const db = getDb();
    const body = await request.json();
    const { title, issuer, issued_date, description, image_url, credential_url, title_en, description_en } = body;

    if (!title || !issuer || !image_url) {
      return NextResponse.json(
        { error: "Title, Issuer, dan Image wajib diisi." },
        { status: 400 }
      );
    }

    const id = Date.now().toString();
    const certificate: Certificate = {
      id,
      title,
      issuer,
      issued_date: issued_date || "",
      description: description || "",
      image_url,
      credential_url: credential_url || "",
      title_en: title_en || "",
      description_en: description_en || "",
      createdAt: Date.now(),
    };

    await db.collection(COLLECTIONS.CERTIFICATES).doc(id).set(certificate);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: unknown) {
    console.error("Certificate POST error:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan sertifikat.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    await ensureDB();
    const db = getDb();
    const body = await request.json();
    const { id, title, issuer, issued_date, description, image_url, credential_url, title_en, description_en } = body;

    if (!id) {
      return NextResponse.json({ error: "ID sertifikat wajib diisi." }, { status: 400 });
    }

    const updateData: Partial<Certificate> = {
      title,
      issuer,
      issued_date: issued_date || "",
      description: description || "",
      image_url,
      credential_url: credential_url || "",
      title_en: title_en || "",
      description_en: description_en || "",
    };

    await db.collection(COLLECTIONS.CERTIFICATES).doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Certificate PUT error:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui sertifikat.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    await ensureDB();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID sertifikat wajib diisi." }, { status: 400 });
    }

    // Fetch certificate to get image_url for cleanup
    const certDoc = await db.collection(COLLECTIONS.CERTIFICATES).doc(id).get();
    const certData = certDoc.data() as Certificate | undefined;

    // Delete from Firestore
    await db.collection(COLLECTIONS.CERTIFICATES).doc(id).delete();

    // Delete from Vercel Blob if applicable
    if (certData?.image_url?.includes("blob.vercel-storage.com")) {
      const hasBlobConfig =
        Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
        Boolean(process.env.BLOB_STORE_ID);

      if (hasBlobConfig) {
        try {
          const delOptions: { token?: string; storeId?: string } = {};
          if (process.env.BLOB_STORE_ID) {
            delOptions.storeId = process.env.BLOB_STORE_ID;
          } else if (process.env.BLOB_READ_WRITE_TOKEN) {
            delOptions.token = process.env.BLOB_READ_WRITE_TOKEN;
          }
          await del(certData.image_url, delOptions);
        } catch {
          // Silently ignore blob deletion failures
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json({ error: "Gagal menghapus sertifikat." }, { status: 500 });
  }
}
