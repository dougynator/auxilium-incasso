import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractInvoiceData } from "@/lib/ai/invoice-parser";

// Force Node.js runtime for pdf-parse compatibility
export const runtime = 'nodejs';

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

    if (!profile || !profile.organization_id) {
      return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });
    }

    // Parse FormData
    const formData = await request.formData();
    const document = formData.get("document") as File | null;

    if (!document) {
      return NextResponse.json({ error: "Geen document geüpload" }, { status: 400 });
    }

    // Upload document to Supabase Storage
    const fileExt = document.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `bibliotheek/invoices/${profile.organization_id}/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await document.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('case-attachments')
      .upload(filePath, buffer, {
        contentType: document.type || 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
      
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'case-attachments');
      
      if (!bucketExists) {
        return NextResponse.json({ 
          error: "Storage bucket 'case-attachments' bestaat niet. Maak deze aan in Supabase Dashboard > Storage." 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: `Kon document niet uploaden: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Extract invoice data using AI
    let invoiceData;
    try {
      invoiceData = await extractInvoiceData(document);
      console.log('✅ Invoice data extracted:', invoiceData);
    } catch (extractError: any) {
      console.error('❌ Error extracting invoice data:', extractError);
      // Continue with empty data if extraction fails
      invoiceData = {
        currency: 'EUR',
        debtor_address_country: 'BE',
      };
    }

    // Check if debtor exists, if not create it, and ensure it's in saved_debtors
    let debtorId = null;
    if (invoiceData.debtor_email) {
      // First check if debtor exists in saved_debtors
      const { data: existingSavedDebtor } = await supabase
        .from("saved_debtors")
        .select("debtor_id")
        .eq("organization_id", profile.organization_id)
        .eq("email", invoiceData.debtor_email)
        .single();

      if (existingSavedDebtor?.debtor_id) {
        debtorId = existingSavedDebtor.debtor_id;
      } else {
        // Check if debtor exists in main debtors table
        const { data: existingDebtor } = await supabase
          .from("debtors")
          .select("id")
          .eq("email", invoiceData.debtor_email)
          .single();

        if (existingDebtor) {
          debtorId = existingDebtor.id;
          
          // Create saved_debtor entry even if debtor already exists
          await supabase
            .from("saved_debtors")
            .insert({
              organization_id: profile.organization_id,
              created_by: user.id,
              debtor_id: debtorId,
              name: invoiceData.debtor_name,
              company_name: invoiceData.debtor_company_name || invoiceData.debtor_name,
              email: invoiceData.debtor_email,
              vat_number: invoiceData.debtor_vat_number,
              address_street: invoiceData.debtor_address_street,
              address_city: invoiceData.debtor_address_city,
              address_postal_code: invoiceData.debtor_address_postal_code,
              address_country: invoiceData.debtor_address_country || 'BE',
            });
        } else {
          // Create new debtor
          const { data: newDebtor, error: debtorError } = await supabase
            .from("debtors")
            .insert({
              name: invoiceData.debtor_name || invoiceData.debtor_company_name,
              company_name: invoiceData.debtor_company_name,
              email: invoiceData.debtor_email,
              address_street: invoiceData.debtor_address_street,
              address_city: invoiceData.debtor_address_city,
              address_postal_code: invoiceData.debtor_address_postal_code,
              address_country: invoiceData.debtor_address_country || 'BE',
            })
            .select("id")
            .single();

          if (debtorError) {
            console.error('Debtor creation error:', debtorError);
          } else {
            debtorId = newDebtor.id;

            // Also create saved_debtor entry
            await supabase
              .from("saved_debtors")
              .insert({
                organization_id: profile.organization_id,
                created_by: user.id,
                debtor_id: debtorId,
                name: invoiceData.debtor_name,
                company_name: invoiceData.debtor_company_name || invoiceData.debtor_name,
                email: invoiceData.debtor_email,
                vat_number: invoiceData.debtor_vat_number,
                address_street: invoiceData.debtor_address_street,
                address_city: invoiceData.debtor_address_city,
                address_postal_code: invoiceData.debtor_address_postal_code,
                address_country: invoiceData.debtor_address_country || 'BE',
              });
          }
        }
      }
    }

    // Create saved invoice
    const { data: savedInvoice, error: invoiceError } = await supabase
      .from("saved_invoices")
      .insert({
        organization_id: profile.organization_id,
        created_by: user.id,
        invoice_number: invoiceData.invoice_number || '',
        invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoiceData.due_date || null,
        amount: invoiceData.amount || 0,
        currency: invoiceData.currency || 'EUR',
        debtor_id: debtorId,
        debtor_name: invoiceData.debtor_name || invoiceData.debtor_company_name,
        debtor_address_street: invoiceData.debtor_address_street,
        debtor_address_city: invoiceData.debtor_address_city,
        debtor_address_postal_code: invoiceData.debtor_address_postal_code,
        debtor_address_country: invoiceData.debtor_address_country || 'BE',
        debtor_vat_number: invoiceData.debtor_vat_number,
        debtor_email: invoiceData.debtor_email,
        document_path: filePath,
        document_name: document.name,
        extracted_data: invoiceData,
      })
      .select("*")
      .single();

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
      console.error('Invoice error details:', JSON.stringify(invoiceError, null, 2));
      
      // Check if table exists
      if (invoiceError.message?.includes('relation') || invoiceError.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: "Database tabel 'saved_invoices' bestaat niet. Voer de migration 005_bibliotheek_tables.sql uit in Supabase." 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: `Kon factuur niet opslaan: ${invoiceError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      invoice: savedInvoice
    });
  } catch (error: any) {
    console.error("Invoice save error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    if (!profile || !profile.organization_id) {
      return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });
    }

    // Get saved invoices
    const { data: invoices, error } = await supabase
      .from("saved_invoices")
      .select("*, debtors(*)")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Kon facturen niet ophalen" }, { status: 500 });
    }

    return NextResponse.json({ invoices: invoices || [] });
  } catch (error: any) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

