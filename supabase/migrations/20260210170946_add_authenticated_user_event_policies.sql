/*
  # Add authenticated user policies for events

  1. Security Changes
    - Add INSERT policy: authenticated users can create events with their own user_id
    - Add UPDATE policy: authenticated users can update their own events
    - Add DELETE policy: authenticated users can delete their own events
    - Add SELECT policy: authenticated users can read their own events

  2. Notes
    - Existing firebase_event_id-based policies are left untouched
    - user_id column is used to establish ownership
*/

CREATE POLICY "Authenticated users can insert own events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
