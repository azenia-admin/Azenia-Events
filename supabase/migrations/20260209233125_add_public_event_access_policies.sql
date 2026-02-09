/*
  # Add public read access for event landing pages

  1. Security Changes
    - Add SELECT policy on `events` table for anonymous (public) users to read basic event info
    - Add SELECT policy on `tickets` table for anonymous (public) users to read ticket info by event

  2. Notes
    - These policies allow unauthenticated visitors to view public event landing pages
    - Only SELECT access is granted; no insert/update/delete for anonymous users
    - Authenticated user policies remain unchanged
*/

CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view tickets for events"
  ON tickets FOR SELECT
  TO anon
  USING (true);
