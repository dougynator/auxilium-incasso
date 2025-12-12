"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <div className="p-6">
          <h3 className="font-semibold mb-2">Cookie voorkeuren</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deze website gebruikt cookies om de gebruikerservaring te verbeteren.
            Door op "Accepteren" te klikken, gaat u akkoord met het gebruik van cookies.
            <a href="/privacy" className="text-primary hover:underline ml-1">
              Lees meer
            </a>
          </p>
          <div className="flex gap-2">
            <Button onClick={handleAccept} size="sm">
              Accepteren
            </Button>
            <Button onClick={handleDecline} variant="outline" size="sm">
              Weigeren
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

