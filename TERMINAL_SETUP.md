# Terminal Setup Gids - Auxilium Incasso

## Stap 1: Navigeer naar de projectmap

Open PowerShell en navigeer naar je projectmap:

```powershell
cd "C:\Users\BoekhoudingMihaliWeg\Desktop\Auxilium Incasso"
```

Controleer dat je in de juiste map bent:
```powershell
pwd
```
Dit zou moeten tonen: `C:\Users\BoekhoudingMihaliWeg\Desktop\Auxilium Incasso`

## Stap 2: Controleer of Node.js en pnpm geïnstalleerd zijn

```powershell
node --version
```

Als Node.js niet geïnstalleerd is, download het van: https://nodejs.org/

Installeer pnpm (als het nog niet geïnstalleerd is):
```powershell
npm install -g pnpm
```

Controleer pnpm:
```powershell
pnpm --version
```

## Stap 3: Installeer alle dependencies

```powershell
pnpm install
```

Dit kan een paar minuten duren. Wacht tot het klaar is.

## Stap 4: Maak .env bestand aan

Maak een nieuw bestand genaamd `.env` in de projectmap. Je kunt dit doen met:

```powershell
Copy-Item .env.example .env
```

Of maak het handmatig aan en kopieer de inhoud van `.env.example`.

## Stap 5: Vul de .env variabelen in

Open het `.env` bestand en vul de volgende waarden in:

**BELANGRIJK**: Je moet eerst een Supabase project aanmaken op https://supabase.com

1. Ga naar https://supabase.com en maak een account/project
2. Ga naar Project Settings > API
3. Kopieer de Project URL en Anon Key
4. Kopieer de Service Role Key (scroll naar beneden)

Vul deze in in je `.env` bestand:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw_anon_key_hier
SUPABASE_SERVICE_ROLE_KEY=jouw_service_role_key_hier

RESEND_API_KEY=jouw_resend_key_hier
ADMIN_CC_EMAIL=admin@auxilium-incasso.be

PAYMENT_IBAN=BE68539007547034

NEXT_PUBLIC_APP_URL=http://localhost:3000

OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
```

## Stap 6: Setup Supabase Database

### 6a. Ga naar Supabase Dashboard
- Open je browser en ga naar https://supabase.com
- Selecteer je project
- Klik op "SQL Editor" in het menu links

### 6b. Voer migraties uit

**Migratie 1:**
1. Open het bestand `supabase/migrations/001_initial_schema.sql` in je code editor
2. Kopieer alle inhoud
3. Plak in SQL Editor in Supabase
4. Klik op "Run" of druk F5

**Migratie 2:**
1. Open het bestand `supabase/migrations/002_rls_policies.sql` in je code editor
2. Kopieer alle inhoud
3. Plak in SQL Editor in Supabase
4. Klik op "Run" of druk F5

## Stap 7: Setup Resend (voor emails)

1. Ga naar https://resend.com
2. Maak een account aan
3. Verifieer je email
4. Ga naar API Keys
5. Maak een nieuwe API key aan
6. Kopieer de key en plak deze in je `.env` als `RESEND_API_KEY`

## Stap 8: Seed de database (maak test gebruikers)

```powershell
pnpm db:seed
```

Dit creëert:
- Admin: admin@auxilium-incasso.be / admin123
- Staff: staff@auxilium-incasso.be / staff123
- Client: client@voorbeeld.be / client123

## Stap 9: Start de development server

```powershell
pnpm dev
```

Wacht tot je ziet: `✓ Ready in X seconds`

## Stap 10: Open de applicatie

Open je browser en ga naar: http://localhost:3000

## Test de applicatie

1. **Test login:**
   - Ga naar http://localhost:3000/login
   - Login met: `client@voorbeeld.be` / `client123`
   - Je krijgt een OTP code via email (check je Resend dashboard als je geen email ontvangt)

2. **Test admin:**
   - Login met: `admin@auxilium-incasso.be` / `admin123`
   - Je krijgt toegang tot het admin dashboard

## Troubleshooting

### Fout: "Cannot find module"
```powershell
# Verwijder node_modules en package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Herinstalleer
pnpm install
```

### Fout: "Port 3000 already in use"
```powershell
# Stop het proces op poort 3000
netstat -ano | findstr :3000
# Noteer het PID nummer
taskkill /PID <PID_NUMMER> /F

# Of gebruik een andere poort
$env:PORT=3001
pnpm dev
```

### Fout met Supabase migraties
- Controleer of je alle migraties in de juiste volgorde hebt uitgevoerd
- Controleer of er geen syntax errors zijn in de SQL
- Kijk in de Supabase logs voor meer details

### Emails worden niet verzonden
- Controleer of `RESEND_API_KEY` correct is ingesteld
- Check Resend dashboard voor errors
- Voor development: emails worden mogelijk niet echt verzonden, check Resend logs

## Handige commando's

```powershell
# Stop de development server
# Druk Ctrl+C in de terminal waar pnpm dev draait

# Check of alles correct is geïnstalleerd
pnpm list

# Run linting
pnpm lint

# Build voor productie (test)
pnpm build
```

## Volgende stappen na setup

1. Wijzig de default wachtwoorden in productie
2. Test alle flows (login, case creation, etc.)
3. Configureer je eigen email domain in Resend
4. Deploy naar Vercel wanneer klaar

