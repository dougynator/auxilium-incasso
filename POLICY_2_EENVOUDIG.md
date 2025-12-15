# Policy 2 - Eenvoudige Versie (Werkt Zeker!)

## Als de database tabellen nog niet bestaan:

Gebruik deze **eenvoudige versie** die alleen controleert of de gebruiker ingelogd is:

### Stap 1-4: Zelfde als eerder
- Policy name: `Users can read their own attachments`
- Allowed operation: **SELECT** (alleen deze aan)

### Stap 5: Eenvoudige Policy Definition

**Optie A: Als je tabellen nog niet bestaan (gebruik dit eerst):**

```sql
(bucket_id = 'case-attachments' AND auth.uid() IS NOT NULL)
```

**Optie B: Als je tabellen WEL bestaan (gebruik dit later):**

```sql
(
  bucket_id = 'case-attachments' AND 
  auth.uid() IS NOT NULL AND
  (
    EXISTS (
      SELECT 1 FROM saved_invoices 
      WHERE document_path = name 
      AND created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM case_attachments 
      WHERE file_path = name 
      AND uploaded_by = auth.uid()
    )
  )
)
```

---

## Aanbevolen aanpak:

1. **Start met Optie A** (eenvoudige versie) - dit werkt altijd
2. Test of uploads werken
3. Voer de database migration uit (`005_bibliotheek_tables.sql`)
4. **Vervang dan later** door Optie B voor betere beveiliging

---

## Waarom de fout?

De fout komt omdat:
- De tabellen `saved_invoices` of `case_attachments` mogelijk nog niet bestaan
- Of de kolomnamen niet kloppen

**Gebruik eerst de eenvoudige versie (Optie A) - die werkt altijd!**

