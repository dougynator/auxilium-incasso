import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestClient() {
  console.log('🚀 Creating test client account...\n');

  const clientEmail = 'douglas.laureys@hotmail.com';
  const clientPassword = 'Test123456'; // Change this if needed
  const clientName = 'Douglas Laureys';
  const organizationName = 'Test Organisatie';

  try {
    // 1. Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === clientEmail);

    if (existingUser) {
      console.log('⚠️  User already exists, updating...');
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: clientName,
          role: 'client',
        })
        .eq('id', existingUser.id);

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        throw profileError;
      }

      // Get or create organization
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', organizationName)
        .limit(1);

      let orgId = orgs?.[0]?.id;

      if (!orgId) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: organizationName,
            billing_email: clientEmail,
            address_country: 'BE',
          })
          .select('id')
          .single();

        if (orgError) {
          console.error('❌ Error creating organization:', orgError);
          throw orgError;
        }

        orgId = newOrg.id;
        console.log('✅ Organization created');
      }

      // Update profile with organization_id
      await supabase
        .from('profiles')
        .update({ organization_id: orgId })
        .eq('id', existingUser.id);

      console.log('\n✅ Test client account updated successfully!');
      console.log(`\n📧 Email: ${clientEmail}`);
      console.log(`🔑 Password: ${clientPassword}`);
      console.log(`\n🌐 Login URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`);
      return;
    }

    // 2. Create auth user
    console.log('📝 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password: clientPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User could not be created');
    }

    console.log('✅ Auth user created');

    // 3. Create organization
    console.log('📝 Creating organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        billing_email: clientEmail,
        address_country: 'BE',
      })
      .select('id')
      .single();

    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      // Try to delete auth user if org creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw orgError;
    }

    console.log('✅ Organization created');

    // 4. Create profile
    console.log('📝 Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: clientName,
        role: 'client',
        organization_id: org.id,
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      // Try to clean up
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('organizations').delete().eq('id', org.id);
      throw profileError;
    }

    console.log('✅ Profile created');

    console.log('\n✅ Test client account created successfully!');
    console.log(`\n📧 Email: ${clientEmail}`);
    console.log(`🔑 Password: ${clientPassword}`);
    console.log(`\n🌐 Login URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`);
    console.log('\n💡 You can now login and create a test case to verify emails are sent correctly.');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createTestClient();

