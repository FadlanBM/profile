import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Handle Vercel Blob URLs - redirect to public URL
  if (targetUrl.includes("blob.vercel-storage.com")) {
    try {
      // For public blobs, just redirect directly
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
