# Setup Guide - Auxilium Incasso MVP

## Snelle Start

### 1. Dependencies installeren

```bash
pnpm install
```

### 2. Supabase Project Setup

1. Ga naar [supabase.com](https://supabase.com) en maak een nieuw project aan
2. Noteer de volgende gegevens:
   - Project URL (bijv. `https://xxxxx.supabase.co`)
   - Anon Key (te vinden onder Project Settings > API)
   - Service Role Key (te vinden onder Project Settings > API)

### 3. Database Migraties

1. Ga naar SQL Editor in je Supabase dashboard
2. Voer de volgende migraties uit in volgorde:
   - Kopieer en voer uit: `supabase/migrations/001_initial_schema.sql`
   - Kopieer en voer uit: `supabase/migrations/002_rls_policies.sql`

### 4. Environment Variables

Maak een `.env` bestand aan in de root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend (Email) - Maak account aan op resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
ADMIN_CC_EMAIL=admin@auxilium-incasso.be

# Payment
PAYMENT_IBAN=BE68539007547034

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OTP Settings
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
```

### 5. Seed Database

Voer het seed script uit om testdata aan te maken:

```bash
pnpm db:seed
```

Dit creëert:
- Admin gebruiker: `admin@auxilium-incasso.be` / `admin123`
- Staff gebruiker: `staff@auxilium-incasso.be` / `staff123`
- Client organisatie + gebruiker: `client@voorbeeld.be` / `client123`
- Voorbeeld case

**⚠️ BELANGRIJK**: Wijzig deze wachtwoorden in productie!

### 6. Development Server Starten

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Resend Email Setup

1. Maak account aan op [resend.com](https://resend.com)
2. Verifieer je e-mailadres
3. Maak een API key aan
4. Voeg de API key toe aan `.env` als `RESEND_API_KEY`

Voor productie:
- Verifieer je domein in Resend
- Update `from` adres in `lib/email/service.ts`

## Deployment

### Vercel

1. Push code naar GitHub
2. Import project in Vercel
3. Voeg alle environment variables toe
4. Deploy

### Supabase

- Database is al gehost op Supabase
- Zorg dat RLS policies correct zijn ingesteld
- Test de RLS policies met verschillende gebruikersrollen

## Troubleshooting

### OTP emails worden niet verzonden

- Controleer of `RESEND_API_KEY` correct is ingesteld
- Controleer Resend dashboard voor errors
- Zorg dat je e-mailadres geverifieerd is in Resend

### Database errors

- Controleer of migraties correct zijn uitgevoerd
- Controleer RLS policies
- Test met service role key voor debugging

### Authentication issues

- Controleer Supabase Auth settings
- Zorg dat email confirmation is uitgeschakeld voor development
- Controleer redirect URLs in Supabase dashboard

## Productie Checklist

- [ ] Wijzig alle default wachtwoorden
- [ ] Stel productie environment variables in
- [ ] Verifieer domein in Resend
- [ ] Test alle flows (login, OTP, case creation, etc.)
- [ ] Controleer RLS policies
- [ ] Setup monitoring/logging
- [ ] Configureer custom domain
- [ ] SSL certificaat (automatisch met Vercel)

