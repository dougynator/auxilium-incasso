# Vercel Project Import Gids - Auxilium Incasso

## Stap 1: Ga naar Vercel Dashboard

1. Open je browser en ga naar [vercel.com](https://vercel.com)
2. **Login** met je GitHub account (of maak een account aan)
3. Je komt op je **Dashboard**

---

## Stap 2: Import Project vanuit GitHub

1. **Klik op "Add New..."** knop (meestal rechtsboven)
   - Of klik op **"Import Project"** of **"New Project"**

2. **Selecteer "Import Git Repository"**
   - Je ziet opties zoals: GitHub, GitLab, Bitbucket
   - Klik op **GitHub** (of de provider waar je repo staat)

3. **Autoriseer Vercel** (als je dit nog niet hebt gedaan):
   - Vercel vraagt toegang tot je GitHub repositories
   - Klik op **"Authorize"** of **"Grant Access"**
   - Selecteer de repositories die Vercel mag gebruiken

4. **Zoek je repository**:
   - Typ in de zoekbalk: `auxilium-incasso`
   - Of scroll door je repositories
   - Klik op **"auxilium-incasso"** repository

5. **Klik op "Import"**

---

## Stap 3: Configureer Project Settings

Na het klikken op Import, kom je op de **Configure Project** pagina:

### 3a. Project Name
- **Project Name**: `auxilium-incasso` (of wat je wilt)
- Dit kan je later nog aanpassen

### 3b. Framework Preset
- Vercel detecteert automatisch **Next.js**
- ✅ Laat dit staan zoals het is

### 3c. Root Directory
- **Root Directory**: `.` (laat leeg of zet `.`)
- Dit betekent dat de root van je repo de project root is
- ✅ Laat dit meestal leeg

### 3d. Build and Output Settings
- **Build Command**: `pnpm build` (of `npm run build`)
- **Output Directory**: `.next` (automatisch gedetecteerd)
- **Install Command**: `pnpm install` (of `npm install`)

**⚠️ Belangrijk**: Als je `pnpm` gebruikt (wat je doet), zorg dat:
- **Install Command**: `pnpm install` is geselecteerd
- Vercel detecteert dit meestal automatisch door je `pnpm-lock.yaml` bestand

### 3e. Environment Variables
**⚠️ BELANGRIJK**: Voeg hier nog GEEN environment variables toe!
- We doen dit later in de Settings
- Klik gewoon op **"Deploy"** of **"Continue"**

---

## Stap 4: Eerste Deployment

1. **Klik op "Deploy"** of **"Continue"**
2. Vercel begint nu met:
   - Code ophalen van GitHub
   - Dependencies installeren (`pnpm install`)
   - Project builden (`pnpm build`)
   - Deployment

3. **Wacht tot deployment klaar is** (2-5 minuten)
   - Je ziet de progress in real-time
   - Er kunnen build errors zijn (dat is normaal, we moeten nog environment variables toevoegen)

---

## Stap 5: Voeg Environment Variables Toe

Na de eerste deployment (ook al faalt deze), ga naar **Settings**:

1. **Klik op je project** in het dashboard
2. **Klik op "Settings"** in de top navigatie
3. **Klik op "Environment Variables"** in de linker sidebar

### 5a. Voeg alle Environment Variables toe:

Klik op **"Add New"** voor elke variabele en voeg toe:

#### Supabase Variables:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [jouw Supabase project URL]
Environment: Production, Preview, Development (selecteer alle drie)
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [jouw Supabase anon key]
Environment: Production, Preview, Development (selecteer alle drie)
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [jouw Supabase service role key]
Environment: Production, Preview, Development (selecteer alle drie)
```

#### Resend Email Variables:
```
Name: RESEND_API_KEY
Value: [jouw Resend API key]
Environment: Production, Preview, Development (selecteer alle drie)
```

```
Name: ADMIN_CC_EMAIL
Value: admin@auxiliumincasso.com
Environment: Production, Preview, Development (selecteer alle drie)
```

#### App Configuration:
```
Name: NEXT_PUBLIC_APP_URL
Value: https://auxilium-incasso-[jouw-vercel-url].vercel.app
Environment: Production, Preview, Development (selecteer alle drie)
```
**⚠️ Note**: Je kunt dit later aanpassen naar je eigen domein!

#### Payment:
```
Name: PAYMENT_IBAN
Value: BE68539007547034
Environment: Production, Preview, Development (selecteer alle drie)
```

#### OTP Settings:
```
Name: OTP_EXPIRY_MINUTES
Value: 10
Environment: Production, Preview, Development (selecteer alle drie)
```

```
Name: OTP_MAX_ATTEMPTS
Value: 5
Environment: Production, Preview, Development (selecteer alle drie)
```

#### Optioneel (voor productie met eigen domein):
```
Name: RESEND_VERIFIED_DOMAIN
Value: auxiliumincasso.com
Environment: Production (alleen production)
```

```
Name: RESEND_FROM_EMAIL
Value: Auxilium Incasso <noreply@auxiliumincasso.com>
Environment: Production (alleen production)
```

### 5b. Waar vind je deze waarden?

**Supabase:**
1. Ga naar [supabase.com](https://supabase.com)
2. Selecteer je project
3. Ga naar **Settings** → **API**
4. Kopieer:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**Resend:**
1. Ga naar [resend.com](https://resend.com)
2. Login op je account
3. Ga naar **API Keys**
4. Maak een nieuwe API key aan (of gebruik bestaande)
5. Kopieer de key → `RESEND_API_KEY`

**Vercel URL:**
- Na je eerste deployment krijg je een URL zoals: `auxilium-incasso-abc123.vercel.app`
- Gebruik deze voor `NEXT_PUBLIC_APP_URL` (tijdelijk, tot je eigen domein hebt)

---

## Stap 6: Herdeploy na Environment Variables

1. **Ga naar "Deployments"** in de top navigatie
2. **Klik op de drie puntjes** (⋯) naast je laatste deployment
3. **Klik op "Redeploy"**
4. **Selecteer "Use existing Build Cache"** (optioneel, sneller)
5. **Klik op "Redeploy"**

Of:

1. **Push een kleine wijziging naar GitHub** (bijv. een comment in een bestand)
2. Vercel deployt automatisch opnieuw

---

## Stap 7: Test je Deployment

1. **Wacht tot deployment klaar is** (groen vinkje)
2. **Klik op je deployment**
3. **Klik op de URL** (bijv. `auxilium-incasso-abc123.vercel.app`)
4. **Test de website**:
   - ✅ Homepage laadt
   - ✅ Login pagina werkt
   - ✅ OTP emails worden verstuurd (check Resend dashboard)

---

## Stap 8: Configureer Custom Domain (Later)

Zodra je je domein hebt geregistreerd:

1. **Ga naar Settings** → **Domains**
2. **Klik op "Add Domain"**
3. **Voer in**: `auxilium-incasso.be`
4. **Volg de DNS instructies** (zie `DOMAIN_SETUP_STAP_VOOR_STAP.md`)
5. **Update `NEXT_PUBLIC_APP_URL`** naar `https://auxilium-incasso.be`

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check of alle dependencies in `package.json` staan
- Vercel gebruikt automatisch `pnpm` als er een `pnpm-lock.yaml` is

**Error: "Environment variable not found"**
- Zorg dat je alle environment variables hebt toegevoegd
- Check of je de juiste environment hebt geselecteerd (Production/Preview/Development)

**Error: "Build command failed"**
- Check de build logs in Vercel
- Test lokaal met `pnpm build` om te zien wat er mis gaat

### Deployment werkt maar website laadt niet

**404 Errors:**
- Check of je Next.js App Router correct is geconfigureerd
- Check of `next.config.js` correct is

**Environment Variables niet beschikbaar:**
- Zorg dat variables zijn toegevoegd voor **alle environments** (Production, Preview, Development)
- Herdeploy na het toevoegen van variables

### Emails werken niet

**"Resend API key invalid"**
- Check of `RESEND_API_KEY` correct is in Environment Variables
- Check of de key actief is in Resend dashboard

**"Domain not verified"**
- Voor development: gebruik `onboarding@resend.dev` (automatisch)
- Voor productie: verifieer je domein in Resend (zie `RESEND_EMAIL_SETUP.md`)

---

## Checklist

- [ ] Project geïmporteerd vanuit GitHub
- [ ] Build settings correct (pnpm install, pnpm build)
- [ ] Alle environment variables toegevoegd
- [ ] Eerste deployment succesvol
- [ ] Website laadt op Vercel URL
- [ ] Login functionaliteit werkt
- [ ] OTP emails worden verstuurd
- [ ] Custom domain gekoppeld (later)
- [ ] SSL certificaat actief (automatisch)

---

## Volgende Stappen

Na succesvolle import en deployment:

1. ✅ Test alle functionaliteit op de Vercel URL
2. ✅ Registreer je domein (zie `DOMAIN_SETUP_STAP_VOOR_STAP.md`)
3. ✅ Koppel domein aan Vercel
4. ✅ Update environment variables voor productie
5. ✅ Verifieer email domein in Resend
6. ✅ Test alles op je eigen domein

**Veel succes met je Vercel deployment! 🚀**

