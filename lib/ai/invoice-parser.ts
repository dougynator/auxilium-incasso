import type { File } from "buffer";

/**
 * Extracts invoice data from a PDF or image file using OCR/AI
 */
export async function extractInvoiceData(file: File): Promise<{
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  amount?: number;
  currency?: string;
  debtor_name?: string;
  debtor_company_name?: string;
  debtor_email?: string;
  debtor_vat_number?: string;
  debtor_address_street?: string;
  debtor_address_city?: string;
  debtor_address_postal_code?: string;
  debtor_address_country?: string;
}> {
  try {
    // Dynamic import to handle Next.js bundling
    let pdfParse: any;
    try {
      const pdfParseModule = await import('pdf-parse');
      // Handle different export patterns
      if (typeof pdfParseModule === 'function') {
        pdfParse = pdfParseModule;
      } else if (pdfParseModule.default) {
        pdfParse = pdfParseModule.default;
      } else if (pdfParseModule.PDFParse) {
        pdfParse = pdfParseModule.PDFParse;
      } else {
        throw new Error('Could not find pdf-parse export');
      }
    } catch (importError) {
      console.error('Error importing pdf-parse:', importError);
      throw new Error('PDF parsing library not available');
    }

    // Convert File to Uint8Array for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Parse PDF
    let text: string;
    try {
      // Try different ways to call pdf-parse
      if (typeof pdfParse === 'function') {
        const result = await pdfParse(uint8Array);
        text = typeof result === 'string' ? result : (result.text || '');
      } else if (pdfParse.parse) {
        const result = await pdfParse.parse(uint8Array);
        text = typeof result === 'string' ? result : (result.text || '');
      } else if (pdfParse.default && typeof pdfParse.default === 'function') {
        const result = await pdfParse.default(uint8Array);
        text = typeof result === 'string' ? result : (result.text || '');
      } else {
        // Try instantiating as a class
        const parser = new pdfParse(uint8Array);
        text = await parser.getText();
      }
    } catch (parseError: any) {
      console.error('PDF parse error:', parseError);
      throw new Error(`Kon PDF niet lezen: ${parseError.message}`);
    }

    if (!text || typeof text !== 'string') {
      throw new Error('Geen tekst gevonden in PDF');
    }

    // Log first 500 characters for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 Extracted text (first 500 chars):', text.substring(0, 500));
    }

    // Extract data using regex patterns
    const extractedData: any = {
      currency: 'EUR',
      debtor_address_country: 'BE',
    };

    // Extract invoice number (various formats)
    const invoiceNumberPatterns = [
      /(?:factuur|invoice|factuurnummer|invoice number)[\s:]*([A-Z0-9\-]+)/i,
      /(?:nr|no|number)[\s:]*([A-Z0-9\-]+)/i,
      /(?:INV|FACT|FCT)[\s\-]*([0-9]+)/i,
      /([A-Z]{2,}[0-9]{4,})/,
    ];
    
    for (const pattern of invoiceNumberPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.invoice_number = match[1].trim();
        break;
      }
    }

    // Extract dates (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD formats)
    const datePatterns = [
      /(?:factuurdatum|invoice date|date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
    ];

    const dates: string[] = [];
    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        dates.push(...matches.slice(1));
      }
    }

    if (dates.length > 0) {
      // First date is usually invoice date
      extractedData.invoice_date = normalizeDate(dates[0]);
      // Second date might be due date
      if (dates.length > 1) {
        extractedData.due_date = normalizeDate(dates[1]);
      }
    }

    // Extract amount (EUR, €, or numbers with decimals)
    const amountPatterns = [
      /(?:totaal|total|bedrag|amount|totaalbedrag)[\s:]*[€EUR\s]*([0-9]+[.,][0-9]{2})/i,
      /([0-9]+[.,][0-9]{2})[€EUR\s]*(?:incl|excl|btw|vat)?/i,
      /€[\s]*([0-9]+[.,][0-9]{2})/i,
      /EUR[\s]*([0-9]+[.,][0-9]{2})/i,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amountStr = match[1].replace(',', '.');
        extractedData.amount = parseFloat(amountStr);
        break;
      }
    }

    // Extract VAT number (BE format: BE0123456789)
    const vatPatterns = [
      /(?:btw|vat|tva)[\s\-:]*([A-Z]{2}[0-9]{9,12})/i,
      /(BE[0-9]{10})/i,
      /([A-Z]{2}[0-9]{9,12})/,
    ];

    for (const pattern of vatPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.debtor_vat_number = match[1].trim().toUpperCase();
        break;
      }
    }

    // Extract email
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      extractedData.debtor_email = emailMatch[1].toLowerCase();
    }

    // Extract address (street, postal code, city)
    // Look for patterns like "Street Name 123, 1000 City"
    const addressPatterns = [
      /([A-Za-z\s]+[0-9]+)[,\s]+([0-9]{4})[,\s]+([A-Za-z\s]+)/,
      /([A-Za-z\s]+)[,\s]+([0-9]{4})[,\s]+([A-Za-z\s]+)/,
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2] && match[3]) {
        extractedData.debtor_address_street = match[1].trim();
        extractedData.debtor_address_postal_code = match[2].trim();
        extractedData.debtor_address_city = match[3].trim();
        break;
      }
    }

    // Extract debtor/company name
    // Usually at the top of the invoice
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Look for company name in first few lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      // Skip common headers
      if (line.match(/^(factuur|invoice|bill|rekening)/i)) continue;
      if (line.match(/^[0-9]+$/)) continue; // Skip line numbers
      
      // If line looks like a name/company (has letters, no @ symbol, reasonable length)
      if (line.length > 2 && line.length < 100 && !line.includes('@') && /[A-Za-z]/.test(line)) {
        // Check if it's likely a company name (has uppercase letters or common company suffixes)
        if (line.match(/[A-Z]/) || line.match(/(BV|NV|SA|SPRL|VOF|CV)/i)) {
          extractedData.debtor_company_name = line;
        } else if (!extractedData.debtor_name) {
          extractedData.debtor_name = line;
        }
        break;
      }
    }

    // Try to differentiate between sender and recipient
    // Usually recipient is mentioned with "aan" or "to" or "factuur voor"
    const recipientPatterns = [
      /(?:aan|to|factuur voor|bill to)[\s:]+([A-Za-z\s]+)/i,
      /(?:klant|customer|client)[\s:]+([A-Za-z\s]+)/i,
    ];

    for (const pattern of recipientPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const recipientName = match[1].trim();
        if (!extractedData.debtor_name && !extractedData.debtor_company_name) {
          if (recipientName.match(/(BV|NV|SA|SPRL|VOF|CV)/i)) {
            extractedData.debtor_company_name = recipientName;
          } else {
            extractedData.debtor_name = recipientName;
          }
        }
        break;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Extracted invoice data:', extractedData);
    }

    return extractedData;
  } catch (error: any) {
    console.error('Error extracting invoice data:', error);
    // Return empty data structure on error
    return {
      currency: 'EUR',
      debtor_address_country: 'BE',
    };
  }
}

/**
 * Normalizes date strings to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Remove any non-digit characters except separators
  const cleaned = dateStr.replace(/[^\d\/\-]/g, '');
  
  // Try to parse different formats
  const parts = cleaned.split(/[\/\-]/);
  
  if (parts.length === 3) {
    let day: string, month: string, year: string;
    
    // Check if it's YYYY-MM-DD format
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1].padStart(2, '0');
      day = parts[2].padStart(2, '0');
    } else {
      // Assume DD-MM-YYYY or DD/MM/YYYY
      day = parts[0].padStart(2, '0');
      month = parts[1].padStart(2, '0');
      year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    }
    
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

