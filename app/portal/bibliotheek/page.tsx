import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Plus } from "lucide-react";

export default async function BibliotheekPage() {
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Facturen sectie */}
        <Card>
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
              <Button size="sm" variant="outline" className="font-sans">
                <Plus className="w-4 h-4 mr-2" />
                Toevoegen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="font-sans text-muted-foreground mb-4">
                Nog geen facturen opgeslagen
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                Voeg facturen toe om ze snel te kunnen hergebruiken bij het indienen van nieuwe opdrachten
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Relaties sectie */}
        <Card>
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
              <Button size="sm" variant="outline" className="font-sans">
                <Plus className="w-4 h-4 mr-2" />
                Toevoegen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="font-sans text-muted-foreground mb-4">
                Nog geen relaties opgeslagen
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                Voeg relaties toe om sneller opdrachten in te dienen met bekende debiteuren
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

