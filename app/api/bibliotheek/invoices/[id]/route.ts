import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get invoice
    const { data: invoice, error } = await supabase
      .from("saved_invoices")
      .select("*")
      .eq("id", params.id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Factuur niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error("Get invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const {
      invoice_number,
      invoice_date,
      due_date,
      amount,
      currency,
      debtor_name,
      debtor_email,
      debtor_vat_number,
      debtor_address_street,
      debtor_address_city,
      debtor_address_postal_code,
      debtor_address_country,
      debtor_type,
    } = body;

    // Initialize Supabase service client for debtor operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase service credentials');
      return NextResponse.json({ error: "Server configuratie fout" }, { status: 500 });
    }
    
    const supabaseService = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Check if debtor exists and create/update in bibliotheek if needed
    let debtorId = null;
    if (debtor_email) {
      // First check if debtor exists in saved_debtors for this organization
      const { data: existingSavedDebtor } = await supabaseService
        .from("saved_debtors")
        .select("debtor_id, id")
        .eq("organization_id", profile.organization_id)
        .eq("email", debtor_email)
        .single();

      if (existingSavedDebtor?.debtor_id) {
        debtorId = existingSavedDebtor.debtor_id;
        
        // Update existing saved_debtor entry
        await supabaseService
          .from("saved_debtors")
          .update({
            name: debtor_type === "particular" ? debtor_name : null,
            company_name: debtor_type === "company" ? debtor_name : null,
            email: debtor_email,
            vat_number: debtor_vat_number,
            address_street: debtor_address_street,
            address_city: debtor_address_city,
            address_postal_code: debtor_address_postal_code,
            address_country: debtor_address_country || 'BE',
            debtor_type: debtor_type || "particular",
          })
          .eq("id", existingSavedDebtor.id);
      } else {
        // Check if debtor exists in main debtors table
        const { data: existingDebtor } = await supabaseService
          .from("debtors")
          .select("id")
          .eq("email", debtor_email)
          .single();

        if (existingDebtor) {
          debtorId = existingDebtor.id;
          
          // Create saved_debtor entry even if debtor already exists
          await supabaseService
            .from("saved_debtors")
            .insert({
              organization_id: profile.organization_id,
              created_by: user.id,
              debtor_id: debtorId,
              name: debtor_type === "particular" ? debtor_name : null,
              company_name: debtor_type === "company" ? debtor_name : null,
              email: debtor_email,
              vat_number: debtor_vat_number,
              address_street: debtor_address_street,
              address_city: debtor_address_city,
              address_postal_code: debtor_address_postal_code,
              address_country: debtor_address_country || 'BE',
              debtor_type: debtor_type || "particular",
            });
        } else {
          // Create new debtor in main debtors table
          const { data: newDebtor, error: debtorError } = await supabaseService
            .from("debtors")
            .insert({
              name: debtor_type === "particular" ? debtor_name : null,
              company_name: debtor_type === "company" ? debtor_name : null,
              email: debtor_email,
              address_street: debtor_address_street,
              address_city: debtor_address_city,
              address_postal_code: debtor_address_postal_code,
              address_country: debtor_address_country || 'BE',
            })
            .select("id")
            .single();

          if (debtorError) {
            console.error('Debtor creation error:', debtorError);
          } else {
            debtorId = newDebtor.id;

            // Also create saved_debtor entry
            await supabaseService
              .from("saved_debtors")
              .insert({
                organization_id: profile.organization_id,
                created_by: user.id,
                debtor_id: debtorId,
                name: debtor_type === "particular" ? debtor_name : null,
                company_name: debtor_type === "company" ? debtor_name : null,
                email: debtor_email,
                vat_number: debtor_vat_number,
                address_street: debtor_address_street,
                address_city: debtor_address_city,
                address_postal_code: debtor_address_postal_code,
                address_country: debtor_address_country || 'BE',
                debtor_type: debtor_type || "particular",
              });
          }
        }
      }
    }

    // Update invoice
    const { data: updatedInvoice, error } = await supabase
      .from("saved_invoices")
      .update({
        invoice_number,
        invoice_date,
        due_date: due_date || null,
        amount,
        currency: currency || 'EUR',
        debtor_id: debtorId,
        debtor_name,
        debtor_email,
        debtor_vat_number,
        debtor_address_street,
        debtor_address_city,
        debtor_address_postal_code,
        debtor_address_country: debtor_address_country || 'BE',
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("organization_id", profile.organization_id)
      .select("*")
      .single();

    if (error) {
      console.error('Invoice update error:', error);
      return NextResponse.json({ error: "Kon factuur niet bijwerken" }, { status: 500 });
    }

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get invoice first to get document path
    const { data: invoice } = await supabase
      .from("saved_invoices")
      .select("document_path")
      .eq("id", params.id)
      .eq("organization_id", profile.organization_id)
      .single();

    // Delete invoice
    const { error } = await supabase
      .from("saved_invoices")
      .delete()
      .eq("id", params.id)
      .eq("organization_id", profile.organization_id);

    if (error) {
      console.error('Invoice delete error:', error);
      return NextResponse.json({ error: "Kon factuur niet verwijderen" }, { status: 500 });
    }

    // Optionally delete document from storage
    if (invoice?.document_path) {
      await supabase.storage
        .from('case-attachments')
        .remove([invoice.document_path]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

