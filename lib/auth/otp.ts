import * as bcrypt from 'bcryptjs';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5');

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTPChallenge(userId: string): Promise<string> {
  const code = generateOTP();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  // Use service role key to bypass RLS for OTP creation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Invalidate any existing OTP challenges for this user
  await supabase
    .from('otp_challenges')
    .update({ consumed_at: new Date().toISOString() })
    .eq('profile_id', userId)
    .is('consumed_at', null);

  // Create new OTP challenge
  const { error } = await supabase
    .from('otp_challenges')
    .insert({
      profile_id: userId,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
    });

  if (error) {
    throw new Error('Failed to create OTP challenge');
  }

  return code;
}

export async function verifyOTP(userId: string, code: string): Promise<boolean> {
  // Use service role key to bypass RLS for OTP verification
  // This is safe because we're verifying the code hash
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get the most recent unconsumed OTP challenge
  const { data: challenge, error: fetchError } = await supabase
    .from('otp_challenges')
    .select('*')
    .eq('profile_id', userId)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !challenge) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ No OTP challenge found:', fetchError?.message || 'Challenge not found');
    }
    return false;
  }

  // Check if expired
  const expiresAt = new Date(challenge.expires_at);
  const now = new Date();
  if (expiresAt < now) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ OTP expired. Expires at:', expiresAt, 'Now:', now);
    }
    return false;
  }

  // Check if max attempts exceeded
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Max attempts exceeded:', challenge.attempts);
    }
    return false;
  }

  // Verify code
  const isValid = await bcrypt.compare(code, challenge.code_hash);

  if (!isValid) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Code mismatch. Attempts:', challenge.attempts + 1);
    }
    // Increment attempts
    await supabase
      .from('otp_challenges')
      .update({ attempts: challenge.attempts + 1 })
      .eq('id', challenge.id);
    return false;
  }

  // Mark as consumed
  await supabase
    .from('otp_challenges')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', challenge.id);

  return true;
}

export async function canResendOTP(userId: string): Promise<boolean> {
  // Use service role key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: recentChallenge } = await supabase
    .from('otp_challenges')
    .select('created_at')
    .eq('profile_id', userId)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!recentChallenge) {
    return true;
  }

  // Rate limit: can resend after 1 minute
  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

  return new Date(recentChallenge.created_at) < oneMinuteAgo;
}

