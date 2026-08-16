import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Konfigurasi email (RESEND_API_KEY) belum diset di server." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nama, email, dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "fadlanbuwono@gmail.com",
      replyTo: email,
      subject: `Pesan dari ${name} via Portfolio`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
    });

    if (error) {
      return NextResponse.json(
        { error: "Gagal mengirim email. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengirim email. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
