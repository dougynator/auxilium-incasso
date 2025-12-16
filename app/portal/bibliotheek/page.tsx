"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Dynamically import modals to prevent SSR issues
const AddInvoiceModal = dynamic(
  () => import("@/components/bibliotheek/add-invoice-modal").then(mod => ({ default: mod.AddInvoiceModal })),
  { ssr: false }
);
const AddDebtorModal = dynamic(
  () => import("@/components/bibliotheek/add-debtor-modal").then(mod => ({ default: mod.AddDebtorModal })),
  { ssr: false }
);

interface SavedInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  amount: number;
  currency: string;
  debtor_name?: string;
  debtor_email?: string;
  document_name?: string;
  created_at: string;
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
  created_at: string;
}

export default function BibliotheekPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [debtors, setDebtors] = useState<SavedDebtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [debtorModalOpen, setDebtorModalOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load invoices
      const invoicesResponse = await fetch("/api/bibliotheek/invoices");
      const invoicesData = await invoicesResponse.json();
      if (invoicesData.invoices) {
        setInvoices(invoicesData.invoices);
      }

      // Load debtors
      const debtorsResponse = await fetch("/api/bibliotheek/debtors");
      const debtorsData = await debtorsResponse.json();
      if (debtorsData.debtors) {
        setDebtors(debtorsData.debtors);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Fout",
        description: "Kon gegevens niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze factuur wilt verwijderen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bibliotheek/invoices/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Succes",
          description: "Factuur verwijderd",
        });
        loadData();
      } else {
        throw new Error("Verwijderen mislukt");
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon factuur niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDebtor = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze relatie wilt verwijderen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bibliotheek/debtors/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Succes",
          description: "Relatie verwijderd",
        });
        loadData();
      } else {
        throw new Error("Verwijderen mislukt");
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon relatie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Bibliotheek
        </h1>
        <p className="font-sans text-muted-foreground">
          Beheer je opgeslagen facturen en relaties voor snelle opdracht indiening
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Facturen sectie */}
        <Card className="flex-1 w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display">Facturen</CardTitle>
                  <CardDescription className="font-sans">
                    Opgeslagen facturen voor snelle hergebruik
                  </CardDescription>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="font-sans"
                onClick={() => setInvoiceModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Toevoegen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground">Laden...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground mb-4">
                  Nog geen facturen opgeslagen
                </p>
                <p className="font-sans text-sm text-muted-foreground">
                  Voeg facturen toe om ze snel te kunnen hergebruiken bij het indienen van nieuwe opdrachten
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/portal/bibliotheek/invoices/${invoice.id}`)}
                      >
                        <p className="font-sans font-semibold">
                          {invoice.invoice_number || "Geen nummer"}
                        </p>
                        <p className="font-sans text-sm text-muted-foreground">
                          {invoice.debtor_name || invoice.debtor_email || "Onbekende debiteur"}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{formatDate(invoice.invoice_date)}</span>
                          <span>{formatCurrency(invoice.amount, invoice.currency)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInvoice(invoice.id);
                          }}
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Relaties sectie */}
        <Card className="flex-1 w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display">Relaties</CardTitle>
                  <CardDescription className="font-sans">
                    Opgeslagen debiteuren en contactgegevens
                  </CardDescription>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="font-sans"
                onClick={() => setDebtorModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Toevoegen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground">Laden...</p>
              </div>
            ) : debtors.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground mb-4">
                  Nog geen relaties opgeslagen
                </p>
                <p className="font-sans text-sm text-muted-foreground">
                  Voeg relaties toe om sneller opdrachten in te dienen met bekende debiteuren
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {debtors.map((debtor) => (
                  <div
                    key={debtor.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/portal/bibliotheek/debtors/${debtor.id}`)}
                      >
                        <p className="font-sans font-semibold">
                          {debtor.company_name || debtor.name || "Geen naam"}
                        </p>
                        <p className="font-sans text-sm text-muted-foreground">
                          {debtor.email}
                        </p>
                        {debtor.vat_number && (
                          <p className="font-sans text-sm text-muted-foreground">
                            BTW: {debtor.vat_number}
                          </p>
                        )}
                        {(debtor.address_street || debtor.address_city) && (
                          <p className="font-sans text-sm text-muted-foreground mt-1">
                            {debtor.address_street}
                            {debtor.address_street && debtor.address_city && ", "}
                            {debtor.address_postal_code} {debtor.address_city}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDebtor(debtor.id);
                          }}
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        onSuccess={() => {
          loadData();
          setInvoiceModalOpen(false);
        }}
      />
      <AddDebtorModal
        open={debtorModalOpen}
        onOpenChange={setDebtorModalOpen}
        onSuccess={() => {
          loadData();
          setDebtorModalOpen(false);
        }}
      />
    </div>
  );
}
