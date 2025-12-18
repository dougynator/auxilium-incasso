import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendEmail } from "@/lib/email/service";
import { generatePaymentRequestPDF } from "@/lib/pdf/generator";
import { generateDebtorEmail, generateClientEmail, generateInternalEmail } from "@/lib/email/templates";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;
    
    console.log('📧 [EMAIL API] Starting email send for case:', caseId);
    
    // Check if RESEND_API_KEY is set
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [EMAIL API] RESEND_API_KEY is not set!');
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [EMAIL API] Missing Supabase credentials');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Fetch case with all related data
    console.log('📧 [EMAIL API] Fetching case data...');
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select(`
        *,
        debtors(*),
        organizations(name, billing_email),
        profiles!cases_created_by_fkey(full_name, email)
      `)
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      console.error('❌ [EMAIL API] Error fetching case:', caseError);
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    console.log('✅ [EMAIL API] Case found:', caseData.id);

    const debtor = caseData.debtors;
    const organization = caseData.organizations;
    const creatorProfile = caseData.profiles;

    if (!debtor) {
      console.error('❌ [EMAIL API] Debtor not found for case');
      return NextResponse.json(
        { error: "Debtor not found" },
        { status: 404 }
      );
    }

    // Get invoice document if it exists
    let invoiceDocumentBuffer: Buffer | null = null;
    let invoiceDocumentName: string | null = null;

    const { data: attachment } = await supabase
      .from("case_attachments")
      .select("file_path, file_name")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (attachment?.file_path) {
      try {
        console.log('📧 [EMAIL API] Loading invoice document...');
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('case-attachments')
          .download(attachment.file_path);

        if (!downloadError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          invoiceDocumentBuffer = Buffer.from(arrayBuffer);
          invoiceDocumentName = attachment.file_name || 'invoice.pdf';
          console.log('✅ [EMAIL API] Invoice document loaded');
        } else {
          console.warn('⚠️ [EMAIL API] Could not download invoice document:', downloadError);
        }
      } catch (docError: any) {
        console.warn('⚠️ [EMAIL API] Error loading invoice document:', docError);
      }
    }

    // Generate PDF
    console.log('📧 [EMAIL API] Generating PDF...');
    const pdfBuffer = await generatePaymentRequestPDF({
      debtorName: debtor.name || debtor.company_name || "Debiteur",
      debtorAddress: {
        street: debtor.address_street || undefined,
        city: debtor.address_city || undefined,
        postalCode: debtor.address_postal_code || undefined,
        country: debtor.address_country || "BE",
      },
      structuredReference: caseData.structured_reference || "",
      principalAmount: caseData.principal_amount,
      additionalCosts: caseData.additional_costs || 0,
      totalAmount: caseData.total_amount,
      invoiceNumber: caseData.invoice_number || undefined,
      invoiceDate: caseData.invoice_date || undefined,
      dueDate: caseData.due_date || undefined,
    });
    console.log('✅ [EMAIL API] PDF generated');

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.auxiliumincasso.com';
    const paymentUrl = `${baseUrl}/pay/${caseId}?ref=${caseData.structured_reference}`;
    const caseUrl = `${baseUrl}/portal/cases/${caseId}`;
    const adminCaseUrl = `${baseUrl}/admin/cases/${caseId}`;

    const debtorName = debtor.name || debtor.company_name || "Debiteur";
    const clientName = creatorProfile?.full_name || organization?.name || "Klant";
    const clientEmail = creatorProfile?.email;
    const internalToEmail = process.env.ADMIN_CC_EMAIL || "admin@auxiliumincasso.com";

    // Prepare CC list for debtor email
    const ccEmails: string[] = [];
    if (clientEmail) {
      ccEmails.push(clientEmail);
    }
    if (internalToEmail) {
      ccEmails.push(internalToEmail);
    }

    // 1. Email to debtor
    console.log('📧 [EMAIL API] Sending email to debtor...');
    const debtorEmailHtml = generateDebtorEmail({
      debtorName,
      invoiceNumber: caseData.invoice_number || undefined,
      invoiceDate: caseData.invoice_date || undefined,
      dueDate: caseData.due_date || undefined,
      principalAmount: caseData.principal_amount,
      additionalCosts: caseData.additional_costs || 0,
      totalAmount: caseData.total_amount,
      structuredReference: caseData.structured_reference || "",
      paymentUrl,
    });

    const debtorAttachments = [
      {
        filename: `Betalingsverzoek_${caseData.structured_reference}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ];

    if (invoiceDocumentBuffer && invoiceDocumentName) {
      debtorAttachments.push({
        filename: invoiceDocumentName,
        content: invoiceDocumentBuffer,
        contentType: "application/pdf",
      });
    }

    await sendEmail({
      to: debtor.email,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: `Betalingsverzoek – Auxilium Incasso – Referentie ${caseData.structured_reference}`,
      html: debtorEmailHtml,
      attachments: debtorAttachments,
    });
    console.log('✅ [EMAIL API] Email sent to debtor');

    // 2. Email to client
    if (clientEmail) {
      console.log('📧 [EMAIL API] Sending email to client...');
      const clientEmailHtml = generateClientEmail({
        clientName,
        caseId,
        debtorName,
        invoiceNumber: caseData.invoice_number || undefined,
        invoiceDate: caseData.invoice_date || undefined,
        dueDate: caseData.due_date || undefined,
        principalAmount: caseData.principal_amount,
        additionalCosts: caseData.additional_costs || 0,
        totalAmount: caseData.total_amount,
        structuredReference: caseData.structured_reference || "",
        caseUrl,
      });

      await sendEmail({
        to: clientEmail,
        subject: `Opdracht ontvangen – Opdrachtnummer ${caseId}`,
        html: clientEmailHtml,
      });
      console.log('✅ [EMAIL API] Email sent to client');
    }

    // 3. Email to internal team
    console.log('📧 [EMAIL API] Sending email to internal team...');
    const internalEmailHtml = generateInternalEmail({
      caseId,
      organizationName: organization?.name || "Onbekend",
      clientName,
      debtorName,
      debtorEmail: debtor.email,
      invoiceNumber: caseData.invoice_number || undefined,
      invoiceDate: caseData.invoice_date || undefined,
      dueDate: caseData.due_date || undefined,
      principalAmount: caseData.principal_amount,
      additionalCosts: caseData.additional_costs || 0,
      totalAmount: caseData.total_amount,
      structuredReference: caseData.structured_reference || "",
      caseUrl: adminCaseUrl,
    });

    const internalAttachments = [
      {
        filename: `Betalingsverzoek_${caseData.structured_reference}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ];

    if (invoiceDocumentBuffer && invoiceDocumentName) {
      internalAttachments.push({
        filename: invoiceDocumentName,
        content: invoiceDocumentBuffer,
        contentType: "application/pdf",
      });
    }

    await sendEmail({
      to: internalToEmail,
      subject: `Nieuwe opdracht aangemaakt – ${caseId}`,
      html: internalEmailHtml,
      attachments: internalAttachments,
    });
    console.log('✅ [EMAIL API] Email sent to internal team');

    // Update case status to "sent"
    await supabase
      .from("cases")
      .update({ status: "sent" })
      .eq("id", caseId);

    // Create case event
    const { createCaseEvent } = await import("@/lib/cases/events");
    await createCaseEvent({
      caseId,
      actorProfileId: caseData.created_by,
      type: "email_sent",
      message: "Betalingsverzoek verzonden naar debiteur",
    });

    console.log('✅ [EMAIL API] All emails sent successfully');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ [EMAIL API] Error sending emails:', error);
    return NextResponse.json(
      { error: error.message || "Failed to send emails" },
      { status: 500 }
    );
  }
}

