import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      fullName,
      phone,
      company,
      vat,
      street,
      houseNumber,
      postalCode,
      city,
      country,
      password,
    } = body;

    // Validatie
    if (!email || !fullName || !phone || !company || !vat || !street || !houseNumber || !postalCode || !city || !country || !password) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Wachtwoord moet minimaal 8 tekens lang zijn" },
        { status: 400 }
      );
    }

    // Use service role for user creation
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

    // Check if user already exists
    const { data: existingUsers } = await supabaseService.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: "Dit email adres is al geregistreerd" },
        { status: 400 }
      );
    }

    // Create auth user (with email confirmation)
    const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Email moet bevestigd worden
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error('Auth creation error:', authError);
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

    const userId = authData.user.id;

    // Combine street and house number
    const fullAddress = `${street} ${houseNumber}`.trim();

    // Create organization
    const { data: organization, error: orgError } = await supabaseService
      .from("organizations")
      .insert({
        name: company,
        vat_number: vat,
        address_street: fullAddress,
        address_city: city,
        address_postal_code: postalCode,
        address_country: country,
        billing_email: email,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation error:', orgError);
      // Cleanup: delete auth user if org creation fails
      await supabaseService.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Kon organisatie niet aanmaken: ${orgError.message}` },
        { status: 500 }
      );
    }

    // Update profile with all information
    // Note: The trigger should have created a basic profile, but we'll update it
    const { error: profileError } = await supabaseService
      .from("profiles")
      .upsert({
        id: userId,
        role: 'client', // Automatisch klant rol
        full_name: fullName,
        phone: phone,
        organization_id: organization.id,
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Cleanup: delete org and auth user if profile update fails
      await supabaseService.from("organizations").delete().eq("id", organization.id);
      await supabaseService.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Kon profiel niet bijwerken: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Send confirmation email via Resend
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const redirectTo = `${appUrl}/api/auth/confirm`;
      
      // Generate confirmation link with redirect URL
      // Note: For signup links, password is required
      const { data: linkData, error: linkError } = await supabaseService.auth.admin.generateLink({
        type: 'signup',
        email: email,
        password: password, // Required for signup type
        options: {
          redirectTo: redirectTo,
        },
      });

      // Extract the confirmation link from Supabase
      // The action_link should contain the full Supabase confirmation URL
      // We'll use it directly, or construct our own callback URL
      let confirmationLink = linkData?.properties?.action_link;
      
      if (!confirmationLink && linkData?.properties?.hashed_token) {
        // Construct our own confirmation URL
        confirmationLink = `${appUrl}/api/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=signup`;
      } else if (!confirmationLink) {
        // Fallback
        confirmationLink = `${appUrl}/login`;
      } else {
        // Supabase link contains redirect_to parameter, we need to replace it with our callback
        try {
          const url = new URL(confirmationLink);
          url.searchParams.set('redirect_to', `${appUrl}/api/auth/confirm`);
          confirmationLink = url.toString();
        } catch (e) {
          // If URL parsing fails, use as-is
          console.warn('Could not parse confirmation link:', confirmationLink);
        }
      }

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div>
    <h1 style="color: #2563eb; margin-bottom: 20px;">
      Auxilium Incasso
    </h1>
    
    <p>Beste ${fullName},</p>
    
    <p>
      Bedankt voor uw registratie bij Auxilium Incasso! 
      Uw account is succesvol aangemaakt.
    </p>
    
    <p>
      Om uw account te activeren, klik op de onderstaande knop om uw email adres te bevestigen:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmationLink}" 
         style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Bevestig mijn account
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666">
      Of kopieer en plak deze link in uw browser:<br />
      <a href="${confirmationLink}" style="color: #2563eb; word-break: break-all;">${confirmationLink}</a>
    </p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #666">
        <strong>Uw accountgegevens:</strong><br />
        Email: ${email}<br />
        Bedrijf: ${company}
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666">
      Als u deze registratie niet heeft aangevraagd, neem dan contact met ons op.
    </p>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666">
      Met vriendelijke groet,<br />
      <strong>Auxilium Incasso</strong>
    </p>
  </div>
</body>
</html>`;

      await sendEmail({
        to: email,
        subject: "Welkom bij Auxilium Incasso - Bevestig uw account",
        html: emailHtml,
      });

      console.log('✅ Confirmation email sent to:', email);
    } catch (emailError: any) {
      console.warn('⚠️ Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
      // The user can request a new confirmation email later
    }

    console.log('✅ User registered successfully:', userId);
    console.log('✅ Organization created:', organization.id);

    return NextResponse.json({
      success: true,
      message: "Registratie succesvol! Er is een bevestigingsemail verstuurd.",
      userId: userId,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden bij de registratie" },
      { status: 500 }
    );
  }
}

