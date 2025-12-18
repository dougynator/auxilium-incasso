import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #ddd',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    borderTop: '2 solid #333',
    paddingTop: 8,
    marginTop: 8,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #ddd',
    fontSize: 10,
    color: '#666',
  },
});

interface PaymentRequestPDFProps {
  debtorName: string;
  debtorAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  structuredReference: string;
  principalAmount: number;
  additionalCosts: number;
  totalAmount: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
}

export function PaymentRequestPDF({
  debtorName,
  debtorAddress,
  structuredReference,
  principalAmount,
  additionalCosts,
  totalAmount,
  invoiceNumber,
  invoiceDate,
  dueDate,
}: PaymentRequestPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Auxilium Incasso</Text>
          <Text>Betalingsverzoek</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debiteur</Text>
          <Text>{debtorName}</Text>
          {debtorAddress?.street && (
            <Text>{debtorAddress.street}</Text>
          )}
          {debtorAddress?.postalCode && debtorAddress?.city && (
            <Text>{debtorAddress.postalCode} {debtorAddress.city}</Text>
          )}
          {debtorAddress?.country && (
            <Text>{debtorAddress.country}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Factuurgegevens</Text>
          {invoiceNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Factuurnummer:</Text>
              <Text style={styles.value}>{invoiceNumber}</Text>
            </View>
          )}
          {invoiceDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Factuurdatum:</Text>
              <Text style={styles.value}>{formatDate(invoiceDate)}</Text>
            </View>
          )}
          {dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Vervaldatum:</Text>
              <Text style={styles.value}>{formatDate(dueDate)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bedrag</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Hoofdsom</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(principalAmount)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Bijkomende kosten</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(additionalCosts)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.tableCell}>Totaal te betalen</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Betalingsinstructies</Text>
          <Text style={{ marginBottom: 10 }}>
            Structured reference: {structuredReference}
          </Text>
          <Text>
            Gelieve het bedrag over te maken naar het rekeningnummer dat u ontvangt 
            via de betalingslink in de e-mail.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Dit document is gegenereerd op {formatDate(new Date())}</Text>
          <Text>Auxilium Incasso - Professioneel incassobureau</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePaymentRequestPDF(props: PaymentRequestPDFProps): Promise<Buffer> {
  // Use React.createElement instead of JSX to avoid React 19 compatibility issues
  const doc = React.createElement(PaymentRequestPDF, props);
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

