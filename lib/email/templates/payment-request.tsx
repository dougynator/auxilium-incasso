import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaymentRequestEmailProps {
  debtorName: string;
  caseId: string;
  structuredReference: string;
  principalAmount: number;
  additionalCosts: number;
  totalAmount: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  paymentUrl: string;
}

export function PaymentRequestEmail({
  debtorName,
  structuredReference,
  principalAmount,
  additionalCosts,
  totalAmount,
  invoiceNumber,
  invoiceDate,
  dueDate,
  paymentUrl,
}: PaymentRequestEmailProps) {
  return (
    <div>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        Auxilium Incasso
      </h1>
      
      <p>Beste {debtorName},</p>
      
      <p>
        U ontvangt deze e-mail omdat er een betalingsverzoek is ingediend voor een openstaande factuur.
      </p>
      
      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2 style={{ marginTop: 0 }}>Betalingsverzoek</h2>
        
        {invoiceNumber && (
          <p><strong>Factuurnummer:</strong> {invoiceNumber}</p>
        )}
        
        {invoiceDate && (
          <p><strong>Factuurdatum:</strong> {formatDate(invoiceDate)}</p>
        )}
        
        {dueDate && (
          <p><strong>Vervaldatum:</strong> {formatDate(dueDate)}</p>
        )}
        
        <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ padding: '8px 0' }}>Hoofdsom:</td>
            <td style={{ textAlign: 'right', padding: '8px 0' }}>{formatCurrency(principalAmount)}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0' }}>Bijkomende kosten:</td>
            <td style={{ textAlign: 'right', padding: '8px 0' }}>{formatCurrency(additionalCosts)}</td>
          </tr>
          <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
            <td style={{ padding: '8px 0' }}>Totaal te betalen:</td>
            <td style={{ textAlign: 'right', padding: '8px 0' }}>{formatCurrency(totalAmount)}</td>
          </tr>
        </table>
        
        <p style={{ marginTop: '15px' }}>
          <strong>Structured reference:</strong> {structuredReference}
        </p>
      </div>
      
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a
          href={paymentUrl}
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#fff',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
        >
          Betaal nu
        </a>
      </div>
      
      <p style={{ fontSize: '14px', color: '#666' }}>
        U kunt ook betalen via overschrijving met de structured reference hierboven.
      </p>
      
      <p style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        Met vriendelijke groet,<br />
        Auxilium Incasso
      </p>
    </div>
  );
}

