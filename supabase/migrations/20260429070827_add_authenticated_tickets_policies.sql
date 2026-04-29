/*
  # Grant authenticated access to tickets

  1. Changes
    - Extend existing tickets policies so authenticated users (not just anon) can
      read / insert / update / delete tickets for their events.
    - The existing anon-only policies left signed-in users locked out, so ticket
      creation silently failed because of RLS.

  2. Security
    - Policies still require a non-empty event_id, matching the current anon rules.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.tickets'::regclass
      AND polname = 'Authenticated can read tickets by event'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Authenticated can read tickets by event"
        ON public.tickets FOR SELECT
        TO authenticated
        USING (event_id IS NOT NULL AND event_id <> '')
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.tickets'::regclass
      AND polname = 'Authenticated can insert tickets with event_id'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Authenticated can insert tickets with event_id"
        ON public.tickets FOR INSERT
        TO authenticated
        WITH CHECK (event_id IS NOT NULL AND event_id <> '')
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.tickets'::regclass
      AND polname = 'Authenticated can update tickets by event'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Authenticated can update tickets by event"
        ON public.tickets FOR UPDATE
        TO authenticated
        USING (event_id IS NOT NULL AND event_id <> '')
        WITH CHECK (event_id IS NOT NULL AND event_id <> '')
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.tickets'::regclass
      AND polname = 'Authenticated can delete tickets by event'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Authenticated can delete tickets by event"
        ON public.tickets FOR DELETE
        TO authenticated
        USING (event_id IS NOT NULL AND event_id <> '')
    $p$;
  END IF;
END $$;
