# Auxilium Incasso - MVP Webapp

Een volledige MVP webapp voor een incassobureau met klantenportaal, admin dashboard en publieke marketing website.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + OTP via email
- **Email**: Resend
- **PDF Generation**: @react-pdf/renderer
- **Validation**: Zod
- **Forms**: react-hook-form

## Setup Instructies

### 1. Installatie

```bash
# Installeer dependencies
pnpm install
```

### 2. Supabase Setup

1. Maak een nieuw Supabase project aan op [supabase.com](https://supabase.com)
2. Kopieer de project URL en anon key
3. Ga naar SQL Editor en voer de migraties uit:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

### 3. Environment Variables

Kopieer `.env.example` naar `.env` en vul de volgende variabelen in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
ADMIN_CC_EMAIL=admin@auxilium-incasso.be

# Payment
PAYMENT_IBAN=BE68539007547034

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OTP
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
```

### 4. Database Seed

Voer het seed script uit om testdata aan te maken:

```bash
pnpm db:seed
```

Dit creëert:
- 1 admin gebruiker (admin@auxilium-incasso.be / admin123)
- 1 staff gebruiker (staff@auxilium-incasso.be / staff123)
- 1 client organisatie + gebruiker (client@voorbeeld.be / client123)
- 1 voorbeeld case

**⚠️ Let op**: Wijzig de wachtwoorden in productie!

### 5. Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Deployment

### Vercel

1. Push code naar GitHub
2. Import project in Vercel
3. Voeg environment variables toe
4. Deploy

### Supabase

- Database is al gehost op Supabase
- Zorg dat RLS policies correct zijn ingesteld

### Resend

- Maak account aan op [resend.com](https://resend.com)
- Verifieer domein voor productie
- Voeg API key toe aan environment variables

## MVP Checklist

### Public Website
- [x] Homepage
- [x] Diensten pagina
- [x] Werkwijze pagina
- [x] Prijzen pagina
- [x] Over ons pagina
- [x] Contact pagina
- [x] FAQ pagina
- [x] Privacy pagina
- [x] Voorwaarden pagina

### Authentication
- [x] Email + password login
- [x] OTP verificatie via email
- [x] Rate limiting OTP
- [x] Session management

### Client Portal
- [x] Dashboard met overzicht cases
- [x] Case creation wizard (3 stappen)
- [x] Case detail pagina met timeline
- [x] Settings pagina (profiel + organisatie)

### Admin/Staff Dashboard
- [x] Admin dashboard met statistieken
- [x] Cases overzicht met filters
- [x] Case status wijzigen
- [x] Betaling markeren
- [x] Gebruikers overzicht

### Email & PDF
- [x] Betalingsverzoek email naar debiteur
- [x] PDF generatie met betalingsdetails
- [x] CC naar client en admin
- [x] Email templates als React components

### Payment Page
- [x] Publieke betalingspagina (/pay/[caseId])
- [x] Bank transfer instructies
- [x] Structured reference weergave
- [x] Status weergave (betaald/open)

### Compliance
- [x] Privacy policy placeholder
- [x] Terms & conditions placeholder
- [x] GDPR basis structuur

### Database
- [x] Volledige schema met alle tabellen
- [x] RLS policies voor security
- [x] Audit logging
- [x] Case events/timeline

## Architectuur Notities

### itsme Integratie (Toekomst)

Voor toekomstige itsme integratie:

1. **OAuth Flow**: Implementeer OAuth 2.0 flow voor itsme
2. **Provider**: Gebruik `next-auth` of Supabase Auth providers
3. **Database**: Voeg `itsme_id` veld toe aan `profiles` tabel
4. **UI**: Vervang OTP flow met itsme login knop wanneer beschikbaar

### Payment Provider Integratie (Toekomst)

Voor Stripe/Mollie integratie:

1. **API Routes**: Maak `/api/payments/create-intent` endpoints
2. **Webhooks**: Implementeer webhook handlers voor payment status updates
3. **Database**: Voeg `payment_provider` en `payment_intent_id` velden toe aan `cases`
4. **UI**: Vervang placeholder payment page met provider checkout

## Structuur

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── portal/            # Client portal
│   ├── pay/               # Public payment page
│   └── [public pages]     # Marketing pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── cases/            # Case-related components
│   └── admin/            # Admin components
├── lib/                   # Utilities & services
│   ├── auth/             # Authentication logic
│   ├── email/            # Email service & templates
│   ├── pdf/              # PDF generation
│   └── supabase/         # Supabase clients
├── supabase/
│   └── migrations/       # Database migrations
└── scripts/
    └── seed.ts           # Seed script
```

## Licentie

Proprietary - Auxilium Incasso

