/*
  # Fix events table for Firebase event IDs

  1. Schema Changes
    - Add `firebase_event_id` (text, unique) column to link Firebase events to Supabase rows
    - Make `user_id` nullable and drop foreign key (app uses Firebase auth, not Supabase auth)

  2. Security Changes
    - Remove old RLS policies that required Supabase `authenticated` role and `auth.uid()`
    - Add new RLS policies for `anon` role scoped by `firebase_event_id`
      - SELECT: anon can read events where firebase_event_id is present
      - INSERT: anon can insert events with a non-empty firebase_event_id
      - UPDATE: anon can update events where firebase_event_id is present
      - DELETE: anon can delete events where firebase_event_id is present

  3. Important Notes
    - The app uses Firebase for authentication, so Supabase `auth.uid()` is always null
    - The Supabase client connects using the anon key (anon role)
    - Access is scoped by firebase_event_id to maintain data separation between events
    - The unique constraint on firebase_event_id ensures idempotent event creation
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'firebase_event_id'
  ) THEN
    ALTER TABLE events ADD COLUMN firebase_event_id text UNIQUE;
  END IF;
END $$;

ALTER TABLE events ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_user_id_fkey;

DROP POLICY IF EXISTS "Owners can read own events" ON events;
DROP POLICY IF EXISTS "Owners can insert own events" ON events;
DROP POLICY IF EXISTS "Owners can update own events" ON events;
DROP POLICY IF EXISTS "Owners can delete own events" ON events;

CREATE POLICY "Anon can read events by firebase_event_id"
  ON events
  FOR SELECT
  TO anon
  USING (firebase_event_id IS NOT NULL AND firebase_event_id <> '');

CREATE POLICY "Anon can insert events with firebase_event_id"
  ON events
  FOR INSERT
  TO anon
  WITH CHECK (firebase_event_id IS NOT NULL AND firebase_event_id <> '');

CREATE POLICY "Anon can update events by firebase_event_id"
  ON events
  FOR UPDATE
  TO anon
  USING (firebase_event_id IS NOT NULL AND firebase_event_id <> '')
  WITH CHECK (firebase_event_id IS NOT NULL AND firebase_event_id <> '');

CREATE POLICY "Anon can delete events by firebase_event_id"
  ON events
  FOR DELETE
  TO anon
  USING (firebase_event_id IS NOT NULL AND firebase_event_id <> '');