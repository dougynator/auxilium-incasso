import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    if (!email) {
      return NextResponse.json({ error: "E-mailadres is verplicht" }, { status: 400 });
    }

    // Check if debtor exists in main debtors table
    let debtorId = null;
    const { data: existingDebtor } = await supabase
      .from("debtors")
      .select("id")
      .eq("email", email)
      .single();

    if (existingDebtor) {
      debtorId = existingDebtor.id;
    } else {
      // Create new debtor
      const { data: newDebtor, error: debtorError } = await supabase
        .from("debtors")
        .insert({
          name: name,
          company_name: company_name,
          email: email,
          address_street: address_street,
          address_city: address_city,
          address_postal_code: address_postal_code,
          address_country: address_country || 'BE',
        })
        .select("id")
        .single();

      if (debtorError) {
        console.error('Debtor creation error:', debtorError);
      } else {
        debtorId = newDebtor.id;
      }
    }

    // Create or update saved_debtor
    const { data: savedDebtor, error } = await supabase
      .from("saved_debtors")
      .upsert({
        organization_id: profile.organization_id,
        created_by: user.id,
        debtor_id: debtorId,
        name: name,
        company_name: company_name,
        email: email,
        vat_number: vat_number,
        address_street: address_street,
        address_city: address_city,
        address_postal_code: address_postal_code,
        address_country: address_country || 'BE',
        phone: phone,
        notes: notes,
      }, {
        onConflict: 'organization_id,email',
      })
      .select("*")
      .single();

    if (error) {
      console.error('Saved debtor creation error:', error);
      return NextResponse.json({ error: "Kon relatie niet opslaan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, debtor: savedDebtor });
  } catch (error: any) {
    console.error("Debtor save error:", error);
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

    // Get saved debtors
    const { data: debtors, error } = await supabase
      .from("saved_debtors")
      .select("*, debtors(*)")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Kon relaties niet ophalen" }, { status: 500 });
    }

    return NextResponse.json({ debtors: debtors || [] });
  } catch (error: any) {
    console.error("Get debtors error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

