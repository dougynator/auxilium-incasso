import { createClient } from '@/lib/supabase/server';
import type { case_event_type } from '@/lib/supabase/types';

export interface CreateCaseEventParams {
  caseId: string;
  actorProfileId?: string;
  type: case_event_type;
  message: string;
  metadata?: Record<string, any>;
}

export async function createCaseEvent(params: CreateCaseEventParams): Promise<void> {
  const supabase = await createClient();
  
  await supabase.from('case_events').insert({
    case_id: params.caseId,
    actor_profile_id: params.actorProfileId || null,
    type: params.type,
    message: params.message,
    metadata: params.metadata || {},
  });

  // Update case last_activity_at
  await supabase
    .from('cases')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', params.caseId);
}

