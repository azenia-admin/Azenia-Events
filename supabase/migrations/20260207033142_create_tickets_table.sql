/*
  # Create tickets table

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key, auto-generated)
      - `event_id` (uuid, references events, NOT NULL) - parent event
      - `name` (text, NOT NULL) - ticket name (e.g., General Admission, VIP)
      - `ticket_type` (text, NOT NULL) - paid, free, or donation
      - `price` (numeric) - ticket price in dollars
      - `quantity` (integer, NOT NULL) - total available quantity
      - `sold_count` (integer) - number sold so far
      - `approval_required` (boolean) - requires manual approval
      - `min_per_order` (integer) - minimum tickets per order
      - `max_per_order` (integer) - maximum tickets per order
      - `fee_option` (text) - pass fees to buyer or absorb
      - `sales_start_at` (timestamptz) - when sales begin
      - `sales_end_at` (timestamptz) - when sales end
      - `assigned_seating` (boolean) - ticket has assigned seating
      - `ticket_invoice_pdf` (text) - PDF design template
      - `confirmation_page` (text) - confirmation page design
      - `confirmation_email` (text) - email template
      - `track_restriction` (text) - track restrictions
      - `tag_restrictions` (text) - tag-based restrictions
      - `bundle_type` (text) - block or individual
      - `tickets_per_bundle` (integer) - tickets per block/bundle
      - `description` (text) - optional ticket description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `tickets` table
    - Event owners can CRUD tickets for their events
    - Authenticated users can read tickets for events (needed for purchasing)

  3. Indexes
    - Index on event_id for fast lookups by event
*/

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  ticket_type text NOT NULL DEFAULT 'paid',
  price numeric(10, 2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  sold_count integer NOT NULL DEFAULT 0,
  approval_required boolean NOT NULL DEFAULT false,
  min_per_order integer NOT NULL DEFAULT 0,
  max_per_order integer NOT NULL DEFAULT 10,
  fee_option text NOT NULL DEFAULT 'pass',
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  assigned_seating boolean NOT NULL DEFAULT false,
  ticket_invoice_pdf text NOT NULL DEFAULT 'default',
  confirmation_page text NOT NULL DEFAULT 'default',
  confirmation_email text NOT NULL DEFAULT 'default',
  track_restriction text NOT NULL DEFAULT 'none',
  tag_restrictions text NOT NULL DEFAULT '',
  bundle_type text NOT NULL DEFAULT 'block',
  tickets_per_bundle integer NOT NULL DEFAULT 4,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event owners can read tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tickets.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can insert tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tickets.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can update tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tickets.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tickets.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can delete tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tickets.event_id
      AND events.user_id = auth.uid()
    )
  );