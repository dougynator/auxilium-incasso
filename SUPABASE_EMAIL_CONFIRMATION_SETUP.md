# Supabase Email Bevestiging Setup

## Probleem: "Server niet verbonden" bij email bevestiging

Als je een "server niet verbonden" scherm krijgt bij het klikken op de bevestigingslink, moet je de Supabase configuratie aanpassen.

## Oplossing: Configureer Supabase Redirect URLs

### Stap 1: Ga naar Supabase Dashboard

1. Ga naar [supabase.com](https://supabase.com)
2. Selecteer je project
3. Ga naar **Authentication** → **URL Configuration**

### Stap 2: Configureer Site URL

**Site URL** moet je productie domein zijn:
```
https://jouw-domein.com
```

Of voor Vercel deployment:
```
https://jouw-project.vercel.app
```

### Stap 3: Voeg Redirect URLs toe

Voeg de volgende URLs toe aan **Redirect URLs**:

```
https://jouw-domein.com/api/auth/confirm
https://jouw-domein.com/login
https://jouw-project.vercel.app/api/auth/confirm
https://jouw-project.vercel.app/login
```

Voor development (lokaal):
```
http://localhost:3000/api/auth/confirm
http://localhost:3000/login
```

### Stap 4: Check Email Templates (Optioneel)

1. Ga naar **Authentication** → **Email Templates**
2. Check de **Confirm signup** template
3. Zorg dat de redirect link correct is:
   ```
   {{ .ConfirmationURL }}
   ```

## Hoe het werkt

1. Gebruiker registreert → Email wordt verstuurd met bevestigingslink
2. Link gaat naar Supabase auth endpoint → Supabase verifieert de token
3. Supabase redirect naar `/api/auth/confirm` → Onze callback route
4. Callback route verifieert de token → Redirect naar `/login?confirmed=true`
5. Login pagina toont success message

## Troubleshooting

### Link werkt niet op desktop maar wel op mobiel

Dit kan komen door:
- **CORS issues**: Check of je domein in Redirect URLs staat
- **HTTPS vs HTTP**: Zorg dat je HTTPS gebruikt in productie
- **Cache**: Probeer incognito/private browsing mode

### "Invalid token" error

- Check of de token niet expired is (meestal 24 uur geldig)
- Check of de token correct wordt doorgegeven in de URL
- Check Supabase logs voor meer details

### Redirect gaat naar verkeerde URL

- Check **Site URL** in Supabase dashboard
- Check **Redirect URLs** lijst
- Zorg dat `NEXT_PUBLIC_APP_URL` correct is ingesteld in environment variables

## Environment Variables

Zorg dat deze correct zijn ingesteld:

```env
NEXT_PUBLIC_APP_URL=https://jouw-domein.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testen

1. Registreer een nieuwe gebruiker
2. Check je email voor bevestigingslink
3. Klik op de link
4. Je zou moeten worden doorgestuurd naar `/login?confirmed=true`
5. Login pagina toont success message

## Belangrijk

- **Site URL** moet exact overeenkomen met je productie domein
- **Redirect URLs** moeten alle mogelijke URLs bevatten (productie, preview, development)
- Test altijd op verschillende apparaten/browsers
- Check Supabase logs als er problemen zijn

