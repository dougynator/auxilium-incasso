# Stap-voor-stap: Policy 2 Toevoegen

## Policy 2: Users can read their own attachments

### Stap 1: Open de Policies tab
1. Ga naar Supabase Dashboard > Storage
2. Klik op de bucket **`case-attachments`**
3. Klik op de tab **"Policies"** (bovenaan de pagina)

### Stap 2: Start nieuwe policy
1. Klik op de knop **"New Policy"** (rechtsboven)
2. Kies **"For full customization"** (of "Create policy from scratch")

### Stap 3: Vul Policy Name in
1. In het veld **"Policy name"** typ:
   ```
   Users can read their own attachments
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

**BELANGRIJK:** 
- Kopieer de code **exact** zoals hierboven staat
- Zorg dat alle haakjes correct zijn
- Zorg dat er geen extra spaties aan het begin/einde zijn

### Stap 6: Sla de policy op
1. Scroll naar beneden in het modal
2. Klik op de groene knop **"Review"** (rechtsonder)
3. Controleer de samenvatting
4. Klik op **"Save policy"** of **"Create policy"**

### Stap 7: Verificatie
- Je zou nu een nieuwe policy moeten zien in de lijst met de naam "Users can read their own attachments"
- Als je een foutmelding krijgt, controleer of:
  - De database tabellen `saved_invoices` en `case_attachments` bestaan (voer migration uit als nodig)
  - De SQL syntax exact is zoals hierboven

---

## Klaar voor Policy 3?

Als Policy 2 succesvol is toegevoegd, ga dan verder met Policy 3!

