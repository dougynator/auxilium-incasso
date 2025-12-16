# Supabase Storage Bucket Setup

## Handmatig aanmaken via Supabase Dashboard

### Stap 1: Ga naar Storage
1. Log in op je Supabase project: https://supabase.com
2. Klik op **"Storage"** in het linker menu
3. Je ziet een overzicht van alle storage buckets

### Stap 2: Maak nieuwe bucket aan
1. Klik op **"New bucket"** of **"Create bucket"**
2. Vul de volgende gegevens in:
   - **Name**: `case-attachments`
   - **Public bucket**: **UIT** (niet aanvinken - dit is een private bucket)
   - **File size limit**: `10 MB` (of 10485760 bytes)
   - **Allowed MIME types** (optioneel):
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `image/jpeg`
     - `image/png`

### Stap 3: Bucket policies instellen
1. Klik op de bucket `case-attachments`
2. Ga naar **"Policies"** tab
3. Klik op **"New Policy"**

#### Policy 1: Upload (voor gebruikers)
- **Policy name**: `Users can upload attachments`
- **Allowed operation**: `INSERT`
- **Policy definition**:
```sql
(authenticated() AND (bucket_id = 'case-attachments'))
```

#### Policy 2: Read (voor gebruikers die de case hebben aangemaakt)
- **Policy name**: `Users can read their own attachments`
- **Allowed operation**: `SELECT`
- **Policy definition**:
```sql
(
  authenticated() AND 
  (bucket_id = 'case-attachments') AND
  (auth.uid() IN (
    SELECT uploaded_by FROM case_attachments 
    WHERE file_path = (storage.foldername(name))[1] || '/' || (storage.foldername(name))[2]
  ))
)
```

#### Policy 3: Read (voor admin/staff)
- **Policy name**: `Admin and staff can read all attachments`
- **Allowed operation**: `SELECT`
- **Policy definition**:
```sql
(
  authenticated() AND 
  (bucket_id = 'case-attachments') AND
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'staff')
  ))
)
```

## Automatisch aanmaken (via code)

De code probeert automatisch de bucket aan te maken als deze niet bestaat. Dit werkt alleen als:
- Je Service Role Key de juiste permissions heeft
- Storage API is ingeschakeld in je Supabase project

Als automatisch aanmaken niet werkt, maak de bucket handmatig aan via het dashboard (zie boven).

## Verificatie

Na het aanmaken van de bucket:
1. Test of je een bestand kunt uploaden via het formulier
2. Controleer in Supabase Storage of het bestand is geüpload
3. Controleer in de `case_attachments` tabel of er een record is aangemaakt

## Troubleshooting

### Fout: "Bucket not found"
- Maak de bucket handmatig aan via het dashboard
- Controleer of de bucket naam exact `case-attachments` is (geen spaties, kleine letters)

### Fout: "Permission denied"
- Controleer of de Storage policies correct zijn ingesteld
- Controleer of je Service Role Key correct is in `.env`

### Fout: "File too large"
- Verhoog de `fileSizeLimit` in de bucket settings
- Of verklein het bestand dat je probeert te uploaden


