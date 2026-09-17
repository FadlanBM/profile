import { NextResponse } from "next/server";
import { getFirebaseStorage } from "@/lib/firebase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Handle Firebase Storage URLs
  if (targetUrl.includes("storage.googleapis.com") || targetUrl.includes("firebasestorage.app")) {
    try {
      // For public URLs, just redirect
      return NextResponse.redirect(targetUrl);
    } catch (error: unknown) {
      console.error("Media proxy error:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch media";
      return new NextResponse(message, { status: 500 });
    }
  }

  // Fallback: redirect to target URL if external
  return NextResponse.redirect(targetUrl);
}
