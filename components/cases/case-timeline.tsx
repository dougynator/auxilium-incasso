"use client";

import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface CaseEvent {
  id: string;
  type: string;
  message: string;
  metadata: Record<string, any>;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
  actor_profile_id?: string | null;
}

interface CaseTimelineProps {
  events: CaseEvent[];
  isStaffOrAdmin: boolean;
}

export default function CaseTimeline({ events, isStaffOrAdmin }: CaseTimelineProps) {
  // Filter out internal notes for non-staff/admin
  const visibleEvents = isStaffOrAdmin
    ? events
    : events.filter((e) => !e.metadata?.internal);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "created":
        return "📝";
      case "email_sent":
        return "📧";
      case "status_changed":
        return "🔄";
      case "note_added":
        return "💬";
      case "payment_marked":
        return "💰";
      case "attachment_added":
        return "📎";
      default:
        return "•";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "email_sent":
        return "bg-green-100 text-green-800";
      case "payment_marked":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (visibleEvents.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Geen activiteiten</div>;
  }

  return (
    <div className="space-y-4">
      {visibleEvents.map((event) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            {event !== visibleEvents[visibleEvents.length - 1] && (
              <div className="w-0.5 h-full bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex justify-between items-start mb-1">
              <div className="font-semibold">{event.message}</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(event.created_at)}
              </div>
            </div>
            {event.profiles?.full_name && (
              <div className="text-sm text-muted-foreground">
                door {event.profiles.full_name}
              </div>
            )}
            {event.metadata?.internal && (
              <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Intern
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

