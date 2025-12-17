"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plug, CheckCircle2, XCircle } from "lucide-react";

export default function IntegratiesContent() {
  const t = useTranslations('portal.integrations');
  const tCommon = useTranslations('common');

  // Placeholder integraties - later uit database halen
  const integrations = [
    {
      name: t('apiIntegration'),
      description: t('apiDescription'),
      status: "coming_soon",
      icon: Plug,
    },
    {
      name: t('webhookIntegration'),
      description: t('webhookDescription'),
      status: "coming_soon",
      icon: Plug,
    },
    {
      name: t('csvImport'),
      description: t('csvDescription'),
      status: "coming_soon",
      icon: Plug,
    },
  ];

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
                          <span className="font-sans text-sm font-medium">{t('available')}</span>
                        </div>
                        <Button className="font-sans bg-primary hover:bg-primary/90">
                          {t('activate')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <XCircle className="w-5 h-5" />
                          <span className="font-sans text-sm">{t('comingSoon')}</span>
                        </div>
                        <Button disabled variant="outline" className="font-sans">
                          {t('soon')}
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

