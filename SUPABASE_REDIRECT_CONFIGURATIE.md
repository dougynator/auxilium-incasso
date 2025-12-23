# Supabase Redirect URL Configuratie - Stap voor Stap

## Doel
Na het klikken op de bevestigingsknop in de email, moet de gebruiker naar de login pagina worden gestuurd.

## Stap 1: Ga naar Supabase Dashboard

1. Open je browser en ga naar [supabase.com](https://supabase.com)
2. **Login** met je account
3. **Selecteer je project** (Auxilium Incasso)

## Stap 2: Ga naar Authentication Settings

1. Klik in het **linker menu** op **"Authentication"**
2. Klik op **"URL Configuration"** (of "URLs" in sommige versies)

## Stap 3: Configureer Site URL

In het veld **"Site URL"** zet je:

### Voor Development (lokaal):
```
http://localhost:3000
```

### Voor Productie (Vercel):
```
https://jouw-project.vercel.app
```

Of als je een eigen domein hebt:
```
https://jouw-domein.com
```

**⚠️ BELANGRIJK**: Deze URL moet exact overeenkomen met waar je website draait!

## Stap 4: Voeg Redirect URLs toe

In het veld **"Redirect URLs"** (of "Redirect URLs" lijst), voeg je de volgende URLs toe:

### Voor Development:
```
http://localhost:3000/auth/confirm-email
http://localhost:3000/login
```

### Voor Productie:
```
https://jouw-project.vercel.app/auth/confirm-email
https://jouw-project.vercel.app/login
https://jouw-domein.com/auth/confirm-email
https://jouw-domein.com/login
```

**Hoe toe te voegen:**
1. Klik op **"Add URL"** of het **+** icoon
2. Plak de URL
3. Klik op **"Save"** of **"Add"**
4. Herhaal voor alle URLs

## Stap 5: Sla op

1. Scroll naar beneden
2. Klik op **"Save"** of **"Update"** knop
3. Wacht tot je een bevestiging ziet

## Stap 6: Test

1. Registreer een nieuwe gebruiker
2. Check je email
3. Klik op de bevestigingslink
4. Je zou moeten worden doorgestuurd naar `/auth/confirm-email`
5. Na bevestiging → automatisch redirect naar `/login?confirmed=true`

## Visuele Gids

```
Supabase Dashboard
├── Authentication (linker menu)
    ├── URL Configuration
        ├── Site URL: [http://localhost:3000]
        └── Redirect URLs:
            ├── http://localhost:3000/auth/confirm-email
            ├── http://localhost:3000/login
            ├── https://jouw-domein.com/auth/confirm-email
            └── https://jouw-domein.com/login
```

## Troubleshooting

### "Redirect URL not allowed" error

- Check of de URL exact overeenkomt (inclusief http/https)
- Check of er geen trailing slash is (`/login` niet `/login/`)
- Check of de URL in de lijst staat

### Gebruiker wordt niet doorgestuurd

- Check of `NEXT_PUBLIC_APP_URL` correct is ingesteld in je `.env`
- Check of de Site URL overeenkomt met je app URL
- Check browser console voor errors

### Werkt op mobiel maar niet op desktop

- Dit kan een cache probleem zijn
- Probeer incognito/private browsing mode
- Check of beide URLs (mobiel en desktop) in de lijst staan

## Belangrijk

- **Site URL** = Waar je website draait
- **Redirect URLs** = Waar Supabase naartoe mag redirecten na bevestiging
- Beide moeten exact overeenkomen (geen typos, geen extra slashes)

## Voorbeeld Configuratie

**Development:**
```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/auth/confirm-email
  - http://localhost:3000/login
```

**Productie:**
```
Site URL: https://auxilium-incasso.vercel.app
Redirect URLs:
  - https://auxilium-incasso.vercel.app/auth/confirm-email
  - https://auxilium-incasso.vercel.app/login
  - https://www.auxiliumincasso.com/auth/confirm-email
  - https://www.auxiliumincasso.com/login
```

