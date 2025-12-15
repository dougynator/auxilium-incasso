"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SavedInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  amount: number;
  currency: string;
  debtor_name?: string;
  debtor_email?: string;
  debtor_vat_number?: string;
  debtor_address_street?: string;
  debtor_address_city?: string;
  debtor_address_postal_code?: string;
  debtor_address_country?: string;
}

interface SavedDebtor {
  id: string;
  name?: string;
  company_name?: string;
  email: string;
  vat_number?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
}

interface BibliotheekSelectorProps {
  onSelectInvoice?: (invoice: SavedInvoice) => void;
  onSelectDebtor?: (debtor: SavedDebtor) => void;
}

export function BibliotheekSelector({ onSelectInvoice, onSelectDebtor }: BibliotheekSelectorProps) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [debtors, setDebtors] = useState<SavedDebtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [selectedDebtor, setSelectedDebtor] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, debtorsRes] = await Promise.all([
        fetch("/api/bibliotheek/invoices"),
        fetch("/api/bibliotheek/debtors"),
      ]);

      const invoicesData = await invoicesRes.json();
      const debtorsData = await debtorsRes.json();

      if (invoicesData.invoices) setInvoices(invoicesData.invoices);
      if (debtorsData.debtors) setDebtors(debtorsData.debtors);
    } catch (error) {
      console.error("Error loading bibliotheek data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInvoice = (invoice: SavedInvoice) => {
    setSelectedInvoice(invoice.id);
    if (onSelectInvoice) {
      onSelectInvoice(invoice);
    }
  };

  const handleSelectDebtor = (debtor: SavedDebtor) => {
    setSelectedDebtor(debtor.id);
    if (onSelectDebtor) {
      onSelectDebtor(debtor);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="font-sans text-muted-foreground">Bibliotheek laden...</p>
      </div>
    );
  }

  if (invoices.length === 0 && debtors.length === 0) {
    return null; // Don't show if no items
  }

  return (
    <div className="space-y-4">
      {debtors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Relaties uit bibliotheek</CardTitle>
            <CardDescription className="font-sans">
              Selecteer een opgeslagen relatie om de gegevens automatisch in te vullen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {debtors.map((debtor) => (
                <button
                  key={debtor.id}
                  type="button"
                  onClick={() => handleSelectDebtor(debtor)}
                  className={`
                    w-full text-left p-3 border rounded-lg transition-colors
                    ${selectedDebtor === debtor.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-sans font-semibold">
                        {debtor.company_name || debtor.name || "Geen naam"}
                      </p>
                      <p className="font-sans text-sm text-muted-foreground">
                        {debtor.email}
                      </p>
                      {debtor.vat_number && (
                        <p className="font-sans text-xs text-muted-foreground">
                          BTW: {debtor.vat_number}
                        </p>
                      )}
                    </div>
                    {selectedDebtor === debtor.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Facturen uit bibliotheek</CardTitle>
            <CardDescription className="font-sans">
              Selecteer een opgeslagen factuur om de gegevens automatisch in te vullen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {invoices.map((invoice) => (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => handleSelectInvoice(invoice)}
                  className={`
                    w-full text-left p-3 border rounded-lg transition-colors
                    ${selectedInvoice === invoice.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-sans font-semibold">
                        {invoice.invoice_number || "Geen nummer"}
                      </p>
                      <p className="font-sans text-sm text-muted-foreground">
                        {invoice.debtor_name || invoice.debtor_email || "Onbekende debiteur"}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(invoice.invoice_date)}</span>
                        <span>{formatCurrency(invoice.amount, invoice.currency)}</span>
                      </div>
                    </div>
                    {selectedInvoice === invoice.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

