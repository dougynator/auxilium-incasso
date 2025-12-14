import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plug, CheckCircle2, XCircle } from "lucide-react";

export default async function IntegratiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profiel niet gevonden</h2>
      </div>
    );
  }

  // Placeholder integraties - later uit database halen
  const integrations = [
    {
      name: "API Integratie",
      description: "Koppel je eigen systeem aan via onze API",
      status: "available",
      icon: Plug,
    },
    {
      name: "Webhook Integratie",
      description: "Ontvang real-time updates via webhooks",
      status: "available",
      icon: Plug,
    },
    {
      name: "CSV Import",
      description: "Importeer meerdere opdrachten via CSV bestand",
      status: "coming_soon",
      icon: Plug,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Integraties
        </h1>
        <p className="font-sans text-muted-foreground">
          Koppel je systemen aan Auxilium voor geautomatiseerde opdracht indiening
        </p>
      </div>

      <div className="grid gap-6">
        {integrations.map((integration, index) => {
          const Icon = integration.icon;
          const isAvailable = integration.status === "available";
          
          return (
            <Card key={index} className={!isAvailable ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-xl">
                        {integration.name}
                      </CardTitle>
                      <CardDescription className="font-sans">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAvailable ? (
                      <>
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-sans text-sm font-medium">Beschikbaar</span>
                        </div>
                        <Button className="font-sans bg-primary hover:bg-primary/90">
                          Activeren
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <XCircle className="w-5 h-5" />
                          <span className="font-sans text-sm">Binnenkort beschikbaar</span>
                        </div>
                        <Button disabled variant="outline" className="font-sans">
                          Binnenkort
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

