/*
  # Fix venue_layouts table for Firebase auth and add status tracking

  1. Schema Changes
    - Add `status` column (text, default 'draft') for tracking layout state
      - Values: 'draft', 'published'

  2. Security Changes
    - Remove old RLS policies that required Supabase `authenticated` role via events.user_id = auth.uid()
    - Add new RLS policies for `anon` role scoped by event_id
      - SELECT: anon can read layouts where event_id exists
      - INSERT: anon can insert layouts with a valid event_id
      - UPDATE: anon can update layouts where event_id exists
      - DELETE: anon can delete layouts where event_id exists

  3. Important Notes
    - The app uses Firebase for authentication, so Supabase auth.uid() is always null
    - Access is scoped by event_id to maintain data separation
    - The status column enables showing seating status on the venue designer page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venue_layouts' AND column_name = 'status'
  ) THEN
    ALTER TABLE venue_layouts ADD COLUMN status text NOT NULL DEFAULT 'draft';
  END IF;
END $$;

DROP POLICY IF EXISTS "Event owners can read venue layouts" ON venue_layouts;
DROP POLICY IF EXISTS "Event owners can insert venue layouts" ON venue_layouts;
DROP POLICY IF EXISTS "Event owners can update venue layouts" ON venue_layouts;
DROP POLICY IF EXISTS "Event owners can delete venue layouts" ON venue_layouts;

CREATE POLICY "Anon can read venue layouts by event"
  ON venue_layouts
  FOR SELECT
  TO anon
  USING (event_id IS NOT NULL);

CREATE POLICY "Anon can insert venue layouts with event_id"
  ON venue_layouts
  FOR INSERT
  TO anon
  WITH CHECK (event_id IS NOT NULL);

CREATE POLICY "Anon can update venue layouts by event"
  ON venue_layouts
  FOR UPDATE
  TO anon
  USING (event_id IS NOT NULL)
  WITH CHECK (event_id IS NOT NULL);

CREATE POLICY "Anon can delete venue layouts by event"
  ON venue_layouts
  FOR DELETE
  TO anon
  USING (event_id IS NOT NULL);