import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    } = body;

    // Update invoice
    const { data: updatedInvoice, error } = await supabase
      .from("saved_invoices")
      .update({
        invoice_number,
        invoice_date,
        due_date: due_date || null,
        amount,
        currency: currency || 'EUR',
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

