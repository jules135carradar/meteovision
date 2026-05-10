import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { name, message, metier, page } = await request.json();

    if (!message || message.trim().length < 5) {
      return NextResponse.json({ error: "Message trop court" }, { status: 400 });
    }

    await resend.emails.send({
      from: "MétéoVision <onboarding@resend.dev>",
      to: "chevroton.jules@gmail.com",
      subject: `💬 Nouveau retour MétéoVision${name ? ` — ${name}` : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#059669;margin-bottom:4px">💬 Nouveau message</h2>
          <p style="color:#94a3b8;font-size:13px;margin-top:0">MétéoVision — Retour utilisateur</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
          ${name ? `<p><strong>Nom :</strong> ${name}</p>` : ""}
          ${metier && metier !== "grand_public" ? `<p><strong>Profil :</strong> ${metier}</p>` : ""}
          ${page ? `<p><strong>Page :</strong> ${page}</p>` : ""}
          <p><strong>Message :</strong></p>
          <div style="background:#f8fafc;border-left:4px solid #059669;padding:16px;border-radius:8px;font-size:15px;line-height:1.6;white-space:pre-wrap">${message.trim()}</div>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
          <p style="color:#94a3b8;font-size:12px">Envoyé depuis meteovision.vercel.app</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Feedback email error:", err);
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }
}
