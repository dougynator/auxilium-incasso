import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendEmail } from "@/lib/email/service";
import { generatePaymentRequestPDF } from "@/lib/pdf/generator";
import { generateDebtorEmail, generateClientEmail, generateInternalEmail } from "@/lib/email/templates";

export async function sendCaseEmails(caseId: string): Promise<void> {
  console.log('📧 [EMAIL] Starting email send for case:', caseId);
  
  // Check if RESEND_API_KEY is set
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ [EMAIL] RESEND_API_KEY is not set!');
    throw new Error("Email service not configured");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ [EMAIL] Missing Supabase credentials');
    throw new Error("Server configuration error");
  }

  const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

  // Fetch case with all related data
  console.log('📧 [EMAIL] Fetching case data...');
  console.log('📧 [EMAIL] Case ID:', caseId);
  
  let caseData: any;
  
  try {
    console.log('📧 [EMAIL] Executing Supabase query...');
    const queryStart = Date.now();
    
    const { data: queryData, error: caseError } = await supabase
      .from("cases")
      .select(`
        *,
        debtors(*),
        organizations(name, billing_email),
        profiles!cases_created_by_fkey(full_name, id)
      `)
      .eq("id", caseId)
      .single();

    const queryDuration = Date.now() - queryStart;
    console.log(`📧 [EMAIL] Case query completed in ${queryDuration}ms`);
    console.log('📧 [EMAIL] Has data:', !!queryData);
    console.log('📧 [EMAIL] Has error:', !!caseError);
    
    if (caseError) {
      console.error('❌ [EMAIL] Error fetching case:', {
        message: caseError.message,
        details: caseError.details,
        hint: caseError.hint,
        code: caseError.code,
      });
      throw new Error(`Case not found: ${caseError.message}`);
    }

    if (!queryData) {
      console.error('❌ [EMAIL] No case data returned');
      throw new Error("Case not found");
    }

    caseData = queryData;
    console.log('✅ [EMAIL] Case found:', caseData.id);
  } catch (queryError: any) {
    console.error('❌ [EMAIL] Exception while fetching case:', {
      message: queryError.message,
      stack: queryError.stack,
      name: queryError.name,
    });
    throw queryError;
  }

  const debtor = caseData.debtors;
  const organization = caseData.organizations;
  const creatorProfile = caseData.profiles;

  if (!debtor) {
    console.error('❌ [EMAIL] Debtor not found for case');
    throw new Error("Debtor not found");
  }

  // Get creator email from auth.users table
  let clientEmail: string | undefined;
  if (creatorProfile?.id) {
    console.log('📧 [EMAIL] Fetching creator email from auth...');
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(creatorProfile.id);
      if (!authError && authUser?.user?.email) {
        clientEmail = authUser.user.email;
        console.log('✅ [EMAIL] Creator email found:', clientEmail);
      } else {
        console.warn('⚠️ [EMAIL] Could not fetch creator email:', authError);
      }
    } catch (authErr: any) {
      console.warn('⚠️ [EMAIL] Error fetching creator email:', authErr);
    }
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
      console.log('📧 [EMAIL] Loading invoice document...');
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('case-attachments')
        .download(attachment.file_path);

      if (!downloadError && fileData) {
        const arrayBuffer = await fileData.arrayBuffer();
        invoiceDocumentBuffer = Buffer.from(arrayBuffer);
        invoiceDocumentName = attachment.file_name || 'invoice.pdf';
        console.log('✅ [EMAIL] Invoice document loaded');
      } else {
        console.warn('⚠️ [EMAIL] Could not download invoice document:', downloadError);
      }
    } catch (docError: any) {
      console.warn('⚠️ [EMAIL] Error loading invoice document:', docError);
    }
  }

  // Generate PDF
  console.log('📧 [EMAIL] Generating PDF...');
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generatePaymentRequestPDF({
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
    console.log('✅ [EMAIL] PDF generated');
  } catch (pdfError: any) {
    console.error('❌ [EMAIL] PDF generation failed:', pdfError);
    console.error('❌ [EMAIL] PDF error details:', {
      message: pdfError.message,
      stack: pdfError.stack,
      name: pdfError.name,
    });
    // Create a minimal PDF buffer or skip PDF attachment
    // For now, we'll throw the error to prevent sending emails without PDF
    throw new Error(`PDF generation failed: ${pdfError.message}`);
  }

  // Generate URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.auxiliumincasso.com';
  const paymentUrl = `${baseUrl}/pay/${caseId}?ref=${caseData.structured_reference}`;
  const caseUrl = `${baseUrl}/portal/cases/${caseId}`;
  const adminCaseUrl = `${baseUrl}/admin/cases/${caseId}`;

  const debtorName = debtor.name || debtor.company_name || "Debiteur";
  const clientName = creatorProfile?.full_name || organization?.name || "Klant";
  // clientEmail is already fetched above from auth.users
  const internalToEmail = process.env.ADMIN_CC_EMAIL || "admin@auxiliumincasso.com";

  // Log email addresses for debugging
  console.log('📧 [EMAIL] Email addresses:');
  console.log('  - Debtor email:', debtor.email);
  console.log('  - Client email:', clientEmail);
  console.log('  - Admin email:', internalToEmail);

  // Prepare CC list for debtor email
  const ccEmails: string[] = [];
  if (clientEmail) {
    ccEmails.push(clientEmail);
  }
  if (internalToEmail) {
    ccEmails.push(internalToEmail);
  }

  // 1. Email to debtor
  console.log('📧 [EMAIL] Sending email to debtor...');
  console.log('📧 [EMAIL] Debtor email address:', debtor.email);
  if (!debtor.email) {
    console.error('❌ [EMAIL] Debtor email is missing!');
    throw new Error("Debtor email address is required");
  }
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

  try {
    await sendEmail({
      to: debtor.email,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: `Betalingsverzoek – Auxilium Incasso – Referentie ${caseData.structured_reference}`,
      html: debtorEmailHtml,
      attachments: debtorAttachments,
    });
    console.log('✅ [EMAIL] Email sent to debtor');
  } catch (debtorEmailError: any) {
    console.error('❌ [EMAIL] Failed to send email to debtor:', {
      error: debtorEmailError.message,
      debtorEmail: debtor.email,
      ccEmails,
    });
    // Don't throw - continue with other emails
  }

  // 2. Email to client
  if (clientEmail) {
    console.log('📧 [EMAIL] Sending email to client...');
    console.log('📧 [EMAIL] Client email address:', clientEmail);
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

    try {
      await sendEmail({
        to: clientEmail,
        subject: `Opdracht ontvangen – Opdrachtnummer ${caseId}`,
        html: clientEmailHtml,
      });
      console.log('✅ [EMAIL] Email sent to client');
    } catch (clientEmailError: any) {
      console.error('❌ [EMAIL] Failed to send email to client:', {
        error: clientEmailError.message,
        clientEmail,
      });
      // Don't throw - continue with other emails
    }
  }

  // 3. Email to internal team
  console.log('📧 [EMAIL] Sending email to internal team...');
  console.log('📧 [EMAIL] Admin email address:', internalToEmail);
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

  try {
    await sendEmail({
      to: internalToEmail,
      subject: `Nieuwe opdracht aangemaakt – ${caseId}`,
      html: internalEmailHtml,
      attachments: internalAttachments,
    });
    console.log('✅ [EMAIL] Email sent to internal team');
  } catch (adminEmailError: any) {
    console.error('❌ [EMAIL] Failed to send email to admin:', {
      error: adminEmailError.message,
      adminEmail: internalToEmail,
    });
    // Don't throw - at least client email was sent
  }

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

  console.log('✅ [EMAIL] All emails sent successfully');
}

