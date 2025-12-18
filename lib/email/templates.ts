import { formatCurrency, formatDate } from "@/lib/utils";

// Company physical address for email footer (required by law in EU)
const COMPANY_ADDRESS = `
Auxilium Incasso<br />
Kerkstraat 123<br />
1000 Brussel<br />
België
`;

export interface DebtorEmailData {
  debtorName: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  principalAmount: number;
  additionalCosts: number;
  totalAmount: number;
  structuredReference: string;
  paymentUrl: string;
}

export interface ClientEmailData {
  clientName: string;
  caseId: string;
  debtorName: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  principalAmount: number;
  additionalCosts: number;
  totalAmount: number;
  structuredReference: string;
  caseUrl: string;
}

export interface InternalEmailData {
  caseId: string;
  organizationName: string;
  clientName: string;
  debtorName: string;
  debtorEmail: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  principalAmount: number;
  additionalCosts: number;
  totalAmount: number;
  structuredReference: string;
  caseUrl: string;
}

export function generateDebtorEmail(data: DebtorEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div>
    <h1 style="color: #2563eb; margin-bottom: 20px;">
      Auxilium Incasso
    </h1>
    
    <p>Beste ${data.debtorName},</p>
    
    <p>
      U ontvangt deze e-mail omdat er een betalingsverzoek is ingediend voor een openstaande factuur.
    </p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0">
      <h2 style="margin-top: 0">Betalingsverzoek</h2>
      
      ${data.invoiceNumber ? `<p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>` : ''}
      
      ${data.invoiceDate ? `<p><strong>Factuurdatum:</strong> ${formatDate(data.invoiceDate)}</p>` : ''}
      
      ${data.dueDate ? `<p><strong>Vervaldatum:</strong> ${formatDate(data.dueDate)}</p>` : ''}
      
      <table style="width: 100%; margin-top: 15px; border-collapse: collapse">
        <tr>
          <td style="padding: 8px 0">Hoofdsom:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.principalAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0">Bijkomende kosten:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.additionalCosts)}</td>
        </tr>
        <tr style="border-top: 2px solid #333; font-weight: bold">
          <td style="padding: 8px 0">Totaal te betalen:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.totalAmount)}</td>
        </tr>
      </table>
      
      <p style="margin-top: 15px">
        <strong>Structured reference:</strong> ${data.structuredReference}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0">
      <a
        href="${data.paymentUrl}"
        style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold"
      >
        Betaal nu
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666">
      U kunt ook betalen via overschrijving met de structured reference hierboven.
    </p>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666">
      Met vriendelijke groet,<br />
      Auxilium Incasso
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0" />
    
    <div style="font-size: 12px; color: #666; line-height: 1.6">
      <p style="margin: 0 0 10px 0"><strong>Auxilium Incasso</strong></p>
      ${COMPANY_ADDRESS}
      <p style="margin-top: 10px; margin-bottom: 0">
        <a href="mailto:info@auxiliumincasso.com" style="color: #2563eb; text-decoration: none">info@auxiliumincasso.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function generateClientEmail(data: ClientEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div>
    <h1 style="color: #2563eb; margin-bottom: 20px;">
      Auxilium Incasso
    </h1>
    
    <p>Beste ${data.clientName},</p>
    
    <p>
      We hebben uw opdracht ontvangen en in behandeling genomen. Hieronder vindt u een overzicht van de opdracht:
    </p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0">
      <h2 style="margin-top: 0">Opdrachtdetails</h2>
      
      <p><strong>Opdrachtnummer:</strong> ${data.caseId}</p>
      
      <p><strong>Debiteur:</strong> ${data.debtorName}</p>
      
      ${data.invoiceNumber ? `<p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>` : ''}
      
      ${data.invoiceDate ? `<p><strong>Factuurdatum:</strong> ${formatDate(data.invoiceDate)}</p>` : ''}
      
      ${data.dueDate ? `<p><strong>Vervaldatum:</strong> ${formatDate(data.dueDate)}</p>` : ''}
      
      <table style="width: 100%; margin-top: 15px; border-collapse: collapse">
        <tr>
          <td style="padding: 8px 0">Hoofdsom:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.principalAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0">Bijkomende kosten:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.additionalCosts)}</td>
        </tr>
        <tr style="border-top: 2px solid #333; font-weight: bold">
          <td style="padding: 8px 0">Totaal bedrag:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.totalAmount)}</td>
        </tr>
      </table>
      
      <p style="margin-top: 15px">
        <strong>Structured reference:</strong> ${data.structuredReference}
      </p>
    </div>
    
    <p>
      De debiteur is gecontacteerd en heeft een betalingsverzoek ontvangen. We houden u op de hoogte van de voortgang.
    </p>
    
    <div style="text-align: center; margin: 30px 0">
      <a
        href="${data.caseUrl}"
        style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold"
      >
        Bekijk opdracht
      </a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666">
      Met vriendelijke groet,<br />
      Auxilium Incasso
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0" />
    
    <div style="font-size: 12px; color: #666; line-height: 1.6">
      <p style="margin: 0 0 10px 0"><strong>Auxilium Incasso</strong></p>
      ${COMPANY_ADDRESS}
      <p style="margin-top: 10px; margin-bottom: 0">
        <a href="mailto:info@auxiliumincasso.com" style="color: #2563eb; text-decoration: none">info@auxiliumincasso.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function generateInternalEmail(data: InternalEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div>
    <h1 style="color: #2563eb; margin-bottom: 20px;">
      Nieuwe Opdracht Aangemaakt
    </h1>
    
    <p>
      Er is een nieuwe opdracht aangemaakt in het systeem.
    </p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0">
      <h2 style="margin-top: 0">Opdrachtdetails</h2>
      
      <p><strong>Opdrachtnummer:</strong> ${data.caseId}</p>
      
      <p><strong>Klant:</strong> ${data.organizationName} (${data.clientName})</p>
      
      <p><strong>Debiteur:</strong> ${data.debtorName}</p>
      <p><strong>Debiteur e-mail:</strong> ${data.debtorEmail}</p>
      
      ${data.invoiceNumber ? `<p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>` : ''}
      
      ${data.invoiceDate ? `<p><strong>Factuurdatum:</strong> ${formatDate(data.invoiceDate)}</p>` : ''}
      
      ${data.dueDate ? `<p><strong>Vervaldatum:</strong> ${formatDate(data.dueDate)}</p>` : ''}
      
      <table style="width: 100%; margin-top: 15px; border-collapse: collapse">
        <tr>
          <td style="padding: 8px 0">Hoofdsom:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.principalAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0">Bijkomende kosten:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.additionalCosts)}</td>
        </tr>
        <tr style="border-top: 2px solid #333; font-weight: bold">
          <td style="padding: 8px 0">Totaal bedrag:</td>
          <td style="text-align: right; padding: 8px 0">${formatCurrency(data.totalAmount)}</td>
        </tr>
      </table>
      
      <p style="margin-top: 15px">
        <strong>Structured reference:</strong> ${data.structuredReference}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0">
      <a
        href="${data.caseUrl}"
        style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold"
      >
        Bekijk opdracht in admin panel
      </a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666">
      Deze e-mail is automatisch gegenereerd door het Auxilium Incasso systeem.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0" />
    
    <div style="font-size: 12px; color: #666; line-height: 1.6">
      <p style="margin: 0 0 10px 0"><strong>Auxilium Incasso</strong></p>
      ${COMPANY_ADDRESS}
      <p style="margin-top: 10px; margin-bottom: 0">
        <a href="mailto:info@auxiliumincasso.com" style="color: #2563eb; text-decoration: none">info@auxiliumincasso.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}


