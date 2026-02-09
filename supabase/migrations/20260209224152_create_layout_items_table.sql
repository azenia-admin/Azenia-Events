/*
  # Create layout_items table for seating planner

  1. New Tables
    - `layout_items`
      - `id` (uuid, primary key) - Unique identifier for the item
      - `layout_id` (uuid, foreign key) - Links to layouts table
      - `item_type` (text) - Type of item: seat, table, stage, aisle, etc.
      - `position_x` (numeric) - X coordinate on canvas
      - `position_y` (numeric) - Y coordinate on canvas
      - `width` (numeric) - Item width in pixels
      - `height` (numeric) - Item height in pixels
      - `rotation` (numeric) - Rotation angle in degrees
      - `label` (text) - Display label/number for the item
      - `properties` (jsonb) - Additional properties (color, section, price_tier, etc.)
      - `z_index` (integer) - Layer order for overlapping items
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `layout_items` table
    - Add policy for authenticated users to view items for their layouts
    - Add policy for authenticated users to create items for their layouts
    - Add policy for authenticated users to update items for their layouts
    - Add policy for authenticated users to delete items for their layouts
*/

CREATE TABLE IF NOT EXISTS layout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id uuid NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'seat',
  position_x numeric NOT NULL DEFAULT 0,
  position_y numeric NOT NULL DEFAULT 0,
  width numeric DEFAULT 40,
  height numeric DEFAULT 40,
  rotation numeric DEFAULT 0,
  label text DEFAULT '',
  properties jsonb DEFAULT '{}'::jsonb,
  z_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE layout_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items for their layouts"
  ON layout_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM layouts
      JOIN events ON events.id = layouts.event_id
      WHERE layouts.id = layout_items.layout_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for their layouts"
  ON layout_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM layouts
      JOIN events ON events.id = layouts.event_id
      WHERE layouts.id = layout_items.layout_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items for their layouts"
  ON layout_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM layouts
      JOIN events ON events.id = layouts.event_id
      WHERE layouts.id = layout_items.layout_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM layouts
      JOIN events ON events.id = layouts.event_id
      WHERE layouts.id = layout_items.layout_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items for their layouts"
  ON layout_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM layouts
      JOIN events ON events.id = layouts.event_id
      WHERE layouts.id = layout_items.layout_id
      AND events.user_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_layout_items_layout_id ON layout_items(layout_id);
CREATE INDEX IF NOT EXISTS idx_layout_items_type ON layout_items(item_type);
CREATE INDEX IF NOT EXISTS idx_layout_items_z_index ON layout_items(z_index);
