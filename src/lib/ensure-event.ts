import { supabase } from '@/lib/supabase';

interface SupabaseEvent {
  id: string;
  firebase_event_id: string;
}

export async function ensureSupabaseEvent(
  firebaseEventId: string,
  eventName: string
): Promise<SupabaseEvent> {
  if (!firebaseEventId) {
    throw new Error('Firebase event ID is required');
  }

  try {
    const { data: existing, error: selectError } = await supabase
      .from('events')
      .select('id, firebase_event_id')
      .eq('firebase_event_id', firebaseEventId)
      .maybeSingle();

    if (selectError) {
      console.error('Select error:', selectError);
      throw new Error(`Unable to check for existing event: ${selectError.message}`);
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
      console.error('Insert error:', insertError);

      if (insertError.code === '23505') {
        const { data: retry, error: retryError } = await supabase
          .from('events')
          .select('id, firebase_event_id')
          .eq('firebase_event_id', firebaseEventId)
          .maybeSingle();

        if (retryError || !retry) {
          console.error('Retry error:', retryError);
          throw new Error('Unable to create or find event in database');
        }
        return retry as SupabaseEvent;
      }
      throw new Error(`Unable to create event: ${insertError.message}`);
    }

    if (!created) {
      throw new Error('Event was not created');
    }

    return created as SupabaseEvent;
  } catch (error) {
    console.error('ensureSupabaseEvent error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while setting up the event');
  }
}
