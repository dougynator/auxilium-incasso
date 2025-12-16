import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ debtors: [] });
    }

    // Search saved debtors by name, company_name, or email
    const { data: debtors, error } = await supabase
      .from("saved_debtors")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: "Kon niet zoeken" }, { status: 500 });
    }

    return NextResponse.json({ debtors: debtors || [] });
  } catch (error: any) {
    console.error("Search debtors error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

