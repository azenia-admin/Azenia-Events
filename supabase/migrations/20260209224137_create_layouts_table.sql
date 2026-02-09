/*
  # Create layouts table for seating planner

  1. New Tables
    - `layouts`
      - `id` (uuid, primary key) - Unique identifier for the layout
      - `event_id` (uuid, foreign key) - Links to events table
      - `name` (text) - Name of the layout
      - `status` (text) - Layout status: draft, published, archived
      - `layout_data` (jsonb) - Complete layout configuration and metadata
      - `canvas_width` (numeric) - Canvas width in pixels
      - `canvas_height` (numeric) - Canvas height in pixels
      - `zoom_level` (numeric) - Current zoom level
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `layouts` table
    - Add policy for authenticated users to view layouts for their events
    - Add policy for authenticated users to create layouts for their events
    - Add policy for authenticated users to update their own layouts
    - Add policy for authenticated users to delete their own layouts
*/

CREATE TABLE IF NOT EXISTS layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Layout',
  status text NOT NULL DEFAULT 'draft',
  layout_data jsonb DEFAULT '{}'::jsonb,
  canvas_width numeric DEFAULT 1200,
  canvas_height numeric DEFAULT 800,
  zoom_level numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view layouts for their events"
  ON layouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = layouts.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create layouts for their events"
  ON layouts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = layouts.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update layouts for their events"
  ON layouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = layouts.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = layouts.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete layouts for their events"
  ON layouts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = layouts.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_layouts_event_id ON layouts(event_id);
CREATE INDEX IF NOT EXISTS idx_layouts_status ON layouts(status);
