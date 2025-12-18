import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredReference } from "@/lib/utils";
import { createCaseEvent } from "@/lib/cases/events";
import { logAuditEvent } from "@/lib/audit";
import { sendEmail } from "@/lib/email/service";
import { generatePaymentRequestPDF } from "@/lib/pdf/generator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateDebtorEmail, generateClientEmail, generateInternalEmail } from "@/lib/email/templates";

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

    // Parse FormData
    const formData = await request.formData();
    const document = formData.get("document") as File | null;
    const dataString = formData.get("data") as string;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 Document received:', document ? `${document.name} (${document.size} bytes)` : 'No document');
      console.log('📦 Data string received:', dataString ? 'Yes' : 'No');
    }
    
    if (!dataString) {
      return NextResponse.json({ error: "Geen data ontvangen" }, { status: 400 });
    }

    const body = JSON.parse(dataString);

    // Helper function to combine street and house number
    const getFullStreet = () => {
      return body.debtorHouseNumber 
        ? `${body.debtorStreet || ""} ${body.debtorHouseNumber}`.trim()
        : body.debtorStreet || null;
    };

    const organizationId =
      profile.role === "client"
        ? profile.organization_id
        : body.organizationId || profile.organization_id;

    if (!organizationId) {
      return NextResponse.json({ error: "Organisatie is verplicht" }, { status: 400 });
    }

    // Create or find debtor
    let debtorId: string;

    // Use service role key for debtor operations to bypass RLS
    // This is a system operation, not a direct user action
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase service credentials');
      return NextResponse.json(
        { error: "Server configuratie fout" },
        { status: 500 }
      );
    }
    
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseService = createServiceClient(supabaseUrl, supabaseServiceKey);

    const { data: existingDebtor } = await supabaseService
      .from("debtors")
      .select("id")
      .eq("email", body.debtorEmail)
      .single();

    if (existingDebtor) {
      debtorId = existingDebtor.id;
      // Update debtor info
      await supabaseService.from("debtors").update({
        name: body.debtorNameOrCompany || null,
        company_name: body.debtorNameOrCompany || null,
        address_street: getFullStreet(),
        address_city: body.debtorCity || null,
        address_postal_code: body.debtorPostalCode || null,
        address_country: body.debtorCountry || "BE",
      }).eq("id", debtorId);
    } else {
      console.log('📝 Creating new debtor with data:', {
        name: body.debtorNameOrCompany,
        email: body.debtorEmail,
      });
      
      const { data: newDebtor, error: debtorError } = await supabaseService
        .from("debtors")
        .insert({
          name: body.debtorNameOrCompany || null,
          company_name: body.debtorNameOrCompany || null,
          email: body.debtorEmail,
          address_street: getFullStreet(),
          address_city: body.debtorCity || null,
          address_postal_code: body.debtorPostalCode || null,
          address_country: body.debtorCountry || "BE",
        })
        .select("id")
        .single();

      if (debtorError) {
        console.error('❌ Debtor creation error:', debtorError);
        return NextResponse.json(
          { error: `Kon debiteur niet aanmaken: ${debtorError.message}` },
          { status: 500 }
        );
      }

      if (!newDebtor) {
        console.error('❌ No debtor returned from insert');
        return NextResponse.json(
          { error: "Kon debiteur niet aanmaken: Geen data teruggekregen" },
          { status: 500 }
        );
      }

      console.log('✅ Debtor created successfully:', newDebtor.id);
      debtorId = newDebtor.id;
    }
    
    // Ensure debtor is saved in saved_debtors for this organization
    const { data: existingSavedDebtor } = await supabaseService
      .from("saved_debtors")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("debtor_id", debtorId)
      .single();
    
    if (!existingSavedDebtor) {
      // Create saved_debtor entry
      await supabaseService
        .from("saved_debtors")
        .insert({
          organization_id: organizationId,
          created_by: user.id,
          debtor_id: debtorId,
          name: body.debtorType === "particular" ? body.debtorNameOrCompany : null,
          company_name: body.debtorType === "company" ? body.debtorNameOrCompany : null,
          email: body.debtorEmail,
          vat_number: body.debtorVatNumber || null,
          address_street: getFullStreet(),
          address_city: body.debtorCity || null,
          address_postal_code: body.debtorPostalCode || null,
          address_country: body.debtorCountry || "BE",
          debtor_type: body.debtorType || "particular",
        });
      console.log('✅ Debtor saved to bibliotheek');
    } else {
      // Update existing saved_debtor entry
      await supabaseService
        .from("saved_debtors")
        .update({
          name: body.debtorType === "particular" ? body.debtorNameOrCompany : null,
          company_name: body.debtorType === "company" ? body.debtorNameOrCompany : null,
          email: body.debtorEmail,
          vat_number: body.debtorVatNumber || null,
          address_street: getFullStreet(),
          address_city: body.debtorCity || null,
          address_postal_code: body.debtorPostalCode || null,
          address_country: body.debtorCountry || "BE",
          debtor_type: body.debtorType || "particular",
        })
        .eq("id", existingSavedDebtor.id);
      console.log('✅ Saved debtor updated in bibliotheek');
    }

    // Calculate total amount
    const principalAmount = parseFloat(body.principalAmount);
    const additionalCosts = parseFloat(body.additionalCosts || "0");
    const totalAmount = principalAmount + additionalCosts;

    // Generate structured reference
    const structuredReference = generateStructuredReference("");

    // Create case
    console.log('📝 Creating case with data:', {
      organization_id: organizationId,
      debtor_id: debtorId,
      principal_amount: principalAmount,
      total_amount: totalAmount,
    });
    
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

    if (caseError) {
      console.error('❌ Case creation error:', caseError);
      return NextResponse.json(
        { error: `Kon opdracht niet aanmaken: ${caseError.message}` },
        { status: 500 }
      );
    }

    if (!newCase) {
      console.error('❌ No case returned from insert');
      return NextResponse.json(
        { error: "Kon opdracht niet aanmaken: Geen data teruggekregen" },
        { status: 500 }
      );
    }

    console.log('✅ Case created successfully:', newCase.id);

    // Upload document if provided
    if (document) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('📤 Starting file upload:', document.name, document.size, document.type);
        }

        // Convert File to ArrayBuffer
        const arrayBuffer = await document.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ File converted to buffer:', buffer.length, 'bytes');
        }
        
        // Generate unique filename
        const fileExt = document.name.split('.').pop();
        const fileName = `${newCase.id}/${Date.now()}.${fileExt}`;
        const filePath = fileName;

        if (process.env.NODE_ENV === 'development') {
          console.log('📁 File path:', filePath);
        }

        // Upload to Supabase Storage (using service role for upload)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('❌ Missing Supabase credentials');
          throw new Error('Supabase credentials niet gevonden');
        }
        
        const { createClient: createServiceClient } = await import('@supabase/supabase-js');
        const supabaseService = createServiceClient(supabaseUrl, supabaseServiceKey);

        // Check if bucket exists
        const { data: buckets, error: listError } = await supabaseService.storage.listBuckets();
        
        if (listError) {
          console.error('❌ Error listing buckets:', listError);
        }
        
        const bucketExists = buckets?.some(b => b.name === 'case-attachments');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🪣 Bucket exists:', bucketExists);
        }
        
        if (!bucketExists) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Bucket not found, attempting to create...');
          }
          // Create bucket if it doesn't exist
          const { error: createError } = await supabaseService.storage.createBucket('case-attachments', {
            public: false,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
          });
          
          if (createError) {
            console.error('❌ Failed to create bucket:', createError);
            throw new Error(`Kon storage bucket niet aanmaken: ${createError.message}`);
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Bucket created successfully');
            }
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('⬆️ Uploading file to storage...');
        }

        const { data: uploadData, error: uploadError } = await supabaseService.storage
          .from('case-attachments')
          .upload(filePath, buffer, {
            contentType: document.type || 'application/octet-stream',
            upsert: false,
          });

        if (uploadError) {
          console.error('❌ File upload error:', uploadError);
          throw new Error(`Kon bestand niet uploaden: ${uploadError.message}`);
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ File uploaded successfully:', uploadData?.path);
        }

        // Create attachment record
        const { error: attachmentError } = await supabase
          .from('case_attachments')
          .insert({
            case_id: newCase.id,
            uploaded_by: user.id,
            file_path: filePath,
            file_name: document.name,
            mime_type: document.type || null,
            size: document.size,
          });
        
        if (attachmentError) {
          console.error('❌ Attachment record error:', attachmentError);
          throw new Error(`Kon attachment record niet aanmaken: ${attachmentError.message}`);
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Attachment record created');
        }

        // Save invoice to bibliotheek if it doesn't exist yet (after document upload)
        if (body.invoiceNumber) {
          // Check if invoice already exists in saved_invoices
          const { data: existingInvoice } = await supabaseService
            .from("saved_invoices")
            .select("id")
            .eq("organization_id", organizationId)
            .eq("invoice_number", body.invoiceNumber)
            .single();

          if (!existingInvoice) {
            // Create saved invoice entry with document path
            const { error: savedInvoiceError } = await supabaseService
              .from("saved_invoices")
              .insert({
                organization_id: organizationId,
                created_by: user.id,
                invoice_number: body.invoiceNumber,
                invoice_date: body.invoiceDate || new Date().toISOString().split('T')[0],
                due_date: body.dueDate || null,
                amount: principalAmount,
                currency: "EUR",
                debtor_id: debtorId,
                debtor_name: body.debtorNameOrCompany || null,
                debtor_email: body.debtorEmail,
                debtor_vat_number: body.debtorVatNumber || null,
                debtor_address_street: getFullStreet(),
                debtor_address_city: body.debtorCity || null,
                debtor_address_postal_code: body.debtorPostalCode || null,
                debtor_address_country: body.debtorCountry || "BE",
                document_path: filePath,
                document_name: document.name,
              });

            if (savedInvoiceError) {
              console.error('⚠️ Could not save invoice to bibliotheek:', savedInvoiceError);
              // Don't fail case creation if invoice save fails
            } else {
              console.log('✅ Invoice saved to bibliotheek');
            }
          }
        }
      } catch (fileError: any) {
        console.error('❌ File processing error:', fileError);
        // Return error to user instead of silently failing
        return NextResponse.json(
          { error: `Bestand upload mislukt: ${fileError.message || 'Onbekende fout'}` },
          { status: 500 }
        );
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ No document provided in request');
      }

      // Save invoice to bibliotheek even without document (if invoice number exists)
      if (body.invoiceNumber) {
        // Check if invoice already exists in saved_invoices
        const { data: existingInvoice } = await supabaseService
          .from("saved_invoices")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("invoice_number", body.invoiceNumber)
          .single();

        if (!existingInvoice) {
          // Create saved invoice entry without document
          const { error: savedInvoiceError } = await supabaseService
            .from("saved_invoices")
            .insert({
              organization_id: organizationId,
              created_by: user.id,
              invoice_number: body.invoiceNumber,
              invoice_date: body.invoiceDate || new Date().toISOString().split('T')[0],
              due_date: body.dueDate || null,
              amount: principalAmount,
              currency: "EUR",
              debtor_id: debtorId,
              debtor_name: body.debtorType === "particular" ? body.debtorNameOrCompany : null,
              debtor_company_name: body.debtorType === "company" ? body.debtorNameOrCompany : null,
              debtor_email: body.debtorEmail,
              debtor_vat_number: body.debtorVatNumber || null,
              debtor_address_street: body.debtorStreet || null,
              debtor_address_city: body.debtorCity || null,
              debtor_address_postal_code: body.debtorPostalCode || null,
              debtor_address_country: body.debtorCountry || "BE",
              document_path: null,
              document_name: null,
            });

          if (savedInvoiceError) {
            console.error('⚠️ Could not save invoice to bibliotheek:', savedInvoiceError);
            // Don't fail case creation if invoice save fails
          } else {
            console.log('✅ Invoice saved to bibliotheek (without document)');
          }
        }
      }
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
    console.log('📧 Fetching debtor data for emails...');
    const { data: debtor, error: debtorError } = await supabase
      .from("debtors")
      .select("*")
      .eq("id", debtorId)
      .single();

    if (debtorError) {
      console.error('❌ Error fetching debtor:', debtorError);
    } else {
      console.log('✅ Debtor found:', debtor?.name || debtor?.company_name);
    }

    // Return success immediately, send email asynchronously
    console.log('✅ Case created, preparing async email send...');
    console.log('📧 Debtor email:', body.debtorEmail);
    console.log('📧 Client email:', user.email);
    
    // Send email asynchronously (don't wait for it)
    // Note: We pass the supabase client and other needed variables to avoid scope issues
    (async () => {
      try {
        console.log('📧 Starting async email generation...');
        console.log('📧 Case ID:', newCase.id);
        console.log('📧 User ID:', user.id);
        console.log('📧 Organization ID:', organizationId);
        
        // Check if RESEND_API_KEY is set
        if (!process.env.RESEND_API_KEY) {
          console.error('❌ RESEND_API_KEY is not set in environment variables!');
          console.error('❌ Emails will not be sent. Please set RESEND_API_KEY in Vercel environment variables.');
          return;
        }
        
        console.log('✅ RESEND_API_KEY is set');
        
        // Reuse the existing supabase client (it's already authenticated)
        const asyncSupabase = supabase;
        
        // Get organization and profile data first (needed for CC)
        const { data: organization } = await asyncSupabase
          .from("organizations")
          .select("name, billing_email")
          .eq("id", organizationId)
          .single();

        const { data: clientProfile } = await asyncSupabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        // Use login email of the user who created the case
        const clientEmail = user.email;

        // Get the uploaded invoice document if it exists
        let invoiceDocumentBuffer: Buffer | null = null;
        let invoiceDocumentName: string | null = null;
        
        if (document) {
          try {
            // Get the attachment record to find the file path
            const { data: attachment } = await asyncSupabase
              .from("case_attachments")
              .select("file_path, file_name")
              .eq("case_id", newCase.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (attachment?.file_path) {
              // Download the file from Supabase Storage using service client
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
              const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
              const { createClient: createServiceClient } = await import('@supabase/supabase-js');
              const supabaseService = createServiceClient(supabaseUrl, supabaseServiceKey);

              const { data: fileData, error: downloadError } = await supabaseService.storage
                .from('case-attachments')
                .download(attachment.file_path);

              if (!downloadError && fileData) {
                const arrayBuffer = await fileData.arrayBuffer();
                invoiceDocumentBuffer = Buffer.from(arrayBuffer);
                invoiceDocumentName = attachment.file_name || document.name;
                console.log('✅ Invoice document loaded for email attachment');
              } else {
                console.warn('⚠️ Could not download invoice document:', downloadError);
              }
            }
          } catch (docError: any) {
            console.warn('⚠️ Error loading invoice document for email:', docError);
            // Continue without invoice attachment if it fails
          }
        }
        
        // Generate PDF
        console.log('📧 Generating PDF...');
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

        console.log('✅ PDF generated, size:', pdfBuffer.length, 'bytes');

        // Generate URLs
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.auxiliumincasso.com';
        const paymentUrl = `${baseUrl}/pay/${newCase.id}?ref=${structuredReference}`;
        const caseUrl = `${baseUrl}/portal/cases/${newCase.id}`;
        const adminCaseUrl = `${baseUrl}/admin/cases/${newCase.id}`;
        
        console.log('📧 URLs generated:', { paymentUrl, caseUrl, adminCaseUrl });

        const debtorName = debtor?.name || debtor?.company_name || "Debiteur";
        const clientName = clientProfile?.full_name || organization?.name || "Klant";
        const internalToEmail = process.env.ADMIN_CC_EMAIL || "admin@auxiliumincasso.com";

        // Prepare CC list for debtor email (client login email + internal)
        const ccEmails: string[] = [];
        if (clientEmail) {
          ccEmails.push(clientEmail);
        }
        if (internalToEmail) {
          ccEmails.push(internalToEmail);
        }

        // 1. Email naar debiteur (met PDF attachment + factuur als bijlage + CC)
        const debtorEmailHtml = generateDebtorEmail({
          debtorName,
          invoiceNumber: body.invoiceNumber,
          invoiceDate: body.invoiceDate,
          dueDate: body.dueDate,
          principalAmount,
          additionalCosts,
          totalAmount,
          structuredReference,
          paymentUrl,
        });

        const debtorAttachments = [
          {
            filename: `Betalingsverzoek_${structuredReference}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ];

        // Add invoice document if available
        if (invoiceDocumentBuffer && invoiceDocumentName) {
          debtorAttachments.push({
            filename: invoiceDocumentName,
            content: invoiceDocumentBuffer,
            contentType: "application/pdf",
          });
        }

        await sendEmail({
          to: body.debtorEmail,
          cc: ccEmails.length > 0 ? ccEmails : undefined,
          subject: `Betalingsverzoek – Auxilium Incasso – Referentie ${structuredReference}`,
          html: debtorEmailHtml,
          attachments: debtorAttachments,
        });

        console.log('✅ Email sent to debtor with attachments and CC');

        // 2. Email naar klant (apart, zonder PDF) - naar login email van gebruiker die opdracht heeft aangemaakt
        if (clientEmail) {
          const clientEmailHtml = generateClientEmail({
            clientName,
            caseId: newCase.id,
            debtorName,
            invoiceNumber: body.invoiceNumber,
            invoiceDate: body.invoiceDate,
            dueDate: body.dueDate,
            principalAmount,
            additionalCosts,
            totalAmount,
            structuredReference,
            caseUrl,
          });

          await sendEmail({
            to: clientEmail,
            subject: `Opdracht ontvangen – Opdrachtnummer ${newCase.id}`,
            html: clientEmailHtml,
          });

          console.log('✅ Email sent to client');
        }

        // 3. Email intern naar ons (met alle details + bijlagen)
        const internalEmailHtml = generateInternalEmail({
          caseId: newCase.id,
          organizationName: organization?.name || "Onbekend",
          clientName,
          debtorName,
          debtorEmail: body.debtorEmail,
          invoiceNumber: body.invoiceNumber,
          invoiceDate: body.invoiceDate,
          dueDate: body.dueDate,
          principalAmount,
          additionalCosts,
          totalAmount,
          structuredReference,
          caseUrl: adminCaseUrl,
        });

        const internalAttachments = [
          {
            filename: `Betalingsverzoek_${structuredReference}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ];

        // Add invoice document if available
        if (invoiceDocumentBuffer && invoiceDocumentName) {
          internalAttachments.push({
            filename: invoiceDocumentName,
            content: invoiceDocumentBuffer,
            contentType: "application/pdf",
          });
        }
        
        await sendEmail({
          to: internalToEmail,
          subject: `Nieuwe opdracht aangemaakt – ${newCase.id}`,
          html: internalEmailHtml,
          attachments: internalAttachments,
        });

        console.log('✅ Email sent to internal team with attachments');

        // Update case status to "sent" and create event
        await asyncSupabase
          .from("cases")
          .update({ status: "sent" })
          .eq("id", newCase.id);

        await createCaseEvent({
          caseId: newCase.id,
          actorProfileId: user.id,
          type: "email_sent",
          message: "Betalingsverzoek verzonden naar debiteur",
        });

        console.log('✅ All emails sent successfully');
      } catch (emailError: any) {
        console.error('❌ Error sending email (non-blocking):', emailError);
        console.error('❌ Error details:', {
          message: emailError.message,
          stack: emailError.stack,
          response: emailError.response?.data || emailError.response,
        });
        // Don't fail the case creation if email fails, but log extensively
      }
    })();

    console.log('✅ Case creation completed successfully, returning response');
    
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

