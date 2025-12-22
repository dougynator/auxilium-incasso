/**
 * Script om de hero video naar Supabase Storage te uploaden
 * 
 * Gebruik: pnpm tsx scripts/upload-hero-video.ts
 * 
 * Zorg ervoor dat:
 * 1. De video staat in public/videos/hero-video.mp4
 * 2. NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn ingesteld in .env
 * 3. Er een public bucket "public-assets" bestaat in Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function uploadHeroVideo() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten ingesteld zijn in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check if bucket exists, create if not
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'public-assets');

  if (!bucketExists) {
    console.log('📦 Creating public-assets bucket...');
    const { error: createError } = await supabase.storage.createBucket('public-assets', {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: ['video/mp4', 'video/webm'],
    });

    if (createError) {
      console.error('❌ Error creating bucket:', createError);
      process.exit(1);
    }
    console.log('✅ Bucket created');
  }

  // Check if video file exists
  const videoPath = path.join(process.cwd(), 'public', 'videos', 'hero-video.mp4');
  
  if (!fs.existsSync(videoPath)) {
    console.error(`❌ Video file not found at: ${videoPath}`);
    console.log('💡 Plaats de video eerst in public/videos/hero-video.mp4');
    process.exit(1);
  }

  // Read video file
  console.log('📖 Reading video file...');
  const videoBuffer = fs.readFileSync(videoPath);
  const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`📊 File size: ${fileSizeMB} MB`);

  // Upload to Supabase Storage
  console.log('📤 Uploading to Supabase Storage...');
  const { data, error } = await supabase.storage
    .from('public-assets')
    .upload('hero-video.mp4', videoBuffer, {
      contentType: 'video/mp4',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('❌ Upload error:', error);
    process.exit(1);
  }

  console.log('✅ Video uploaded successfully!');
  console.log(`🔗 Public URL: ${supabaseUrl}/storage/v1/object/public/public-assets/hero-video.mp4`);
  console.log('\n💡 Voeg deze URL toe aan je .env als fallback:');
  console.log(`NEXT_PUBLIC_HERO_VIDEO_URL=${supabaseUrl}/storage/v1/object/public/public-assets/hero-video.mp4`);
}

uploadHeroVideo().catch(console.error);

