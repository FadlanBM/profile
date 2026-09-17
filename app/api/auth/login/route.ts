import { NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminToken } from "@/lib/auth";
import { shouldUseSecureCookie } from "@/lib/cookie-security";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan Password wajib diisi!" },
        { status: 400 }
      );
    }

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Username atau Password salah!" },
        { status: 401 }
      );
    }

    const token = createAdminToken();

    const response = NextResponse.json({
      success: true,
      message: "Login admin berhasil!",
    });

    const isSecure = shouldUseSecureCookie(request);

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat login!" },
      { status: 500 }
    );
  }
}
