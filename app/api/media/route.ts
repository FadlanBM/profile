import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Handle local files (e.g. /uploads/certificates/xxx.png or /uploads/cv/xxx.pdf)
  if (targetUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", targetUrl);
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Handle Vercel Blob private/public URLs
  if (targetUrl.includes("blob.vercel-storage.com")) {
    try {
      const getOptions: any = {
        access: "private",
      };

      if (process.env.BLOB_STORE_ID) {
        getOptions.storeId = process.env.BLOB_STORE_ID;
      } else if (process.env.BLOB_READ_WRITE_TOKEN) {
        getOptions.token = process.env.BLOB_READ_WRITE_TOKEN;
      }

      const result = await get(targetUrl, getOptions);

      if (!result || !result.stream) {
        return new NextResponse("Media not found", { status: 404 });
      }

      const contentType = result.blob.contentType || "application/octet-stream";

      return new NextResponse(result.stream as any, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    } catch (error: any) {
      console.error("Media proxy error:", error);
      return new NextResponse(error?.message || "Failed to fetch media", { status: 500 });
    }
  }

  // Fallback: redirect to targetUrl if external
  return NextResponse.redirect(targetUrl);
}
