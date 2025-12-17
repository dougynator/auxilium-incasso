import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_CC_EMAIL || "admin@auxiliumincasso.com";

    const emailHtml = `
      <h2>Nieuw contactformulier bericht</h2>
      <p><strong>Van:</strong> ${name} (${email})</p>
      <p><strong>Bericht:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Nieuw contactformulier bericht van ${name}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

