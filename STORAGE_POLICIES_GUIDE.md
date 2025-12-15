# Stap-voor-stap: Storage Policies Toevoegen

## Stap 1: Ga naar je Supabase Dashboard
1. Open je browser en ga naar https://supabase.com
2. Log in met je account
3. Selecteer je project (Auxilium Incasso)

## Stap 2: Navigeer naar Storage
1. Klik in het linker menu op **"Storage"** (of het icoon met een mapje)
2. Je ziet nu een overzicht van alle storage buckets
3. Zoek de bucket **`case-attachments`** en klik erop
   - Als deze nog niet bestaat, maak hem eerst aan (zie SUPABASE_STORAGE_SETUP.md)

## Stap 3: Ga naar de Policies tab
1. Bovenin de bucket pagina zie je verschillende tabs: **Files**, **Policies**, **Settings**, etc.
2. Klik op de tab **"Policies"**
3. Je ziet nu een lijst met bestaande policies (mogelijk leeg als je net begint)

## Stap 4: Voeg Policy 1 toe - Upload voor alle ingelogde gebruikers

### 4a. Klik op "New Policy"
- Rechtsboven zie je een knop **"New Policy"** of **"Create Policy"**
- Klik hierop

### 4b. Kies "For full customization"
- Je krijgt opties: "For full customization" of "Using a template"
- Kies **"For full customization"** (of "Create policy from scratch")

### 4c. Vul de policy gegevens in:
- **Policy name**: `Users can upload attachments`
- **Allowed operation**: Selecteer **`INSERT`** uit de dropdown
- **Policy definition**: Kopieer en plak dit exact:

```sql
(bucket_id = 'case-attachments' AND auth.uid() IS NOT NULL)
```

**BELANGRIJK:** Gebruik `auth.uid() IS NOT NULL` in plaats van `authenticated()` - dit is de correcte syntax voor Storage policies!

### 4d. Sla op
- Klik op **"Review"** of **"Save"** of **"Create policy"**
- De policy wordt nu aangemaakt

## Stap 5: Voeg Policy 2 toe - Lezen voor gebruikers die bestanden hebben geüpload

### 5a. Klik opnieuw op "New Policy"

### 5b. Kies "For full customization"

### 5c. Vul de policy gegevens in:
- **Policy name**: `Users can read their own attachments`
- **Allowed operation**: Selecteer **`SELECT`** uit de dropdown
- **Policy definition**: Kopieer en plak dit exact:

```sql
(
  bucket_id = 'case-attachments' AND 
  auth.uid() IS NOT NULL AND
  (
    auth.uid() IN (
      SELECT created_by FROM saved_invoices 
      WHERE document_path = name
    )
    OR
    auth.uid() IN (
      SELECT uploaded_by FROM case_attachments 
      WHERE file_path = name
    )
  )
)
```

### 5d. Sla op
- Klik op **"Review"** of **"Save"**

## Stap 6: Voeg Policy 3 toe - Lezen voor admin en staff

### 6a. Klik opnieuw op "New Policy"

### 6b. Kies "For full customization"

### 6c. Vul de policy gegevens in:
- **Policy name**: `Admin and staff can read all attachments`
- **Allowed operation**: Selecteer **`SELECT`** uit de dropdown
- **Policy definition**: Kopieer en plak dit exact:

```sql
(
  bucket_id = 'case-attachments' AND 
  auth.uid() IS NOT NULL AND
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'staff')
  ))
)
```

### 6d. Sla op
- Klik op **"Review"** of **"Save"**

## Stap 7: Voeg Policy 4 toe - Lezen voor organisatie leden (voor bibliotheek)

### 7a. Klik opnieuw op "New Policy"

### 7b. Kies "For full customization"

### 7c. Vul de policy gegevens in:
- **Policy name**: `Users can read their organization's files`
- **Allowed operation**: Selecteer **`SELECT`** uit de dropdown
- **Policy definition**: Kopieer en plak dit exact:

```sql
(
  bucket_id = 'case-attachments' AND 
  auth.uid() IS NOT NULL AND
  (
    EXISTS (
      SELECT 1 FROM saved_invoices si
      JOIN profiles p ON p.organization_id = si.organization_id
      WHERE si.document_path = name
      AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM cases c
      JOIN profiles p ON p.organization_id = c.organization_id
      WHERE c.id::text = (storage.foldername(name))[1]
      AND p.id = auth.uid()
    )
  )
)
```

### 7d. Sla op
- Klik op **"Review"** of **"Save"**

## Stap 8: Verificatie

Na het toevoegen van alle policies:

1. **Controleer de policies lijst**
   - Je zou nu 4 policies moeten zien in de lijst
   - Controleer of alle namen correct zijn

2. **Test de upload**
   - Ga terug naar je applicatie
   - Probeer een factuur toe te voegen via de bibliotheek pagina
   - Als het werkt, zie je het bestand in de Storage bucket

3. **Controleer de bucket**
   - Ga terug naar Storage > case-attachments > Files
   - Je zou je geüploade bestand moeten zien in de map `bibliotheek/invoices/[jouw-org-id]/`

## Troubleshooting

### Als je een foutmelding krijgt bij het aanmaken van een policy:

1. **Syntax error**
   - Controleer of je de SQL exact hebt gekopieerd (inclusief haakjes)
   - Zorg dat er geen extra spaties zijn aan het begin/einde

2. **"relation does not exist"**
   - Dit betekent dat de database tabellen nog niet bestaan
   - Voer eerst de migration `005_bibliotheek_tables.sql` uit

3. **"permission denied"**
   - Controleer of je ingelogd bent als project owner/admin
   - Sommige policies kunnen alleen door project owners worden aangemaakt

### Als uploads nog steeds niet werken:

1. Controleer of de bucket naam exact `case-attachments` is (geen hoofdletters)
2. Controleer of de bucket **niet** public is (moet private zijn)
3. Controleer of je Service Role Key correct is ingesteld in `.env`

## Overzicht van alle policies:

| Policy naam | Operation | Doel |
|------------|-----------|------|
| Users can upload attachments | INSERT | Alle ingelogde gebruikers kunnen uploaden |
| Users can read their own attachments | SELECT | Gebruikers kunnen hun eigen bestanden lezen |
| Admin and staff can read all attachments | SELECT | Admins kunnen alle bestanden lezen |
| Users can read their organization's files | SELECT | Gebruikers kunnen bestanden van hun organisatie lezen |

