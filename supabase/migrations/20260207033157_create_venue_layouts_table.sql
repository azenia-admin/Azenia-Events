/*
  # Create venue_layouts table

  1. New Tables
    - `venue_layouts`
      - `id` (uuid, primary key, auto-generated)
      - `event_id` (uuid, references events, NOT NULL) - parent event
      - `venue_data` (text) - venue dimensions, stage location, facilities
      - `audience_data` (text) - expected attendance, demographics, accessibility
      - `seating_type` (text) - conference, theater, classroom, banquet
      - `seat_constraints` (text) - max row length, aisle width, stage distance
      - `safety_requirements` (text) - emergency exits, fire safety, evacuation
      - `layout_description` (text) - AI-generated layout description
      - `layout_diagram` (text) - AI-generated diagram data URI
      - `optimization_rationale` (text) - AI-generated rationale
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `venue_layouts` table
    - Event owners can CRUD layouts for their events

  3. Indexes
    - Index on event_id for fast lookups
*/

CREATE TABLE IF NOT EXISTS venue_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  venue_data text DEFAULT '',
  audience_data text DEFAULT '',
  seating_type text NOT NULL DEFAULT 'conference',
  seat_constraints text DEFAULT '',
  safety_requirements text DEFAULT '',
  layout_description text DEFAULT '',
  layout_diagram text DEFAULT '',
  optimization_rationale text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venue_layouts_event_id ON venue_layouts(event_id);

ALTER TABLE venue_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event owners can read venue layouts"
  ON venue_layouts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venue_layouts.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can insert venue layouts"
  ON venue_layouts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venue_layouts.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can update venue layouts"
  ON venue_layouts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venue_layouts.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venue_layouts.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can delete venue layouts"
  ON venue_layouts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venue_layouts.event_id
      AND events.user_id = auth.uid()
    )
  );