"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface CaseAttachmentsProps {
  caseId: string;
  attachments: Array<{
    id: string;
    file_name: string;
    file_path: string;
    size?: number;
    created_at?: string;
  }>;
}

export default function CaseAttachments({ caseId, attachments }: CaseAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = async (attachment: typeof attachments[0]) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from('case-attachments')
        .download(attachment.file_path);
      
      if (error) {
        console.error('Download error:', error);
        alert('Kon bestand niet downloaden: ' + error.message);
        return;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Kon bestand niet downloaden');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bijgevoegde documenten</CardTitle>
        <CardDescription>Documenten die bij deze opdracht zijn gevoegd</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-sans font-medium">{attachment.file_name}</p>
                  <p className="font-sans text-sm text-muted-foreground">
                    {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Onbekende grootte'}
                    {attachment.created_at && ` • ${formatDate(attachment.created_at)}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(attachment)}
                className="font-sans"
              >
                <Download className="w-4 h-4 mr-2" />
                Downloaden
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


