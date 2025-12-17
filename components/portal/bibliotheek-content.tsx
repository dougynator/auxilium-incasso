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
import { useTranslations } from 'next-intl';

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
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export default function BibliotheekContent() {
  const t = useTranslations('portal.library');
  const tCommon = useTranslations('common');
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
        title: tCommon('error'),
        description: t('invoices.error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm(t('invoices.deleteConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/bibliotheek/invoices/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      toast({
        title: tCommon('success'),
        description: t('invoices.deleted'),
      });

      loadData();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: tCommon('error'),
        description: t('invoices.error'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteDebtor = async (id: string) => {
    if (!confirm(t('debtors.deleteConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/bibliotheek/debtors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete debtor");
      }

      toast({
        title: tCommon('success'),
        description: t('debtors.deleted'),
      });

      loadData();
    } catch (error) {
      console.error("Error deleting debtor:", error);
      toast({
        title: tCommon('error'),
        description: t('debtors.error'),
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {t('title')}
        </h1>
        <p className="font-sans text-muted-foreground">
          {t('subtitle')}
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
                  <CardTitle className="font-display">{t('invoices.title')}</CardTitle>
                  <CardDescription className="font-sans">
                    {t('invoices.description')}
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
                {t('invoices.add')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground">{tCommon('loading')}</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground mb-4">
                  {t('invoices.noInvoices')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(invoice.invoice_date)} • {formatCurrency(invoice.amount)} {invoice.currency}
                      </div>
                      {invoice.debtor_name && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {invoice.debtor_name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/portal/bibliotheek/invoices/${invoice.id}`)}
                      >
                        {t('invoices.view')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                  <CardTitle className="font-display">{t('debtors.title')}</CardTitle>
                  <CardDescription className="font-sans">
                    {t('debtors.description')}
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
                {t('debtors.add')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground">{tCommon('loading')}</p>
              </div>
            ) : debtors.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground mb-4">
                  {t('debtors.noDebtors')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {debtors.map((debtor) => (
                  <div
                    key={debtor.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">
                        {debtor.name || debtor.company_name || "Onbekend"}
                      </div>
                      {debtor.email && (
                        <div className="text-sm text-muted-foreground">
                          {debtor.email}
                        </div>
                      )}
                      {debtor.company_name && debtor.name && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {debtor.company_name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/portal/bibliotheek/debtors/${debtor.id}`)}
                      >
                        {t('debtors.view')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDebtor(debtor.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {invoiceModalOpen && (
        <AddInvoiceModal
          open={invoiceModalOpen}
          onOpenChange={setInvoiceModalOpen}
          onSuccess={loadData}
        />
      )}

      {debtorModalOpen && (
        <AddDebtorModal
          open={debtorModalOpen}
          onOpenChange={setDebtorModalOpen}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

