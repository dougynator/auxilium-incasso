"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CaseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const queryString = params.toString();
    if (queryString !== searchParams.toString()) {
      router.push(`/admin/cases${queryString ? `?${queryString}` : ""}`);
    }
  }, [search, status, router, searchParams]);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    router.push("/admin/cases");
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Zoeken</label>
            <Input
              placeholder="Factuurnummer, debiteur, reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Alle statussen</option>
              <option value="draft">Concept</option>
              <option value="sent">Verzonden</option>
              <option value="in_progress">In behandeling</option>
              <option value="paid">Betaald</option>
              <option value="closed">Afgesloten</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              Filters wissen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

