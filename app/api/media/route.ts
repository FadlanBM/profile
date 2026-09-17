import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import fs from "fs";
import path from "path";

// Blob store access mode, detected once per process (see app/api/upload/route.ts).
let resolvedAccess: "public" | "private" | null = null;

function blobOptions() {
  if (process.env.BLOB_STORE_ID) return { storeId: process.env.BLOB_STORE_ID };
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return { token: process.env.BLOB_READ_WRITE_TOKEN };
  }
  return {};
}

function contentTypesFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

/**
 * Stream a blob from the store. Private stores need explicit
 * `access: "private"`; the SDK rejects the wrong value, so the first request
 * probes and the result is cached for the process.
 */
async function streamBlob(targetUrl: string): Promise<Response> {
  const options = blobOptions();
  const candidates: Array<"public" | "private"> = resolvedAccess
    ? [resolvedAccess]
    : ["private", "public"];

  let lastError: unknown;

  for (const access of candidates) {
    try {
      const result = await get(targetUrl, { access, ...options });

      if (!result || !result.stream) {
        lastError = new Error("Blob not found");
        continue;
      }

      resolvedAccess = access;

      const contentType =
        result.blob?.contentType ||
        result.headers?.get?.("content-type") ||
        "application/octet-stream";

      return new NextResponse(result.stream as unknown as ReadableStream, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const mismatch =
        message.includes("public access on a private store") ||
        message.includes("private access on a public store");
      if (!mismatch) {
        // Genuine failure (missing file, bad token): probing further won't help.
        break;
      }
    }
  }

  console.error("Media proxy error:", lastError);
  return new NextResponse("Media not found", { status: 404 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Legacy records may still point at files saved under public/uploads.
  if (targetUrl.startsWith("/uploads/")) {
    if (targetUrl.includes("..")) {
      return new NextResponse("Invalid path", { status: 400 });
    }
    const filePath = path.join(process.cwd(), "public", targetUrl);
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }
    return new NextResponse(fs.readFileSync(filePath), {
      headers: {
        "Content-Type": contentTypesFor(filePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (targetUrl.includes("blob.vercel-storage.com")) {
    return streamBlob(targetUrl);
  }

  // Anything else (external URL): let the browser fetch it directly.
  return NextResponse.redirect(targetUrl);
}
