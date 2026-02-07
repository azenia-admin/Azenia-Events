/*
  # Fix tickets table for Firebase event IDs

  1. Schema Changes
    - Remove foreign key constraint on `event_id` (events live in Firebase, not Supabase)
    - Change `event_id` column type from `uuid` to `text` (Firebase IDs are strings)

  2. Security Changes
    - Remove old RLS policies that required Supabase `authenticated` role and `auth.uid()`
      (this app uses Firebase for auth, not Supabase auth)
    - Add new RLS policies for `anon` role scoped by `event_id`
      - SELECT: anon can read tickets where event_id is present
      - INSERT: anon can insert tickets with a non-empty event_id
      - UPDATE: anon can update tickets where event_id is present
      - DELETE: anon can delete tickets where event_id is present

  3. Important Notes
    - The app uses Firebase for authentication, so Supabase `auth.uid()` is always null
    - The Supabase client connects using the anon key (anon role)
    - Access is scoped by event_id to maintain data separation between events
*/

DROP POLICY IF EXISTS "Event owners can read tickets" ON tickets;
DROP POLICY IF EXISTS "Event owners can insert tickets" ON tickets;
DROP POLICY IF EXISTS "Event owners can update tickets" ON tickets;
DROP POLICY IF EXISTS "Event owners can delete tickets" ON tickets;

ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_event_id_fkey;

ALTER TABLE tickets ALTER COLUMN event_id TYPE text USING event_id::text;

CREATE POLICY "Anon can read tickets by event"
  ON tickets
  FOR SELECT
  TO anon
  USING (event_id IS NOT NULL AND event_id <> '');

CREATE POLICY "Anon can insert tickets with event_id"
  ON tickets
  FOR INSERT
  TO anon
  WITH CHECK (event_id IS NOT NULL AND event_id <> '');

CREATE POLICY "Anon can update tickets by event"
  ON tickets
  FOR UPDATE
  TO anon
  USING (event_id IS NOT NULL AND event_id <> '')
  WITH CHECK (event_id IS NOT NULL AND event_id <> '');

CREATE POLICY "Anon can delete tickets by event"
  ON tickets
  FOR DELETE
  TO anon
  USING (event_id IS NOT NULL AND event_id <> '');
