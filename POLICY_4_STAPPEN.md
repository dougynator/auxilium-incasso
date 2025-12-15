# Stap-voor-stap: Policy 4 Toevoegen

## Policy 4: Users can read their organization's files

### Stap 1: Open de Policies tab
1. Ga naar Supabase Dashboard > Storage
2. Klik op de bucket **`case-attachments`**
3. Klik op de tab **"Policies"** (bovenaan de pagina)
4. Je zou nu 3 policies moeten zien (Policy 1, 2 en 3)

### Stap 2: Start nieuwe policy
1. Klik op de knop **"New Policy"** (rechtsboven)
2. Kies **"For full customization"** (of "Create policy from scratch")

### Stap 3: Vul Policy Name in
1. In het veld **"Policy name"** typ:
   ```
   Users can read their organization's files
   ```

### Stap 4: Selecteer Allowed Operation
1. Bij **"Allowed operation"** vink je aan:
   - ✅ **SELECT** (vink dit aan)
   - ❌ INSERT (laat uit)
   - ❌ UPDATE (laat uit)
   - ❌ DELETE (laat uit)

### Stap 5: Kopieer de Policy Definition
1. Ga naar het grote tekstveld **"Policy definition"**
2. **Verwijder** alle tekst die er nu staat
3. **Kopieer** deze code en plak hem erin:

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

**BELANGRIJK:** 
- Kopieer de code **exact** zoals hierboven staat
- Let op de JOIN syntax
- Zorg dat `storage.foldername(name)[1]` correct is (zonder spaties)

### Stap 6: Sla de policy op
1. Scroll naar beneden in het modal
2. Klik op de groene knop **"Review"** (rechtsonder)
3. Controleer de samenvatting
4. Klik op **"Save policy"** of **"Create policy"**

### Stap 7: Verificatie
- Je zou nu **4 policies** moeten zien in de lijst:
  1. Users can upload attachments (INSERT)
  2. Users can read their own attachments (SELECT)
  3. Admin and staff can read all attachments (SELECT)
  4. Users can read their organization's files (SELECT)

### Stap 8: Test de upload
1. Ga terug naar je applicatie
2. Probeer een factuur toe te voegen via de bibliotheek pagina
3. Als alles werkt, zou je geen "Permission denied" fout moeten krijgen!

---

## ✅ Klaar!

Alle 4 policies zijn nu toegevoegd. Je Storage bucket is nu volledig geconfigureerd voor:
- ✅ Uploads door alle ingelogde gebruikers
- ✅ Lezen van eigen bestanden
- ✅ Lezen door admins/staff van alle bestanden
- ✅ Lezen van organisatie bestanden

