import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, fullName, role, organizationId, organizationName } = body;

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Email, wachtwoord, naam en rol zijn verplicht" },
        { status: 400 }
      );
    }

    // Use service role for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuratie fout" },
        { status: 500 }
      );
    }

    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseService = createServiceClient(supabaseUrl, supabaseServiceKey);

    let finalOrganizationId: string | null = null;

    // Handle organization for client role
    if (role === "client") {
      if (organizationId) {
        // Use existing organization
        finalOrganizationId = organizationId;
      } else if (organizationName) {
        // Create new organization using service role (bypasses RLS)
        const { data: newOrg, error: orgError } = await supabaseService
          .from("organizations")
          .insert({
            name: organizationName,
            billing_email: email,
            address_country: "BE",
          })
          .select("id")
          .single();

        if (orgError) {
          return NextResponse.json(
            { error: `Kon organisatie niet aanmaken: ${orgError.message}` },
            { status: 500 }
          );
        }

        finalOrganizationId = newOrg.id;
      } else {
        return NextResponse.json(
          { error: "Organisatie is verplicht voor client accounts" },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseService.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      // User already exists, use existing ID
      userId = existingUser.id;
      
      // Update password if provided
      if (password) {
        await supabaseService.auth.admin.updateUserById(userId, {
          password: password,
        });
      }
    } else {
      // Create new auth user using service role
      const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        // If auth creation fails and we created an org, try to clean it up
        if (finalOrganizationId && role === "client" && !organizationId) {
          await supabaseService.from("organizations").delete().eq("id", finalOrganizationId);
        }
        return NextResponse.json(
          { error: `Kon gebruiker niet aanmaken: ${authError.message}` },
          { status: 500 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: "Gebruiker kon niet worden aangemaakt" },
          { status: 500 }
        );
      }

      userId = authData.user.id;
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseService
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: profileError } = await supabaseService
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          organization_id: finalOrganizationId,
        })
        .eq("id", userId);

      if (profileError) {
        return NextResponse.json(
          { error: `Kon profiel niet bijwerken: ${profileError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Create new profile using service role (bypasses RLS)
      const { error: profileError } = await supabaseService
        .from("profiles")
        .insert({
          id: userId,
          full_name: fullName,
          role,
          organization_id: finalOrganizationId,
        });

      if (profileError) {
        // Cleanup: delete auth user and org if created (only if user was just created)
        if (!existingUser) {
          await supabaseService.auth.admin.deleteUser(userId);
        }
        if (finalOrganizationId && role === "client" && !organizationId) {
          await supabaseService.from("organizations").delete().eq("id", finalOrganizationId);
        }
        return NextResponse.json(
          { error: `Kon profiel niet aanmaken: ${profileError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      userId: userId,
      message: existingUser ? "Gebruiker succesvol bijgewerkt" : "Gebruiker succesvol aangemaakt",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

