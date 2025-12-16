"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
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
    const currentQuery = searchParams.toString();
    
    // Only update if the query string has actually changed
    if (queryString !== currentQuery) {
      router.push(`/admin/cases${queryString ? `?${queryString}` : ""}`);
    }
  }, [search, status, router]);

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
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Alle statussen</option>
              <option value="sent">Open</option>
              <option value="paid">Ontvangen</option>
              <option value="bailiff">Deurwaarder</option>
            </select>
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

