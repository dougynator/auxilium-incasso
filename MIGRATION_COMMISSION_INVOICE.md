# Migratie: Commission Invoice Sent Kolom

## Probleem
De kolom `commission_invoice_sent` ontbreekt in de `cases` tabel, waardoor je de comissiefactuur checkbox niet kunt gebruiken.

## Oplossing
Voer de volgende SQL uit in de Supabase SQL Editor:

```sql
-- Add commission invoice field to cases table
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS commission_invoice_sent BOOLEAN DEFAULT FALSE;

-- Create index for commission_invoice_sent
CREATE INDEX IF NOT EXISTS idx_cases_commission_invoice ON cases(commission_invoice_sent);
```

## Stappen
1. Ga naar je Supabase Dashboard
2. Klik op "SQL Editor" in het linker menu
3. Klik op "New query"
4. Plak de bovenstaande SQL code
5. Klik op "Run" of druk op Ctrl+Enter
6. Controleer of de migratie succesvol is (je zou "Success" moeten zien)

## Verificatie
Na het uitvoeren van de migratie, controleer of de kolom bestaat:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'cases' AND column_name = 'commission_invoice_sent';
```

Je zou moeten zien:
- column_name: commission_invoice_sent
- data_type: boolean
- column_default: false

## Optioneel: Bailiff Status Toevoegen
Als je ook de "Deurwaarder" status wilt gebruiken, voer dan ook dit uit:
```sql
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'bailiff';
```

