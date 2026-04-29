/*
  # Floor Plan Designer Tables (Ported)

  1. New Tables
    - `floor_plans`
      - `id` (uuid, primary key)
      - `event_id` (uuid, FK -> events.id, cascade delete) - scopes a floor plan to an event
      - `user_id` (uuid, FK -> auth.users) - owner of the plan
      - `name` (text)
      - `width` (numeric) - width in feet
      - `height` (numeric) - height in feet
      - `created_at`, `updated_at` (timestamptz)

    - `furniture_items`
      - `id` (uuid, primary key)
      - `floor_plan_id` (uuid, FK -> floor_plans.id, cascade delete)
      - `type` (text) - 'table' | 'chair' | 'row'
      - `x`, `y`, `width`, `height`, `rotation` (numeric)
      - `group_id` (uuid) - groups related items
      - `category`, `section_label` (text)
      - `seat_count`, `chair_count`, `open_spaces`, `seat_label_start`, `row_label_start_at`, `seat_label_start_at` (integer)
      - `curve`, `seat_spacing` (numeric)
      - `row_label`, `row_label_format`, `row_label_direction`, `row_label_position`, `row_displayed_type` (text)
      - `row_label_enabled`, `automatic_radius`, `table_label_visible`, `seat_label_enabled` (boolean)
      - `table_label`, `seat_label_direction`, `seat_label_format`, `seat_displayed_type`, `seat_label_dir` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Plans are accessible only to their owner (user_id = auth.uid())
    - Furniture items are accessible only when the user owns the parent plan
*/

CREATE TABLE IF NOT EXISTS floor_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'New Floor Plan',
  width numeric NOT NULL,
  height numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_floor_plans_event_id ON floor_plans(event_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_user_id ON floor_plans(user_id);

CREATE TABLE IF NOT EXISTS furniture_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_plan_id uuid NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
  type text NOT NULL,
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  width numeric NOT NULL,
  height numeric NOT NULL,
  rotation numeric DEFAULT 0,
  group_id uuid,
  category text,
  section_label text,
  seat_count integer,
  curve double precision DEFAULT 0 NOT NULL,
  seat_spacing numeric DEFAULT 1,
  row_label text,
  row_label_enabled boolean DEFAULT true,
  chair_count integer,
  open_spaces integer DEFAULT 0,
  automatic_radius boolean DEFAULT true,
  table_label text,
  table_label_visible boolean DEFAULT true,
  seat_label_start integer DEFAULT 1,
  seat_label_direction text DEFAULT 'clockwise',
  row_label_format text DEFAULT 'numbers',
  row_label_start_at integer DEFAULT 1,
  row_label_direction text DEFAULT 'ltr',
  row_label_position text DEFAULT 'auto',
  row_displayed_type text DEFAULT 'Row',
  seat_label_format text DEFAULT 'numbers',
  seat_displayed_type text DEFAULT 'Seat',
  seat_label_enabled boolean DEFAULT false,
  seat_label_start_at integer DEFAULT 1,
  seat_label_dir text DEFAULT 'ltr',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_furniture_items_floor_plan_id ON furniture_items(floor_plan_id);
CREATE INDEX IF NOT EXISTS idx_furniture_items_group_id ON furniture_items(group_id);

ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own floor plans"
  ON floor_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own floor plans"
  ON floor_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own floor plans"
  ON floor_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own floor plans"
  ON floor_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view furniture on their own floor plans"
  ON furniture_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM floor_plans
      WHERE floor_plans.id = furniture_items.floor_plan_id
        AND floor_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert furniture on their own floor plans"
  ON furniture_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM floor_plans
      WHERE floor_plans.id = furniture_items.floor_plan_id
        AND floor_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update furniture on their own floor plans"
  ON furniture_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM floor_plans
      WHERE floor_plans.id = furniture_items.floor_plan_id
        AND floor_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM floor_plans
      WHERE floor_plans.id = furniture_items.floor_plan_id
        AND floor_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete furniture on their own floor plans"
  ON furniture_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM floor_plans
      WHERE floor_plans.id = furniture_items.floor_plan_id
        AND floor_plans.user_id = auth.uid()
    )
  );
