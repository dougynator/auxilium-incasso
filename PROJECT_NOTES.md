# Auxilium Incasso - Project Notities

## Overzicht
Dit document bevat belangrijke notities en beslissingen genomen tijdens de ontwikkeling van de Auxilium Incasso MVP.

---

## Setup & Configuratie

### GitHub Repository
- **URL**: https://github.com/dougynator/auxilium-incasso.git
- **Branch**: main
- Alle code wordt gesynchroniseerd via Git

### Environment Variables
Het `.env` bestand wordt NIET naar GitHub gepusht (veiligheid). Op elke nieuwe PC moet je handmatig:
- Supabase keys kopiëren
- Resend API key kopiëren
- Andere environment variables instellen

Zie `.env.example` voor alle benodigde variabelen.

---

## Recente Wijzigingen

### Logo Implementatie
- **Locatie**: `public/images/logo.png`
- **Component**: `components/logo.tsx`
- **Gebruik**: Overal gebruikt via Header component
- **Fallback**: Als logo niet bestaat, wordt tekst "Auxilium Incasso" getoond

### Homepage Hero Sectie
- **Component**: `components/hero-video.tsx`
- **Features**:
  - Video achtergrond (optioneel, fallback naar gradient)
  - Transparant blauw vak (75% opacity) met tekst
  - Interactieve animaties (fade-in, glow, hover effects)
  - Responsive design
  - Tekst links, knop rechts (desktop) / gestapeld (mobiel)
  - Vak gecentreerd onderaan de video

### Design Keuzes
- **Font**: Poppins voor koppen (speels maar zakelijk), Inter voor body tekst
- **Kleuren**: Primary blauw met transparantie voor hero vak
- **Animaties**: Subtiele fade-in, glow effect, hover interacties

### Componenten Structuur
- `components/header.tsx` - Herbruikbare header met logo en navigatie
- `components/footer.tsx` - Herbruikbare footer met logo
- `components/logo.tsx` - Logo component met fallback
- `components/hero-video.tsx` - Hero sectie met video en interactief vak

---

## Technische Details

### Video Specificaties
- **Locatie**: `public/videos/hero-video.mp4`
- **Formaat**: MP4 (H.264) of WebM
- **Resolutie**: 1920x1080 (Full HD) of hoger
- **Gedrag**: Auto-play, loop, muted
- **Fallback**: Gradient achtergrond als video niet beschikbaar

### Transparantie Instellingen
- **Hero vak**: `bg-primary/75` (75% opacity)
- **Hover**: `bg-primary/80` (80% opacity)
- **Backdrop blur**: `backdrop-blur-md` voor leesbaarheid

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Database & Migraties

### RLS Policies Fix
Er was een recursie probleem met profiles policies. Opgelost via:
- `supabase/migrations/003_fix_rls_recursion.sql`
- Vereenvoudigde policies zonder recursie

### OTP Authentication
- OTP verificatie werkt via email
- Service role key gebruikt om RLS te bypassen voor OTP operaties
- Session refresh na succesvolle OTP verificatie

---

## Workflow tussen PC's

### Op Werk PC (na wijzigingen):
```powershell
cd "C:\Users\BoekhoudingMihaliWeg\Desktop\Auxilium Incasso"
git add .
git commit -m "Beschrijving van wijzigingen"
git push
```

### Op Thuis PC (eerste keer):
```powershell
cd C:\Users\JeNaam\Desktop
git clone https://github.com/dougynator/auxilium-incasso.git
cd auxilium-incasso
pnpm install
# Kopieer .env bestand handmatig
```

### Op Thuis PC (updates ophalen):
```powershell
cd C:\Users\JeNaam\Desktop\auxilium-incasso
git pull
pnpm install  # Alleen als er nieuwe packages zijn
```

---

## Belangrijke Bestanden

### Configuratie
- `tailwind.config.ts` - Tailwind config met Poppins font
- `app/globals.css` - Custom animaties (fadeInUp, glow, bounceSubtle)
- `next.config.js` - Next.js configuratie

### Componenten
- `components/logo.tsx` - Logo met fallback
- `components/header.tsx` - Header component
- `components/footer.tsx` - Footer component
- `components/hero-video.tsx` - Hero sectie met video

### Pagina's
- `app/page.tsx` - Homepage met hero video
- Alle andere pagina's gebruiken Header en Footer components

---

## To-Do Items

### Voltooid ✅
- Logo implementatie
- Hero video sectie met transparant vak
- Responsive design
- Interactieve animaties
- Header en Footer components
- Alle pagina's bijgewerkt

### Nog te doen
- Video bestand toevoegen (`public/videos/hero-video.mp4`)
- Website content verder uitwerken
- Webapp functionaliteit uitbreiden

---

## Tips & Tricks

### Logo toevoegen
1. Plaats logo in `public/images/logo.png`
2. Commit en push naar GitHub
3. Logo wordt automatisch gebruikt overal

### Video toevoegen
1. Plaats video in `public/videos/hero-video.mp4`
2. Refresh browser
3. Video speelt automatisch af

### Debugging
- Development logging staat aan in `NODE_ENV === 'development'`
- Check terminal voor debug output
- Browser console voor client-side errors

---

## Contact & Support

Voor vragen over de codebase, zie:
- `README.md` - Algemene project informatie
- `SETUP.md` - Setup instructies
- `TERMINAL_SETUP.md` - Terminal commando's

---

**Laatste update**: Homepage hero sectie met transparant vak en interactieve animaties

