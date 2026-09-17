import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { put, del } from "@vercel/blob";

// ---------------------------------------------------------------------------
// Blob store access mode
// ---------------------------------------------------------------------------
// A Vercel Blob store is either "public" or "private" and the SDK rejects the
// wrong value ("Cannot use public access on a private store"). The mode is not
// exposed through the SDK, so we start from BLOB_ACCESS (default: private,
// because private stores are the safer default) and flip once if the store
// disagrees, caching the answer for the rest of the process.
type BlobAccess = "public" | "private";

let resolvedAccess: BlobAccess | null = null;

function accessMismatch(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("public access on a private store") ||
    message.includes("private access on a public store")
  );
}

function blobOptions() {
  // OIDC (BLOB_STORE_ID) takes precedence: the SDK then uses Vercel's managed
  // VERCEL_OIDC_TOKEN instead of a long-lived read/write secret.
  if (process.env.BLOB_STORE_ID) return { storeId: process.env.BLOB_STORE_ID };
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return { token: process.env.BLOB_READ_WRITE_TOKEN };
  }
  return {};
}

function configuredAccess(): BlobAccess {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

/** Upload with the store's actual access mode, caching which one works. */
async function putWithDetectedAccess(
  pathname: string,
  body: Buffer,
  contentType: string
) {
  const options = blobOptions();

  if (resolvedAccess) {
    const blob = await put(pathname, body, {
      ...options,
      access: resolvedAccess,
      contentType,
      addRandomSuffix: false,
    });
    return { blob, access: resolvedAccess };
  }

  const first: BlobAccess = configuredAccess();
  const second: BlobAccess = first === "public" ? "private" : "public";

  try {
    const blob = await put(pathname, body, {
      ...options,
      access: first,
      contentType,
      addRandomSuffix: false,
    });
    resolvedAccess = first;
    return { blob, access: first };
  } catch (error) {
    if (!accessMismatch(error)) throw error;

    const blob = await put(pathname, body, {
      ...options,
      access: second,
      contentType,
      addRandomSuffix: false,
    });
    resolvedAccess = second;
    return { blob, access: second };
  }
}

// ---------------------------------------------------------------------------

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
      return NextResponse.json(
        { error: "Hanya file gambar atau PDF yang diizinkan." },
        { status: 400 }
      );
    }

    const hasBlobConfig =
      Boolean(process.env.BLOB_STORE_ID) || Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    if (!hasBlobConfig) {
      return NextResponse.json(
        { error: "Vercel Blob tidak dikonfigurasi. Set BLOB_STORE_ID atau BLOB_READ_WRITE_TOKEN." },
        { status: 500 }
      );
    }

    const ext = file.name.split(".").pop() ?? (isPdf ? "pdf" : "jpg");
    const pathname = `${isPdf ? "cv" : "certificates"}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { blob, access } = await putWithDetectedAccess(pathname, buffer, file.type);

    // Private blobs are not readable from the browser directly, so serve them
    // through /api/media. Public blobs can use their CDN URL as-is.
    const url =
      access === "private"
        ? `/api/media?url=${encodeURIComponent(blob.url)}`
        : blob.url;

    return NextResponse.json({ url });
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
    let targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "URL wajib diisi." }, { status: 400 });
    }

    // Unwrap /api/media?url=... proxies produced by POST above.
    if (targetUrl.includes("url=")) {
      try {
        const parsed = new URL(targetUrl, "http://localhost");
        targetUrl = parsed.searchParams.get("url") || targetUrl;
      } catch {
        // keep the original value
      }
    }

    if (!targetUrl.includes("blob.vercel-storage.com")) {
      return NextResponse.json({ success: true });
    }

    await del(targetUrl, blobOptions());

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Cleanup must never fail the parent delete: the Firestore record is already gone.
    console.error("Delete error:", error);
    return NextResponse.json({ success: true });
  }
}
