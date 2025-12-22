# Video Upload Instructies - 56.69 MB Video

De video is **56.69 MB**, wat groter is dan de standaard Supabase Storage limiet. Hier zijn de oplossingen:

## Oplossing 1: Bucket Limiet Verhogen (Aanbevolen)

### Via Supabase Dashboard:

1. Ga naar [Supabase Dashboard](https://supabase.com) → Je project → **Storage**
2. Klik op de bucket **`public-assets`** (of maak deze aan als deze niet bestaat)
3. Klik op **Settings** of **Edit bucket**
4. Verhoog **File size limit** naar **100 MB** (of hoger)
5. Sla op

### Dan uploaden:

```bash
pnpm tsx scripts/upload-hero-video.ts
```

## Oplossing 2: Handmatig Uploaden via Dashboard

1. Ga naar Supabase Dashboard → Storage → `public-assets`
2. Klik **Upload file**
3. Selecteer `public/videos/hero-video.mp4`
4. Wacht tot upload compleet is
5. Zorg dat het bestand **`hero-video.mp4`** heet (geen pad)

## Oplossing 3: Video Comprimeren (Alternatief)

Als de upload blijft falen, comprimeer de video:

### Met FFmpeg (Terminal):

```bash
# Installeer FFmpeg eerst: brew install ffmpeg (Mac) of apt-get install ffmpeg (Linux)

# Comprimeer video (houdt kwaliteit, verkleint bestand)
ffmpeg -i public/videos/hero-video.mp4 -vcodec h264 -crf 23 -preset medium public/videos/hero-video-compressed.mp4

# Vervang origineel
mv public/videos/hero-video-compressed.mp4 public/videos/hero-video.mp4
```

### Met HandBrake (GUI):

1. Download [HandBrake](https://handbrake.fr/)
2. Open `public/videos/hero-video.mp4`
3. Kies preset: **Fast 1080p30** of **Web/Google 1080p30**
4. Export naar `public/videos/hero-video-compressed.mp4`
5. Vervang origineel

### Online Tools:

- [CloudConvert](https://cloudconvert.com/mp4-compressor)
- [FreeConvert](https://www.freeconvert.com/video-compressor)

**Doel**: Verklein naar **< 20 MB** voor snellere laadtijden.

## Oplossing 4: Externe Video Hosting

Als Supabase Storage niet werkt, gebruik een externe service:

### Opties:

1. **Vercel Blob Storage** (als je op Vercel host)
2. **Cloudflare R2** (goedkoop, snel)
3. **AWS S3** (betrouwbaar, schaalbaar)
4. **YouTube/Vimeo** (gratis, maar minder controle)

### Dan in `.env`:

```env
NEXT_PUBLIC_HERO_VIDEO_URL=https://jouw-video-url.com/hero-video.mp4
```

## Huidige Status

- ✅ Video staat lokaal: `public/videos/hero-video.mp4`
- ✅ Bucket `public-assets` bestaat
- ❌ Upload faalt: Video te groot (56.69 MB > bucket limiet)

## Snelle Fix

**Meest eenvoudig**: Verhoog de bucket limiet in Supabase Dashboard naar 100 MB, dan:

```bash
pnpm tsx scripts/upload-hero-video.ts
```

## Testen

Na upload, test de video:

1. Check Supabase Dashboard → Storage → `public-assets` → `hero-video.mp4`
2. Test de URL: `https://[jouw-project].supabase.co/storage/v1/object/public/public-assets/hero-video.mp4`
3. Refresh je website - video zou moeten laden

