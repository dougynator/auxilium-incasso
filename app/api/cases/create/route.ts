import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredReference } from "@/lib/utils";
import { createCaseEvent } from "@/lib/cases/events";
import { logAuditEvent } from "@/lib/audit";
import { sendEmail } from "@/lib/email/service";
import { generatePaymentRequestPDF } from "@/lib/pdf/generator";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });
    }

    if (profile.role !== "client" && profile.role !== "admin" && profile.role !== "staff") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const organizationId =
      profile.role === "client"
        ? profile.organization_id
        : (await request.json()).organizationId || profile.organization_id;

    if (!organizationId) {
      return NextResponse.json({ error: "Organisatie is verplicht" }, { status: 400 });
    }

    const body = await request.json();

    // Create or find debtor
    let debtorId: string;

    const { data: existingDebtor } = await supabase
      .from("debtors")
      .select("id")
      .eq("email", body.debtorEmail)
      .single();

    if (existingDebtor) {
      debtorId = existingDebtor.id;
      // Update debtor info
      await supabase.from("debtors").update({
        name: body.debtorName || null,
        company_name: body.debtorCompanyName || null,
        address_street: body.debtorStreet || null,
        address_city: body.debtorCity || null,
        address_postal_code: body.debtorPostalCode || null,
        address_country: body.debtorCountry || "BE",
      }).eq("id", debtorId);
    } else {
      const { data: newDebtor, error: debtorError } = await supabase
        .from("debtors")
        .insert({
          name: body.debtorName || null,
          company_name: body.debtorCompanyName || null,
          email: body.debtorEmail,
          address_street: body.debtorStreet || null,
          address_city: body.debtorCity || null,
          address_postal_code: body.debtorPostalCode || null,
          address_country: body.debtorCountry || "BE",
        })
        .select("id")
        .single();

      if (debtorError || !newDebtor) {
        return NextResponse.json(
          { error: "Kon debiteur niet aanmaken" },
          { status: 500 }
        );
      }

      debtorId = newDebtor.id;
    }

    // Calculate total amount
    const principalAmount = parseFloat(body.principalAmount);
    const additionalCosts = parseFloat(body.additionalCosts || "0");
    const totalAmount = principalAmount + additionalCosts;

    // Generate structured reference
    const structuredReference = generateStructuredReference("");

    // Create case
    const { data: newCase, error: caseError } = await supabase
      .from("cases")
      .insert({
        organization_id: organizationId,
        debtor_id: debtorId,
        created_by: user.id,
        status: "draft",
        principal_amount: principalAmount,
        additional_costs: additionalCosts,
        total_amount: totalAmount,
        currency: "EUR",
        structured_reference: structuredReference,
        invoice_number: body.invoiceNumber,
        invoice_date: body.invoiceDate || null,
        due_date: body.dueDate || null,
      })
      .select("*, debtors(*), organizations(*)")
      .single();

    if (caseError || !newCase) {
      return NextResponse.json(
        { error: "Kon opdracht niet aanmaken" },
        { status: 500 }
      );
    }

    // Create case event
    await createCaseEvent({
      caseId: newCase.id,
      actorProfileId: user.id,
      type: "created",
      message: "Opdracht aangemaakt",
    });

    // Log audit event
    await logAuditEvent({
      actorProfileId: user.id,
      action: "case_created",
      entityType: "cases",
      entityId: newCase.id,
      after: newCase,
    });

    // Get debtor details for email/PDF
    const { data: debtor } = await supabase
      .from("debtors")
      .select("*")
      .eq("id", debtorId)
      .single();

    // Generate PDF
    const pdfBuffer = await generatePaymentRequestPDF({
      debtorName: debtor?.name || debtor?.company_name || "Debiteur",
      debtorAddress: {
        street: debtor?.address_street || undefined,
        city: debtor?.address_city || undefined,
        postalCode: debtor?.address_postal_code || undefined,
        country: debtor?.address_country || "BE",
      },
      structuredReference,
      principalAmount,
      additionalCosts,
      totalAmount,
      invoiceNumber: body.invoiceNumber,
      invoiceDate: body.invoiceDate || undefined,
      dueDate: body.dueDate || undefined,
    });

    // Generate payment URL
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${newCase.id}?ref=${structuredReference}`;

    // Generate payment request email HTML
    const debtorName = debtor?.name || debtor?.company_name || "Debiteur";
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div>
    <h1 style="color: #2563eb; margin-bottom: 20px;">
      Auxilium Incasso
    </h1>
    
    <p>Beste ${debtorName},</p>
    
    <p>
      U ontvangt deze e-mail omdat er een betalingsverzoek is ingediend voor een openstaande factuur.
    </p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0">
      <h2 style="margin-top: 0">Betalingsverzoek</h2>
      
      ${body.invoiceNumber ? `<p><strong>Factuurnummer:</strong> ${body.invoiceNumber}</p>` : ''}
      
      ${body.invoiceDate ? `<p><strong>Factuurdatum:</strong> ${formatDate(body.invoiceDate)}</p>` : ''}
      
      ${body.dueDate ? `<p><strong>Vervaldatum:</strong> ${formatDate(body.dueDate)}</p>` : ''}
      
      <table style="width: 100%; margin-top: 15px; border-collapse: collapse">
        <tr>
          <td style="padding: 8px 0">Hoofdsom:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(principalAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0">Bijkomende kosten:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(additionalCosts)}</td>
        </tr>
        <tr style="border-top: 2px solid #333; font-weight: bold">
          <td style="padding: 8px 0">Totaal te betalen:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>
      
      <p style="margin-top: 15px">
        <strong>Structured reference:</strong> ${structuredReference}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0">
      <a
        href="${paymentUrl}"
        style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold"
      >
        Betaal nu
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666">
      U kunt ook betalen via overschrijving met de structured reference hierboven.
    </p>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666">
      Met vriendelijke groet,<br />
      Auxilium Incasso
    </p>
  </div>
</body>
</html>`;

    // Get organization billing email
    const { data: organization } = await supabase
      .from("organizations")
      .select("billing_email")
      .eq("id", organizationId)
      .single();

    const ccEmails = [organization?.billing_email].filter(Boolean);
    if (process.env.ADMIN_CC_EMAIL) {
      ccEmails.push(process.env.ADMIN_CC_EMAIL);
    }

    await sendEmail({
      to: body.debtorEmail,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: `Betalingsverzoek – Auxilium Incasso – Referentie ${structuredReference}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Betalingsverzoek_${structuredReference}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // Update case status to "sent" and create event
    await supabase
      .from("cases")
      .update({ status: "sent" })
      .eq("id", newCase.id);

    await createCaseEvent({
      caseId: newCase.id,
      actorProfileId: user.id,
      type: "email_sent",
      message: "Betalingsverzoek verzonden naar debiteur",
    });

    return NextResponse.json({
      success: true,
      caseId: newCase.id,
    });
  } catch (error: any) {
    console.error("Create case error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

