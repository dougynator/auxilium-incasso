# Stap-voor-stap: Policy 3 Toevoegen

## Policy 3: Admin and staff can read all attachments

### Stap 1: Open de Policies tab
1. Ga naar Supabase Dashboard > Storage
2. Klik op de bucket **`case-attachments`**
3. Klik op de tab **"Policies"** (bovenaan de pagina)
4. Je zou nu 2 policies moeten zien (Policy 1 en Policy 2)

### Stap 2: Start nieuwe policy
1. Klik op de knop **"New Policy"** (rechtsboven)
2. Kies **"For full customization"** (of "Create policy from scratch")

### Stap 3: Vul Policy Name in
1. In het veld **"Policy name"** typ:
   ```
   Admin and staff can read all attachments
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
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'staff')
  ))
)
```

**BELANGRIJK:** 
- Kopieer de code **exact** zoals hierboven staat
- Let op de dubbele haakjes rond EXISTS
- Zorg dat `'admin'` en `'staff'` tussen enkele aanhalingstekens staan

### Stap 6: Sla de policy op
1. Scroll naar beneden in het modal
2. Klik op de groene knop **"Review"** (rechtsonder)
3. Controleer de samenvatting
4. Klik op **"Save policy"** of **"Create policy"**

### Stap 7: Verificatie
- Je zou nu 3 policies moeten zien in de lijst
- Deze policy zorgt ervoor dat admins en staff alle bestanden kunnen lezen

---

## Klaar voor Policy 4?

Als Policy 3 succesvol is toegevoegd, ga dan verder met Policy 4!

