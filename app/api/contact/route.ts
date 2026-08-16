import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY belum diset di Vercel (Project → Settings → Environment Variables).",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nama, email, dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    // "from" must use a domain verified at resend.com/domains.
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      return NextResponse.json(
        {
          error:
            "RESEND_FROM_EMAIL belum diset di Vercel (isi dengan email dari domain terverifikasi di Resend).",
        },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact <${from}>`,
      to: "fadlanbuwono@gmail.com",
      replyTo: email,
      subject: `Pesan dari ${name} via Portfolio`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
    });

    if (error) {
      console.error("Resend send error:", JSON.stringify(error));
      return NextResponse.json(
        { error: error.message || "Gagal mengirim email. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Contact API error:", err);
    const message =
      err instanceof Error ? err.message : "Gagal mengirim email. Silakan coba lagi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
