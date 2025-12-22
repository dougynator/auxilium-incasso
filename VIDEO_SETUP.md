# Hero Video Setup - Altijd Online

De hero video op de homepage heeft nu een **fallback systeem** zodat deze altijd beschikbaar is, zelfs als de lokale video niet beschikbaar is.

## Video Fallback Systeem

De video probeert in deze volgorde:

1. **Lokale video** (`/public/videos/hero-video.mp4`) - Hoogste prioriteit
2. **Supabase Storage** (`public-assets/hero-video.mp4`) - Fallback
3. **Externe URL** (via `NEXT_PUBLIC_HERO_VIDEO_URL`) - Laatste fallback
4. **Gradient achtergrond** - Als alle video's falen

## Video Uploaden naar Supabase Storage

### Stap 1: Zorg dat de video beschikbaar is

1. Download de video van iCloud (als deze daar staat)
2. Plaats de video in: `public/videos/hero-video.mp4`

### Stap 2: Upload naar Supabase Storage

**Optie A: Via Script (Aanbevolen)**

```bash
# Zorg dat je .env file de juiste Supabase credentials heeft:
# NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...

# Run het upload script
pnpm tsx scripts/upload-hero-video.ts
```

Het script zal:
- Automatisch de `public-assets` bucket aanmaken (als deze niet bestaat)
- De video uploaden naar Supabase Storage
- Je de public URL geven om toe te voegen aan `.env`

**Optie B: Handmatig via Supabase Dashboard**

1. Ga naar [Supabase Dashboard](https://supabase.com) → Je project → Storage
2. Maak een nieuwe bucket aan:
   - **Name**: `public-assets`
   - **Public bucket**: ✅ **AAN** (belangrijk!)
   - **File size limit**: `50 MB` (of groter als je video groter is)
   - **Allowed MIME types**: `video/mp4`, `video/webm`
3. Upload de video:
   - Klik op de `public-assets` bucket
   - Klik "Upload file"
   - Upload `hero-video.mp4`
   - Zorg dat het bestand `hero-video.mp4` heet (geen pad)

### Stap 3: Voeg URL toe aan .env (Optioneel)

Als je een externe URL wilt gebruiken als extra fallback:

```env
NEXT_PUBLIC_HERO_VIDEO_URL=https://jouw-domein.com/video/hero-video.mp4
```

Of gebruik de Supabase Storage URL:

```env
NEXT_PUBLIC_HERO_VIDEO_URL=https://[jouw-project].supabase.co/storage/v1/object/public/public-assets/hero-video.mp4
```

## Video Specificaties

- **Formaat**: MP4 (H.264 codec) aanbevolen
- **Resolutie**: 1920x1080 (Full HD) of hoger
- **Duur**: 30-60 seconden (loopt in loop)
- **Grootte**: Probeer onder 20MB te blijven voor snelle laadtijden
- **Aspect ratio**: 16:9 (horizontaal)
- **Content**: Professionele achtergrond video zonder geluid (wordt gemuted afgespeeld)

## Testen

1. **Lokaal testen**:
   ```bash
   pnpm dev
   ```
   Ga naar `http://localhost:3000` en check of de video laadt

2. **Test fallback**:
   - Verwijder tijdelijk `public/videos/hero-video.mp4`
   - Refresh de pagina
   - De video zou nu van Supabase Storage moeten laden

3. **Check browser console**:
   - Als de video niet laadt, zie je warnings in de console
   - De gradient achtergrond wordt getoond als alle video's falen

## Troubleshooting

### Video laadt niet

1. **Check Supabase Storage**:
   - Is de bucket `public-assets` aangemaakt?
   - Is de bucket **public**?
   - Staat het bestand erin als `hero-video.mp4`?

2. **Check browser console**:
   - Zijn er CORS errors?
   - Zijn er 404 errors voor de video?

3. **Check .env**:
   - Zijn `NEXT_PUBLIC_SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` ingesteld?
   - Is `NEXT_PUBLIC_HERO_VIDEO_URL` correct (als gebruikt)?

### Video is te groot

- Comprimeer de video met tools zoals:
  - [HandBrake](https://handbrake.fr/)
  - [FFmpeg](https://ffmpeg.org/)
  - Online tools zoals [CloudConvert](https://cloudconvert.com/)

### CORS Errors

- Zorg dat de Supabase Storage bucket **public** is
- Check Supabase Storage policies in het dashboard

## Automatische Deployment

Bij deployment op Vercel:
- De lokale video wordt meegenomen in de build
- Als de lokale video niet beschikbaar is, valt het terug op Supabase Storage
- Dit zorgt ervoor dat de video **altijd** beschikbaar is

## Belangrijk

✅ **De video staat nu altijd online** via het fallback systeem
✅ **Geen iCloud afhankelijkheid** meer
✅ **Automatische fallback** naar Supabase Storage
✅ **Werkt op alle deployments** (lokaal, Vercel, productie)

