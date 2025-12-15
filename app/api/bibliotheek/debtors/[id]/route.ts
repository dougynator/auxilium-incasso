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

    // Get debtor
    const { data: debtor, error } = await supabase
      .from("saved_debtors")
      .select("*")
      .eq("id", params.id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (error || !debtor) {
      return NextResponse.json({ error: "Relatie niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({ debtor });
  } catch (error: any) {
    console.error("Get debtor error:", error);
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
      name,
      company_name,
      email,
      vat_number,
      address_street,
      address_city,
      address_postal_code,
      address_country,
      phone,
      notes,
    } = body;

    // Update debtor
    const { data: updatedDebtor, error } = await supabase
      .from("saved_debtors")
      .update({
        name,
        company_name,
        email,
        vat_number,
        address_street,
        address_city,
        address_postal_code,
        address_country: address_country || 'BE',
        phone,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("organization_id", profile.organization_id)
      .select("*")
      .single();

    if (error) {
      console.error('Debtor update error:', error);
      return NextResponse.json({ error: "Kon relatie niet bijwerken" }, { status: 500 });
    }

    return NextResponse.json({ success: true, debtor: updatedDebtor });
  } catch (error: any) {
    console.error("Update debtor error:", error);
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

    // Delete debtor
    const { error } = await supabase
      .from("saved_debtors")
      .delete()
      .eq("id", params.id)
      .eq("organization_id", profile.organization_id);

    if (error) {
      console.error('Debtor delete error:', error);
      return NextResponse.json({ error: "Kon relatie niet verwijderen" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete debtor error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

