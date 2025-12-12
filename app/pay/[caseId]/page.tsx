import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: { caseId: string };
  searchParams: { ref?: string };
}) {
  const supabase = await createClient();

  // Get case (public access, no auth required)
  const { data: caseItem, error } = await supabase
    .from("cases")
    .select("*, debtors(*)")
    .eq("id", params.caseId)
    .single();

  if (error || !caseItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Betalingsverzoek niet gevonden</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Het betalingsverzoek kon niet worden gevonden.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = caseItem.status === "paid" || caseItem.status === "closed";
  const iban = process.env.PAYMENT_IBAN || "BE68539007547034";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Betalingsverzoek</CardTitle>
            <CardDescription>Auxilium Incasso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPaid ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Betaald</h2>
                <p className="text-muted-foreground">
                  Dit betalingsverzoek is reeds betaald.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Debiteur</h3>
                  <p>
                    {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekend"}
                  </p>
                  {caseItem.debtors?.email && (
                    <p className="text-sm text-muted-foreground">{caseItem.debtors.email}</p>
                  )}
                </div>

                {caseItem.invoice_number && (
                  <div>
                    <h3 className="font-semibold mb-2">Factuurnummer</h3>
                    <p>{caseItem.invoice_number}</p>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Te betalen bedrag</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Hoofdsom:</span>
                      <span>{formatCurrency(caseItem.principal_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bijkomende kosten:</span>
                      <span>{formatCurrency(caseItem.additional_costs)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Totaal:</span>
                      <span>{formatCurrency(caseItem.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Betalingsinstructies</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Rekeningnummer (IBAN):</div>
                      <div className="font-mono text-lg">{iban}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Structured reference:</div>
                      <div className="font-mono text-lg">{caseItem.structured_reference}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Bedrag:</div>
                      <div className="font-semibold text-lg">
                        {formatCurrency(caseItem.total_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Online betalen</h4>
                  <p className="text-sm text-muted-foreground">
                    Online betalen is binnenkort beschikbaar. U kunt voorlopig betalen via
                    overschrijving met de gegevens hierboven.
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    Gelieve het bedrag over te maken met de structured reference hierboven.
                    Na ontvangst van de betaling wordt deze verwerkt.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

