import { createClient } from '@/lib/supabase/server';

export interface AuditLogEntry {
  actorProfileId?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const supabase = await createClient();
  
  await supabase.from('audit_log').insert({
    actor_profile_id: entry.actorProfileId || null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    before: entry.before || null,
    after: entry.after || null,
  });
}

