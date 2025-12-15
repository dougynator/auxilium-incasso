/**
 * AI/OCR Invoice Parser
 * 
 * This module extracts invoice data from uploaded documents.
 * Uses pdf-parse for PDF text extraction and regex patterns for data extraction.
 * Can be enhanced with actual AI/OCR services like:
 * - Google Cloud Document AI
 * - AWS Textract
 * - Azure Form Recognizer
 * - OpenAI Vision API
 */

// Dynamic import for pdf-parse to avoid issues in serverless environments
let pdfParseModule: any = null;

async function getPdfParse() {
  if (!pdfParseModule) {
    try {
      // Use require for commonjs modules in Node.js runtime
      if (typeof require !== 'undefined') {
        const required = require('pdf-parse');
        // pdf-parse v2+ exports PDFParse class, older versions export function directly
        if (required.PDFParse) {
          // New version: use PDFParse class
          pdfParseModule = required.PDFParse;
          console.log('✅ Loaded pdf-parse PDFParse class');
        } else if (typeof required === 'function') {
          // Old version: function directly
          pdfParseModule = required;
          console.log('✅ Loaded pdf-parse as function');
        } else if (required.default && typeof required.default === 'function') {
          pdfParseModule = required.default;
          console.log('✅ Loaded pdf-parse default export');
        } else {
          // Try to find any function in the module
          const keys = Object.keys(required);
          console.log('pdf-parse module keys:', keys);
          throw new Error(`Could not find PDFParse function. Available keys: ${keys.join(', ')}`);
        }
      } else {
        // Fallback to dynamic import
        const module = await import('pdf-parse');
        pdfParseModule = module.PDFParse || module.default || module;
        console.log('✅ Loaded pdf-parse via import');
      }
      
      if (!pdfParseModule) {
        throw new Error('pdf-parse module not found');
      }
      
      // PDFParse can be a class (newer versions) or a function (older versions)
      // Classes are functions in JavaScript, so this check is fine
      if (typeof pdfParseModule !== 'function') {
        throw new Error(`pdf-parse is not a function or class, got type: ${typeof pdfParseModule}`);
      }
    } catch (error: any) {
      console.error('Failed to load pdf-parse:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw new Error(`PDF parsing library not available: ${error.message}`);
    }
  }
  return pdfParseModule;
}

export interface ExtractedInvoiceData {
  // Invoice details
  invoice_number?: string;
  invoice_date?: string; // ISO date string (YYYY-MM-DD)
  due_date?: string; // ISO date string (YYYY-MM-DD)
  amount?: number;
  currency?: string;

  // Debtor details
  debtor_name?: string;
  debtor_company_name?: string;
  debtor_email?: string;
  debtor_vat_number?: string;
  debtor_address_street?: string;
  debtor_address_city?: string;
  debtor_address_postal_code?: string;
  debtor_address_country?: string;
}

/**
 * Extract invoice data from a document file
 */
export async function extractInvoiceData(file: File): Promise<ExtractedInvoiceData> {
  console.log('🔍 Extracting invoice data from:', file.name, file.type);

  const extractedData: ExtractedInvoiceData = {
    currency: 'EUR',
    debtor_address_country: 'BE',
  };

  try {
    // Handle PDF files
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      // Convert to Uint8Array as required by pdf-parse v2+
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Get pdf-parse dynamically
      const PDFParseClass = await getPdfParse();
      
      console.log('✅ pdf-parse class found, creating instance with Uint8Array of size:', uint8Array.length);
      
      let text = '';
      
      try {
        // Create parser instance with Uint8Array (not Buffer)
        const parser = new PDFParseClass(uint8Array);
        
        // Use the getText() method to extract text
        const textResult = await parser.getText();
        
        console.log('getText() result type:', typeof textResult);
        console.log('getText() result:', textResult);
        
        // getText() might return an object or array, convert to string
        if (typeof textResult === 'string') {
          text = textResult;
        } else if (Array.isArray(textResult)) {
          // If it's an array, join the text
          text = textResult.map((item: any) => typeof item === 'string' ? item : item.text || '').join('\n');
        } else if (textResult && typeof textResult === 'object') {
          // If it's an object, try to get text property
          text = textResult.text || textResult.content || textResult.toString() || JSON.stringify(textResult);
        } else {
          text = String(textResult || '');
        }
        
        // Clean up the text - make sure it's a string before calling trim
        if (typeof text === 'string') {
          text = text.trim();
        } else {
          text = String(text).trim();
        }
        
        if (!text || text.length === 0) {
          console.warn('⚠️ No text extracted from PDF. The PDF might be scanned (image-based) or encrypted.');
          return extractedData;
        }
        
        console.log('📄 Extracted PDF text length:', text.length);
        console.log('📄 First 500 characters of PDF text:', text.substring(0, 500));
      } catch (error: any) {
        console.error('Error parsing PDF:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack?.substring(0, 500),
        });
        // Return empty data - user can fill manually
        text = '';
      }
      
      if (!text) {
        console.warn('⚠️ No text extracted from PDF. The PDF might be scanned (image-based) or encrypted.');
        return extractedData;
      }
      
      console.log('📄 Extracted PDF text length:', text.length);
      console.log('📄 First 500 characters of PDF text:', text.substring(0, 500));
      
      // Extract invoice number (common patterns) - prioritize "FACTUUR NR" field
      const invoiceNumberPatterns = [
        /FACTUUR\s*NR[\s:]*([0-9]{4}\s*\/\s*[0-9]+)/i, // "FACTUUR NR 2025 / 2025085"
        /(?:factuur\s*nr|factuurnummer|invoice\s*number|invoice\s*nr)[\s:]*([0-9]{4}\s*\/\s*[0-9]+|[0-9]{4,})/i,
        /([0-9]{4}\s*\/\s*[0-9]{4,})/i, // Format: 2025 / 2025085
        /(?:nr|no|#)[\s:]*([0-9]{4}\s*\/\s*[0-9]+|[0-9]+)/i,
        /INV[-\s]?([A-Z0-9\-/]+)/i,
        /FAC[-\s]?([A-Z0-9\-/]+)/i,
      ];
      
      // Exclude payment references (+++033/5220/70049+++)
      const excludePatterns = [
        /\+\+\+[\d\/]+\+\+\+/i, // Payment references
      ];
      
      for (const pattern of invoiceNumberPatterns) {
        const matches = Array.from(text.matchAll(new RegExp(pattern.source, pattern.flags + 'g')));
        for (const match of matches) {
          const invoiceNum = match[1] || match[0];
          // Skip if it's part of a payment reference
          const context = text.substring(Math.max(0, match.index! - 10), Math.min(text.length, match.index! + match[0].length + 10));
          if (excludePatterns.some(exclude => exclude.test(context))) {
            continue;
          }
          
          extractedData.invoice_number = invoiceNum.trim().replace(/\s+/g, ' '); // Normalize spaces
          console.log('✅ Found invoice number:', extractedData.invoice_number, 'using pattern:', pattern.toString());
          break;
        }
        if (extractedData.invoice_number) break;
      }
      
      if (!extractedData.invoice_number) {
        console.log('⚠️ No invoice number found. Tried patterns:', invoiceNumberPatterns.map(p => p.toString()));
      }

      // Extract dates (various formats) - use global flag for matchAll
      const datePatterns = [
        /(?:factuurdatum|invoice\s*date|date|datum)[\s:]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/gi,
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g, // DD/MM/YYYY format (most common in Belgium)
        /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g, // YYYY-MM-DD format
      ];
      
      const dates: string[] = [];
      for (const pattern of datePatterns) {
        try {
          const matches = Array.from(text.matchAll(pattern));
          for (const match of matches) {
            let day, month, year;
            
            // Check if it's YYYY-MM-DD format
            if (match[1].length === 4) {
              year = match[1];
              month = match[2].padStart(2, '0');
              day = match[3].padStart(2, '0');
            } else {
              day = match[1].padStart(2, '0');
              month = match[2].padStart(2, '0');
              year = match[3].length === 2 ? `20${match[3]}` : match[3];
            }
            
            // Validate date (day 1-31, month 1-12, year 2000-2100)
            const dayNum = parseInt(day);
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            
            if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 2000 && yearNum < 2100) {
              const dateStr = `${year}-${month}-${day}`;
              dates.push(dateStr);
            }
          }
        } catch (error) {
          // Skip if matchAll fails
          console.log('Pattern failed:', pattern.toString());
        }
      }
      
      // Remove duplicates and sort
      const uniqueDates = [...new Set(dates)].sort();
      
      if (uniqueDates.length > 0) {
        extractedData.invoice_date = uniqueDates[0];
        console.log('✅ Found invoice date:', extractedData.invoice_date);
      }
      if (uniqueDates.length > 1) {
        extractedData.due_date = uniqueDates[1];
        console.log('✅ Found due date:', extractedData.due_date);
      }
      
      if (uniqueDates.length === 0) {
        console.log('⚠️ No dates found in PDF');
      }

      // Extract due date specifically
      const dueDatePatterns = [
        /(?:vervaldatum|due\s*date|einddatum|payment\s*date|betalingstermijn)[\s:]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
        /(?:vervaldatum|due\s*date|einddatum|payment\s*date)[\s:]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/gi,
      ];
      
      for (const pattern of dueDatePatterns) {
        try {
          const match = text.match(pattern);
          if (match) {
            const dateMatch = match[0].match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
            if (dateMatch) {
              const day = dateMatch[1].padStart(2, '0');
              const month = dateMatch[2].padStart(2, '0');
              const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
              extractedData.due_date = `${year}-${month}-${day}`;
              console.log('✅ Found due date:', extractedData.due_date);
              break;
            }
          }
        } catch (error) {
          // Skip
        }
      }

      // Extract amount (EUR, €, or numbers with decimals) - prioritize "Totaal te betalen" or "Totaal incl. btw"
      const amountPatterns = [
        /(?:totaal\s*te\s*betalen|totaal\s*incl\.?\s*btw|totaal\s*inclusief)[\s:]*€\s*([\d.,]+)/gi,
        /(?:totaal|total|bedrag|amount|totaalbedrag)[\s:]*€\s*([\d.,]+)/gi,
        /€\s*([\d]{1,3}(?:\.\d{3})*(?:,\d{2})?)/g, // € 3.500,00 format
        /EUR\s*([\d.,]+)/gi,
        /([\d.,]+)\s*€/g,
      ];
      
      let maxAmount = 0;
      for (const pattern of amountPatterns) {
        try {
          const matches = Array.from(text.matchAll(pattern));
          for (const match of matches) {
            // Handle Belgian format: 3.500,00 (thousands separator is dot, decimal is comma)
            let amountStr = match[1];
            // If it has both dot and comma, it's Belgian format
            if (amountStr.includes('.') && amountStr.includes(',')) {
              amountStr = amountStr.replace(/\./g, '').replace(',', '.'); // Remove dots, replace comma with dot
            } else if (amountStr.includes(',')) {
              amountStr = amountStr.replace(',', '.'); // Replace comma with dot
            } else if (amountStr.includes('.')) {
              // Could be thousands separator or decimal - check if more than 3 digits after last dot
              const parts = amountStr.split('.');
              if (parts.length > 1 && parts[parts.length - 1].length <= 2) {
                // Likely decimal
                amountStr = amountStr.replace(/\./g, '').replace(',', '.');
              } else {
                // Likely thousands separator
                amountStr = amountStr.replace(/\./g, '');
              }
            }
            
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > maxAmount && amount < 10000000) { // Reasonable max
              maxAmount = amount;
            }
          }
        } catch (error) {
          // Skip if matchAll fails
        }
      }
      
      if (maxAmount > 0) {
        extractedData.amount = maxAmount;
        console.log('✅ Found amount:', extractedData.amount);
      } else {
        console.log('⚠️ No amount found in PDF');
      }

      // Extract VAT number (BE, NL, FR patterns) - prioritize debtor VAT, exclude sender VAT
      const vatPatterns = [
        /(BE|NL|FR|DE)[\s\.\-]?([\d]{3}[\s\.]?[\d]{3}[\s\.]?[\d]{3})/gi, // BE 0889.975.988 format
        /([A-Z]{2}\s?\d{3}\.?\d{3}\.?\d{3})/gi, // BE 0889.975.988 or BE0889.975.988
      ];
      
      // Find sender VAT to exclude it
      let senderVAT = '';
      const senderSection = text.substring(0, 500);
      for (const pattern of vatPatterns) {
        try {
          const matches = Array.from(senderSection.matchAll(pattern));
          if (matches.length > 0) {
            senderVAT = matches[0][0].replace(/\s+/g, '').replace(/\./g, '').toUpperCase();
            console.log('Found sender VAT (will exclude):', senderVAT);
            break;
          }
        } catch (error) {
          // Skip
        }
      }
      
      // Find debtor VAT (after debtor company name, exclude sender VAT)
      if (extractedData.debtor_company_name) {
        const debtorNamePos = text.indexOf(extractedData.debtor_company_name);
        if (debtorNamePos >= 0) {
          const debtorSection = text.substring(debtorNamePos, debtorNamePos + 200);
          
          for (const pattern of vatPatterns) {
            try {
              const matches = Array.from(debtorSection.matchAll(pattern));
              for (const match of matches) {
                const vatNumber = match[0].replace(/\s+/g, '').replace(/\./g, '').toUpperCase();
                // Exclude sender VAT and validate format
                if (vatNumber !== senderVAT && vatNumber.match(/^BE\d{9}$/)) {
                  extractedData.debtor_vat_number = vatNumber;
                  console.log('✅ Found debtor VAT number:', extractedData.debtor_vat_number);
                  break;
                }
              }
              if (extractedData.debtor_vat_number) break;
            } catch (error) {
              // Skip
            }
          }
        }
      }
      
      if (!extractedData.debtor_vat_number) {
        console.log('⚠️ No debtor VAT number found');
      }

      // Extract email - prioritize debtor email (usually after debtor name, not sender)
      const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
      const emailMatches = Array.from(text.matchAll(emailPattern));
      
      // Find emails and determine which is debtor vs sender
      // Usually sender email appears first, debtor email appears later or not at all
      // Look for email that appears after debtor company name
      if (emailMatches.length > 0) {
        // For now, if we found debtor company name, look for email after it
        // Otherwise, skip sender email (usually first one)
        if (extractedData.debtor_company_name || extractedData.debtor_name) {
          // Try to find email in debtor section (after company name)
          const debtorNamePos = text.indexOf(extractedData.debtor_company_name || extractedData.debtor_name || '');
          if (debtorNamePos >= 0) {
            const debtorSection = text.substring(debtorNamePos, debtorNamePos + 500);
            const debtorEmailMatch = debtorSection.match(emailPattern);
            if (debtorEmailMatch && debtorEmailMatch[0]) {
              extractedData.debtor_email = debtorEmailMatch[0].trim();
              console.log('✅ Found debtor email:', extractedData.debtor_email);
            }
          }
        }
        
        // If no debtor email found, don't use sender email
        if (!extractedData.debtor_email) {
          console.log('⚠️ No debtor email found (skipping sender email)');
        }
      } else {
        console.log('⚠️ No email found');
      }

      // Extract postal code and city (Belgian/Dutch format) - prioritize debtor address
      const postalCodePatterns = [
        /([1-9][0-9]{3})\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        /([1-9][0-9]{3})\s*([A-Z][a-z]+)/gi,
      ];
      
      // Find postal codes and determine which is debtor vs sender
      if (extractedData.debtor_company_name || extractedData.debtor_name) {
        const debtorNamePos = text.indexOf(extractedData.debtor_company_name || extractedData.debtor_name || '');
        if (debtorNamePos >= 0) {
          // Look in debtor section (500 chars after company name)
          const debtorSection = text.substring(debtorNamePos, debtorNamePos + 500);
          
          for (const pattern of postalCodePatterns) {
            try {
              const matches = Array.from(debtorSection.matchAll(pattern));
              for (const match of matches) {
                const postalCode = match[1];
                const city = match[2]?.trim();
                
                // Validate postal code (Belgian: 1000-9999, not starting with 0)
                if (postalCode && city && !city.match(/^(BE|NL|FR|DE|WWW|INFO|BANK)/i)) {
                  extractedData.debtor_address_postal_code = postalCode;
                  extractedData.debtor_address_city = city;
                  console.log('✅ Found debtor postal code:', postalCode, 'and city:', city);
                  break;
                }
              }
              if (extractedData.debtor_address_postal_code) break;
            } catch (error) {
              // Skip
            }
          }
        }
      }
      
      if (!extractedData.debtor_address_postal_code) {
        console.log('⚠️ No debtor postal code found');
      }

      // Extract street address - prioritize debtor address (after company name)
      if (extractedData.debtor_company_name || extractedData.debtor_name) {
        const debtorNamePos = text.indexOf(extractedData.debtor_company_name || extractedData.debtor_name || '');
        if (debtorNamePos >= 0) {
          const debtorSection = text.substring(debtorNamePos, debtorNamePos + 300);
          
          // Look for street pattern in debtor section
          const streetPatterns = [
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+\d+[a-z]?)$/m, // Full line match
            /([A-Z][a-z]+\s+\d+[a-z]?)/, // Simpler pattern
          ];
          
          const lines = debtorSection.split('\n');
          for (const line of lines.slice(0, 5)) { // Check first 5 lines after company name
            const trimmed = line.trim();
            for (const pattern of streetPatterns) {
              const match = trimmed.match(pattern);
              if (match) {
                const street = (match[2] || match[1]).trim();
                // Validate: should contain a number and be reasonable length
                if (street && street.match(/\d/) && street.length > 5 && street.length < 50) {
                  extractedData.debtor_address_street = street;
                  console.log('✅ Found debtor street:', street);
                  break;
                }
              }
            }
            if (extractedData.debtor_address_street) break;
          }
        }
      }
      
      if (!extractedData.debtor_address_street) {
        console.log('⚠️ No debtor street address found');
      }

      // Extract company name or debtor name - identify sender vs debtor sections
      const lines = text.split('\n');
      let senderEndIndex = -1;
      let debtorStartIndex = -1;
      
      // Find where sender section ends (usually after sender email/VAT)
      for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const trimmed = lines[i].trim();
        if (trimmed.match(/^(Wood|Info|Bankrekening|WWW)/i) || trimmed.includes('@woodandpartners.be')) {
          senderEndIndex = i;
        }
        // Look for debtor section start (after sender, before invoice details)
        if (senderEndIndex >= 0 && i > senderEndIndex + 1) {
          // Look for company name with BVBA/BV/etc or a name that's clearly not sender
          if (trimmed.match(/\b(BVBA|BV|NV|NV-SA|SPRL|VZW|ASBL|Mihali)\b/i) && 
              !trimmed.match(/^(Wood|Partners)/i)) {
            debtorStartIndex = i;
            break;
          }
        }
      }
      
      // Extract debtor info from debtor section
      if (debtorStartIndex >= 0) {
        const debtorSection = lines.slice(debtorStartIndex, debtorStartIndex + 10);
        
        for (const line of debtorSection) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.length < 3) continue;
          
          // Company name with legal form
          if (trimmed.match(/\b(BVBA|BV|NV|NV-SA|SPRL|VZW|ASBL)\b/i) && 
              trimmed.length > 5 && trimmed.length < 60 &&
              !trimmed.match(/^(Wood|Partners|Info|Bankrekening)/i)) {
            extractedData.debtor_company_name = trimmed;
            console.log('✅ Found debtor company name:', extractedData.debtor_company_name);
            break;
          }
        }
      }
      
      if (!extractedData.debtor_name && !extractedData.debtor_company_name) {
        console.log('⚠️ No debtor/company name found');
      }
      
      console.log('📊 Final extracted data:', JSON.stringify(extractedData, null, 2));

      console.log('✅ Extracted data:', extractedData);
    } else {
      console.warn('⚠️ File type not supported for automatic extraction:', file.type);
    }
  } catch (error: any) {
    console.error('❌ Error extracting invoice data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Return empty data structure on error - user can fill manually
  }

  return extractedData;
}

/**
 * Example implementation using a hypothetical OCR service:
 * 
 * async function extractInvoiceData(file: File): Promise<ExtractedInvoiceData> {
 *   // Convert file to base64 or buffer
 *   const fileBuffer = await file.arrayBuffer();
 *   
 *   // Call OCR service
 *   const ocrResult = await fetch('https://api.ocr-service.com/extract', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${process.env.OCR_API_KEY}`,
 *       'Content-Type': file.type,
 *     },
 *     body: fileBuffer,
 *   });
 *   
 *   const data = await ocrResult.json();
 *   
 *   // Parse and return structured data
 *   return {
 *     invoice_number: data.invoiceNumber,
 *     invoice_date: data.invoiceDate,
 *     due_date: data.dueDate,
 *     amount: parseFloat(data.totalAmount),
 *     currency: data.currency || 'EUR',
 *     debtor_name: data.customerName,
 *     debtor_email: data.customerEmail,
 *     debtor_vat_number: data.customerVatNumber,
 *     // ... etc
 *   };
 * }
 */

