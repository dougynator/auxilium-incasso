import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Starting seed...');

  try {
    // Create admin user
    const adminEmail = 'admin@auxiliumincasso.com';
    const adminPassword = 'admin123'; // Change in production!

    const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (adminAuthError && adminAuthError.message !== 'User already registered') {
      throw adminAuthError;
    }

    let adminUserId = adminAuth?.user?.id;
    if (!adminUserId) {
      // User already exists, get it
      const { data: existingAdmin } = await supabase.auth.admin.listUsers();
      const adminUser = existingAdmin.users.find(u => u.email === adminEmail);
      adminUserId = adminUser?.id;
    }

    if (!adminUserId) {
      throw new Error('Could not create or find admin user');
    }

    // Ensure admin profile exists and has admin role
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUserId)
      .single();
    
    if (existingProfile) {
      // Update if exists
      await supabase
        .from('profiles')
        .update({
          role: 'admin',
          full_name: 'Admin Gebruiker',
        })
        .eq('id', adminUserId);
    } else {
      // Insert if doesn't exist
      await supabase
        .from('profiles')
        .insert({
          id: adminUserId,
          role: 'admin',
          full_name: 'Admin Gebruiker',
        });
    }

    console.log('✓ Admin user created');

    // Create staff user
    const staffEmail = 'staff@auxiliumincasso.com';
    const staffPassword = 'staff123'; // Change in production!

    const { data: staffAuth, error: staffAuthError } = await supabase.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
    });

    if (staffAuthError && staffAuthError.message !== 'User already registered') {
      throw staffAuthError;
    }

    let staffUserId = staffAuth?.user?.id;
    if (!staffUserId) {
      const { data: existingStaff } = await supabase.auth.admin.listUsers();
      const staffUser = existingStaff.users.find(u => u.email === staffEmail);
      staffUserId = staffUser?.id;
    }

    if (staffUserId) {
      await supabase
        .from('profiles')
        .update({
          role: 'staff',
          full_name: 'Medewerker',
        })
        .eq('id', staffUserId);

      console.log('✓ Staff user created');
    }

    // Create client organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Voorbeeld BVBA',
        vat_number: 'BE0123456789',
        billing_email: 'billing@voorbeeld.be',
        address_street: 'Voorbeeldstraat 1',
        address_city: 'Brussel',
        address_postal_code: '1000',
        address_country: 'BE',
      })
      .select()
      .single();

    if (orgError && !orgError.message.includes('duplicate')) {
      throw orgError;
    }

    const orgId = org?.id || (await supabase.from('organizations').select('id').eq('name', 'Voorbeeld BVBA').single()).data?.id;

    if (!orgId) {
      throw new Error('Could not create organization');
    }

    console.log('✓ Organization created');

    // Create client user
    const clientEmail = 'client@voorbeeld.be';
    const clientPassword = 'client123'; // Change in production!

    const { data: clientAuth, error: clientAuthError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password: clientPassword,
      email_confirm: true,
    });

    if (clientAuthError && clientAuthError.message !== 'User already registered') {
      throw clientAuthError;
    }

    let clientUserId = clientAuth?.user?.id;
    if (!clientUserId) {
      const { data: existingClient } = await supabase.auth.admin.listUsers();
      const clientUser = existingClient.users.find(u => u.email === clientEmail);
      clientUserId = clientUser?.id;
    }

    if (clientUserId) {
      await supabase
        .from('profiles')
        .update({
          role: 'client',
          full_name: 'Klant Gebruiker',
          organization_id: orgId,
        })
        .eq('id', clientUserId);

      console.log('✓ Client user created');
    }

    // Create sample debtor
    const { data: debtor, error: debtorError } = await supabase
      .from('debtors')
      .insert({
        name: 'Jan Janssen',
        email: 'jan.janssen@example.com',
        address_street: 'Debiteurstraat 10',
        address_city: 'Antwerpen',
        address_postal_code: '2000',
        address_country: 'BE',
      })
      .select()
      .single();

    if (debtorError && !debtorError.message.includes('duplicate')) {
      throw debtorError;
    }

    const debtorId = debtor?.id || (await supabase.from('debtors').select('id').eq('email', 'jan.janssen@example.com').single()).data?.id;

    if (!debtorId) {
      throw new Error('Could not create debtor');
    }

    console.log('✓ Debtor created');

    // Create sample case
    if (clientUserId && orgId && debtorId) {
      const { data: caseItem, error: caseError } = await supabase
        .from('cases')
        .insert({
          organization_id: orgId,
          debtor_id: debtorId,
          created_by: clientUserId,
          status: 'sent',
          principal_amount: 1000,
          additional_costs: 50,
          total_amount: 1050,
          currency: 'EUR',
          structured_reference: '+++123/4567/89012+++',
          invoice_number: 'INV-2024-001',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        .select()
        .single();

      if (caseError && !caseError.message.includes('duplicate')) {
        throw caseError;
      }

      if (caseItem) {
        // Create case event
        await supabase.from('case_events').insert({
          case_id: caseItem.id,
          actor_profile_id: clientUserId,
          type: 'created',
          message: 'Opdracht aangemaakt',
        });

        console.log('✓ Sample case created');
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin:', adminEmail, '/', adminPassword);
    console.log('Staff:', staffEmail, '/', staffPassword);
    console.log('Client:', clientEmail, '/', clientPassword);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

