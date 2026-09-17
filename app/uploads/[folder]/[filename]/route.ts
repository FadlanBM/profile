import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Serve uploaded files from public/uploads in both dev and production.
// In production, Next.js snapshots public/ at build time, so files created
// at runtime are not served by the static handler and need a dynamic route.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> }
) {
  try {
    const { folder, filename } = await params;

    // Security: prevent directory traversal
    if (folder.includes("..") || filename.includes("..")) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // Only allow known upload folders
    if (folder !== "certificates" && folder !== "cv") {
      return new NextResponse("Not found", { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", folder, filename);

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
  } catch (error) {
    console.error("Upload serve error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
