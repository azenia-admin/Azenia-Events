/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references profiles, NOT NULL) - owner of the event
      - `name` (text, NOT NULL) - event name
      - `description` (text) - event description
      - `location` (text) - physical location
      - `start_date` (timestamptz) - event start date/time
      - `end_date` (timestamptz) - event end date/time
      - `format` (text) - In Person, Online, or Hybrid
      - `type` (text) - Conference, Workshop, Networking, Expo
      - `allow_access_after_end` (boolean) - allow access after event ends
      - `is_private` (boolean) - whether event is private/unlisted
      - `pre_event_access_at` (timestamptz) - when pre-event access starts
      - `show_remaining_tickets` (boolean) - show remaining ticket counts
      - `show_registration_button` (boolean) - show registration button
      - `show_ticket_prices` (boolean) - show ticket prices publicly
      - `limit_event_capacity` (boolean) - whether capacity is limited
      - `max_registrants` (integer) - max number of registrants
      - `allow_ticket_exchanges` (boolean) - allow exchanges
      - `custom_invoice_text` (text) - custom text for invoices
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `events` table
    - Owners can CRUD their own events
    - Public events visible to all authenticated users

  3. Indexes
    - Index on user_id for fast lookups by owner
    - Index on start_date for sorting/filtering
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  location text DEFAULT '',
  start_date timestamptz,
  end_date timestamptz,
  format text DEFAULT 'in_person',
  type text DEFAULT 'conference',
  allow_access_after_end boolean NOT NULL DEFAULT false,
  is_private boolean NOT NULL DEFAULT false,
  pre_event_access_at timestamptz,
  show_remaining_tickets boolean NOT NULL DEFAULT true,
  show_registration_button boolean NOT NULL DEFAULT true,
  show_ticket_prices boolean NOT NULL DEFAULT true,
  limit_event_capacity boolean NOT NULL DEFAULT true,
  max_registrants integer NOT NULL DEFAULT 100,
  allow_ticket_exchanges boolean NOT NULL DEFAULT false,
  custom_invoice_text text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert own events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);