import { supabase } from '@/lib/supabase';

interface SupabaseEvent {
  id: string;
  firebase_event_id: string;
}

export async function ensureSupabaseEvent(
  firebaseEventId: string,
  eventName: string
): Promise<SupabaseEvent> {
  const { data: existing, error: selectError } = await supabase
    .from('events')
    .select('id, firebase_event_id')
    .eq('firebase_event_id', firebaseEventId)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to check for existing event: ${selectError.message}`);
  }

  if (existing) {
    return existing as SupabaseEvent;
  }

  const { data: created, error: insertError } = await supabase
    .from('events')
    .insert({
      firebase_event_id: firebaseEventId,
      name: eventName || 'Untitled Event',
    })
    .select('id, firebase_event_id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: retry, error: retryError } = await supabase
        .from('events')
        .select('id, firebase_event_id')
        .eq('firebase_event_id', firebaseEventId)
        .maybeSingle();

      if (retryError || !retry) {
        throw new Error('Failed to create or find event');
      }
      return retry as SupabaseEvent;
    }
    throw new Error(`Failed to create event: ${insertError.message}`);
  }

  return created as SupabaseEvent;
}
