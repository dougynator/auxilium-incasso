# Domein Setup Stap-voor-Stap Gids

## Stap 1: Kies een Domein Registrar

Voor een **.be domein** (auxilium-incasso.be) zijn hier de beste opties:

### 🏆 Aanbevelingen (van goedkoop naar duurder):

#### 1. **Cloudflare Registrar** (⭐ AANBEVOLEN)
- **Prijs**: ~€8-10/jaar (gewoonlijk de goedkoopste)
- **Voordelen**: 
  - Geen winstmarge op domeinen
  - Gratis DNS management
  - Gratis DDoS bescherming
  - Zeer betrouwbaar
- **Website**: [cloudflare.com](https://www.cloudflare.com/products/registrar/)
- **Nadelen**: Vereist Cloudflare account (gratis)

#### 2. **Namecheap**
- **Prijs**: ~€10-12/jaar eerste jaar, daarna ~€12-15/jaar
- **Voordelen**: 
  - Goede prijs-kwaliteit verhouding
  - Gratis WHOIS privacy
  - Goede klantenservice
- **Website**: [namecheap.com](https://www.namecheap.com)

#### 3. **TransIP**
- **Prijs**: ~€12-15/jaar
- **Voordelen**: 
  - Nederlandse/Belgische service
  - Goede klantenservice in Nederlands
  - Eenvoudig beheer
- **Website**: [transip.nl](https://www.transip.nl)

#### 4. **Combell**
- **Prijs**: ~€15-20/jaar
- **Voordelen**: 
  - Belgische registrar
  - Lokale klantenservice
  - Goede reputatie
- **Website**: [combell.com](https://www.combell.com)

#### 5. **One.com**
- **Prijs**: ~€10-15/jaar eerste jaar, daarna ~€20/jaar
- **Voordelen**: 
  - Eenvoudige interface
  - Vaak hosting bundels
- **Website**: [one.com](https://www.one.com)

### ⚠️ Let op bij goedkope aanbieders:
- **Eerste jaar korting**: Veel registrars geven korting het eerste jaar, maar verhogen daarna de prijs
- **Verborgen kosten**: Check of er extra kosten zijn voor DNS management, privacy, etc.
- **Transfer kosten**: Sommige registrars rekenen extra kosten om je domein later over te zetten

### 💡 Mijn Aanbeveling:
**Start met Cloudflare Registrar** als je alleen een domein nodig hebt, of **Namecheap** als je een eenvoudigere interface wilt.

---

## Stap 2: Registreer je Domein

1. **Zoek beschikbaarheid**:
   - Ga naar je gekozen registrar
   - Zoek naar `auxilium-incasso.be`
   - Controleer of het beschikbaar is

2. **Registreer het domein**:
   - Volg de registratieprocedure
   - Vul je gegevens in (naam, adres, email)
   - Betaal voor minimaal 1 jaar (meestal goedkoper om 2-3 jaar te betalen)

3. **Belangrijke instellingen**:
   - ✅ Schakel **WHOIS Privacy** in (als beschikbaar)
   - ✅ Schakel **Auto-renewal** in (zodat je domein niet verloopt)
   - ✅ Gebruik je echte gegevens (vereist voor .be domeinen)

---

## Stap 3: Koppel Domein aan Vercel

### Optie A: Via Vercel Dashboard (Aanbevolen)

1. **Login op Vercel**:
   - Ga naar [vercel.com](https://vercel.com)
   - Login met je GitHub account

2. **Selecteer je project**:
   - Ga naar je project dashboard
   - Klik op **Settings** → **Domains**

3. **Voeg domein toe**:
   - Klik op **Add Domain**
   - Voer `auxilium-incasso.be` in
   - Voeg ook `www.auxilium-incasso.be` toe (optioneel, maar aanbevolen)

4. **Configureer DNS**:
   - Vercel geeft je DNS records die je moet toevoegen
   - Meestal zijn dit:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

5. **Voeg DNS records toe bij je registrar**:
   - Ga naar je domein registrar dashboard
   - Zoek naar **DNS Management** of **DNS Settings**
   - Voeg de records toe die Vercel heeft gegeven
   - **Wacht 5-60 minuten** tot DNS is gepropageerd

6. **Verifieer in Vercel**:
   - Vercel controleert automatisch of DNS correct is ingesteld
   - Zodra het groen is, is je domein actief!

### Optie B: Via Cloudflare (Als je Cloudflare gebruikt)

1. **Voeg domein toe aan Cloudflare**:
   - Ga naar Cloudflare Dashboard
   - Klik **Add Site**
   - Voer `auxilium-incasso.be` in
   - Kies het **Free plan**

2. **Update Nameservers**:
   - Cloudflare geeft je 2 nameservers (bijv. `ns1.cloudflare.com` en `ns2.cloudflare.com`)
   - Ga naar je domein registrar
   - Vervang de nameservers met die van Cloudflare
   - Wacht tot DNS is gepropageerd (kan 24-48 uur duren)

3. **Configureer DNS in Cloudflare**:
   - Voeg een **CNAME** record toe:
     ```
     Type: CNAME
     Name: @ (of auxilium-incasso.be)
     Value: cname.vercel-dns.com
     ```
   - Of gebruik **A record**:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     ```

4. **Koppel aan Vercel**:
   - Ga terug naar Vercel → Settings → Domains
   - Voeg `auxilium-incasso.be` toe
   - Vercel detecteert automatisch dat DNS correct is ingesteld

---

## Stap 4: SSL Certificaat (Automatisch)

✅ **Goed nieuws**: Vercel geeft automatisch een gratis SSL certificaat (Let's Encrypt)
- Dit gebeurt automatisch zodra je domein is gekoppeld
- Je website krijgt automatisch HTTPS
- Geen extra configuratie nodig!

---

## Stap 5: Test je Website

1. **Wacht tot DNS is gepropageerd** (5 minuten tot 48 uur, meestal binnen 1 uur)
2. **Test in browser**:
   - Open `https://auxilium-incasso.be`
   - Controleer of je website laadt
   - Controleer of SSL werkt (groen slotje in browser)

3. **Test www subdomain** (als je die hebt toegevoegd):
   - Open `https://www.auxilium-incasso.be`
   - Controleer of het werkt

---

## Stap 6: Update Environment Variables

Update je `.env` bestand en Vercel environment variables:

```env
# Update deze in Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_APP_URL=https://auxilium-incasso.be
```

**Belangrijk**: Update dit ook in je **Vercel project settings**:
1. Ga naar Vercel → Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` naar `https://auxilium-incasso.be`
3. Herdeploy je applicatie

---

## Stap 7: Email Setup (Resend)

Nu je eigen domein hebt, kun je je email verifiëren in Resend:

1. **Ga naar Resend Dashboard** → **Domains**
2. **Klik "Add Domain"**
3. **Voer in**: `auxilium-incasso.be`
4. **Voeg DNS records toe** bij je registrar:
   - SPF record
   - DKIM record (Resend geeft je de exacte waarde)
   - DMARC record
5. **Wacht op verificatie** (kan enkele uren duren)
6. **Update `.env`**:
   ```env
   RESEND_VERIFIED_DOMAIN=auxilium-incasso.be
   RESEND_FROM_EMAIL=Auxilium Incasso <noreply@auxilium-incasso.be>
   ```

Zie `RESEND_EMAIL_SETUP.md` voor gedetailleerde instructies.

---

## Troubleshooting

### Domein laadt niet
- **Check DNS propagation**: Gebruik [whatsmydns.net](https://www.whatsmydns.net) om te zien of DNS wereldwijd is gepropageerd
- **Check Vercel**: Zorg dat je project correct is gedeployed
- **Wacht langer**: DNS kan tot 48 uur duren (meestal binnen 1 uur)

### SSL certificaat werkt niet
- Wacht 5-10 minuten na domein koppeling
- Check of je HTTPS gebruikt (niet HTTP)
- Vercel geeft automatisch SSL, maar het kan even duren

### Email werkt niet
- Check of DNS records correct zijn toegevoegd
- Wacht tot DNS is gepropageerd (kan 24-48 uur duren)
- Check Resend dashboard voor verificatie status

### Nameserver errors
- Zorg dat je de juiste nameservers hebt gebruikt
- Wacht tot nameservers zijn gepropageerd (kan 24-48 uur duren)
- Check of je registrar nameserver wijzigingen ondersteunt

---

## Kosten Overzicht

| Item | Kosten |
|------|--------|
| Domein (.be) | €8-20/jaar |
| Vercel Hosting | **Gratis** (Hobby plan) |
| SSL Certificaat | **Gratis** (automatisch) |
| Resend Email | **Gratis** (100 emails/dag) |
| **Totaal eerste jaar** | **€8-20** |
| **Totaal per jaar** | **€8-20** |

---

## Checklist

- [ ] Domein geregistreerd bij gekozen registrar
- [ ] DNS records toegevoegd bij registrar
- [ ] Domein gekoppeld aan Vercel
- [ ] SSL certificaat actief (automatisch)
- [ ] Website laadt op https://auxilium-incasso.be
- [ ] Environment variables geüpdatet in Vercel
- [ ] Email domein geverifieerd in Resend (optioneel)
- [ ] Test emails werken (optioneel)

---

## Volgende Stappen

Na het koppelen van je domein:
1. ✅ Test alle functionaliteit op het live domein
2. ✅ Update alle interne links/redirects
3. ✅ Setup email verificatie in Resend
4. ✅ Test email functionaliteit
5. ✅ Monitor website performance

**Veel succes met je domein setup! 🚀**
