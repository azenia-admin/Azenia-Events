/*
  # Create event_seats table for finalized seating data

  1. New Tables
    - `event_seats`
      - `id` (uuid, primary key) - Unique seat identifier
      - `event_id` (uuid, foreign key to events) - The event this seat belongs to
      - `seat_number` (text) - Display seat number/label
      - `row_label` (text) - Row identifier for the seat
      - `section_label` (text) - Section identifier for the seat
      - `x` (numeric) - X position on the layout canvas
      - `y` (numeric) - Y position on the layout canvas
      - `status` (text, default 'available') - Seat status: available, reserved, sold
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `event_seats` table
    - Separate policies for SELECT, INSERT, UPDATE, DELETE
    - All policies verify event ownership through events.user_id

  3. Important Notes
    - This table stores individual seat data generated when user clicks "Finalize Layout"
    - Seats reference the event directly for efficient ticketing queries
    - ON DELETE CASCADE ensures seats are removed when event is deleted
*/

CREATE TABLE IF NOT EXISTS event_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_number text NOT NULL,
  row_label text,
  section_label text,
  x numeric NOT NULL,
  y numeric NOT NULL,
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_seats_event_id ON event_seats(event_id);

ALTER TABLE event_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view seats for their events"
  ON event_seats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seats.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create seats for their events"
  ON event_seats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seats.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update seats for their events"
  ON event_seats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seats.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seats.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete seats for their events"
  ON event_seats FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seats.event_id
      AND events.user_id = auth.uid()
    )
  );
