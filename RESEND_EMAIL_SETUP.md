# Resend Email Setup Guide

## Development Setup (Test Domain)

Voor development kun je direct beginnen met het test domain van Resend:

1. **Maak een Resend account aan** op [resend.com](https://resend.com)
2. **Maak een API key aan** in je Resend dashboard
3. **Voeg de API key toe aan je `.env` file:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

Het systeem gebruikt automatisch `onboarding@resend.dev` als "from" adres in development mode.

## Production Setup (Eigen Domein)

Voor productie is het **sterk aanbevolen** om je eigen domein te verifiëren in Resend. Dit verbetert:
- **Deliverability** (emails komen beter aan)
- **Professionaliteit** (emails komen van je eigen domein)
- **Reputatie** (je eigen domein reputatie)

### Stappen voor domein verificatie:

1. **Ga naar Resend Dashboard > Domains**
2. **Klik op "Add Domain"**
3. **Voer je domein in** (bijv. `auxiliumincasso.com`)
4. **Voeg DNS records toe** aan je domein provider:
   - **SPF record**: `v=spf1 include:resend.com ~all`
   - **DKIM record**: (Resend geeft je de exacte waarde)
   - **DMARC record**: `v=DMARC1; p=none; rua=mailto:dmarc@auxiliumincasso.com`
5. **Wacht op verificatie** (kan enkele uren duren)
6. **Voeg toe aan `.env`:**
   ```env
   RESEND_VERIFIED_DOMAIN=auxiliumincasso.com
   RESEND_FROM_EMAIL=Auxilium Incasso <noreply@auxiliumincasso.com>
   ```

### DNS Records Voorbeeld (voor auxiliumincasso.com):

```
Type: TXT
Name: @ (of auxiliumincasso.com)
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [Resend geeft je deze waarde]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@auxiliumincasso.com
```

## Email Flow

Na het aanmaken van een opdracht worden **3 aparte emails** verstuurd:

1. **Naar debiteur** (met PDF attachment)
   - Betalingsverzoek met alle details
   - PDF met betalingsinformatie
   - Link naar betalingspagina

2. **Naar klant** (apart, zonder PDF)
   - Bevestiging dat opdracht is ontvangen
   - Overzicht van opdrachtdetails
   - Link naar opdracht in portaal

3. **Intern naar team** (met alle details)
   - Volledige opdrachtdetails
   - Link naar admin panel
   - Gebruikt `ADMIN_CC_EMAIL` environment variable

## Environment Variables

```env
# Resend API Key (verplicht)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Voor productie met eigen domein (optioneel)
RESEND_VERIFIED_DOMAIN=auxiliumincasso.com
RESEND_FROM_EMAIL=Auxilium Incasso <noreply@auxiliumincasso.com>

# Intern email adres voor notificaties
ADMIN_CC_EMAIL=admin@auxiliumincasso.com
```

## Testen

Om te testen zonder eigen domein:
1. Gebruik de Resend test domain (`onboarding@resend.dev`)
2. Emails worden verstuurd, maar kunnen in spam terechtkomen
3. Check je Resend dashboard voor delivery status

Voor productie:
1. Verifieer je domein in Resend
2. Update environment variables
3. Test met een echte email
4. Monitor delivery rates in Resend dashboard

## Troubleshooting

**Emails komen niet aan:**
- Check je Resend dashboard voor errors
- Verify dat `RESEND_API_KEY` correct is
- Check spam folder
- Verify DNS records zijn correct geconfigureerd

**"Domain not verified" error:**
- Wacht tot DNS records zijn gepropageerd (kan 24-48 uur duren)
- Check of alle DNS records correct zijn toegevoegd
- Gebruik `onboarding@resend.dev` voor development

**Rate limits:**
- Resend free tier: 100 emails/dag
- Upgrade voor meer volume


