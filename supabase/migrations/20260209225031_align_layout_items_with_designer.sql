/*
  # Align layout_items table with seating plan designer schema

  1. Modified Tables
    - `layout_items`
      - Renamed `item_type` to `type` - Designer uses "type" for item category
      - Renamed `position_x` to `x` - Designer uses short coordinate names
      - Renamed `position_y` to `y` - Designer uses short coordinate names
      - Made `width` and `height` NOT NULL
      - Added grouping columns: `group_id`, `category`, `section_label`
      - Added row-specific columns: `seat_count`, `curve`, `seat_spacing`, `row_label`,
        `row_label_enabled`, `row_label_format`, `row_label_start_at`, `row_label_direction`,
        `row_label_position`, `row_displayed_type`
      - Added table-specific columns: `chair_count`, `open_spaces`, `automatic_radius`,
        `table_label`, `table_label_visible`
      - Added seat labeling columns: `seat_label_start`, `seat_label_direction`,
        `seat_label_format`, `seat_displayed_type`, `seat_label_enabled`,
        `seat_label_start_at`, `seat_label_dir`

  2. Important Notes
    - Table had 0 rows so column renames and constraint changes are safe
    - Extra existing columns (label, properties, z_index) are preserved
    - All new columns have sensible defaults for the designer
    - Index on group_id added for grouping queries
*/

-- Rename columns to match designer expectations
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'layout_items' AND column_name = 'item_type'
  ) THEN
    ALTER TABLE layout_items RENAME COLUMN item_type TO type;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'layout_items' AND column_name = 'position_x'
  ) THEN
    ALTER TABLE layout_items RENAME COLUMN position_x TO x;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'layout_items' AND column_name = 'position_y'
  ) THEN
    ALTER TABLE layout_items RENAME COLUMN position_y TO y;
  END IF;
END $$;

-- Ensure width and height are NOT NULL
ALTER TABLE layout_items ALTER COLUMN width SET NOT NULL;
ALTER TABLE layout_items ALTER COLUMN height SET NOT NULL;

-- Add all designer-specific columns
DO $$
BEGIN
  -- Grouping & organization
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'group_id') THEN
    ALTER TABLE layout_items ADD COLUMN group_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'category') THEN
    ALTER TABLE layout_items ADD COLUMN category text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'section_label') THEN
    ALTER TABLE layout_items ADD COLUMN section_label text;
  END IF;

  -- Row-specific properties
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_count') THEN
    ALTER TABLE layout_items ADD COLUMN seat_count integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'curve') THEN
    ALTER TABLE layout_items ADD COLUMN curve numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_spacing') THEN
    ALTER TABLE layout_items ADD COLUMN seat_spacing numeric DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'row_label') THEN
    ALTER TABLE layout_items ADD COLUMN row_label text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'row_label_enabled') THEN
    ALTER TABLE layout_items ADD COLUMN row_label_enabled boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'row_label_format') THEN
    ALTER TABLE layout_items ADD COLUMN row_label_format text DEFAULT 'numbers';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'row_label_start_at') THEN
    ALTER TABLE layout_items ADD COLUMN row_label_start_at integer DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'row_label_direction') THEN
    ALTER TABLE layout_items ADD COLUMN row_label_direction text DEFAULT 'ltr';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'row_label_position') THEN
    ALTER TABLE layout_items ADD COLUMN row_label_position text DEFAULT 'auto';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'row_displayed_type') THEN
    ALTER TABLE layout_items ADD COLUMN row_displayed_type text DEFAULT 'Row';
  END IF;

  -- Table-specific properties
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'chair_count') THEN
    ALTER TABLE layout_items ADD COLUMN chair_count integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'open_spaces') THEN
    ALTER TABLE layout_items ADD COLUMN open_spaces integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'automatic_radius') THEN
    ALTER TABLE layout_items ADD COLUMN automatic_radius boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'table_label') THEN
    ALTER TABLE layout_items ADD COLUMN table_label text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'table_label_visible') THEN
    ALTER TABLE layout_items ADD COLUMN table_label_visible boolean DEFAULT true;
  END IF;

  -- Seat labeling (for both rows and tables)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_label_start') THEN
    ALTER TABLE layout_items ADD COLUMN seat_label_start integer DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_label_direction') THEN
    ALTER TABLE layout_items ADD COLUMN seat_label_direction text DEFAULT 'clockwise';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_label_format') THEN
    ALTER TABLE layout_items ADD COLUMN seat_label_format text DEFAULT 'numbers';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_displayed_type') THEN
    ALTER TABLE layout_items ADD COLUMN seat_displayed_type text DEFAULT 'Seat';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_label_enabled') THEN
    ALTER TABLE layout_items ADD COLUMN seat_label_enabled boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_label_start_at') THEN
    ALTER TABLE layout_items ADD COLUMN seat_label_start_at integer DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'layout_items' AND column_name = 'seat_label_dir') THEN
    ALTER TABLE layout_items ADD COLUMN seat_label_dir text DEFAULT 'ltr';
  END IF;
END $$;

-- Add index on group_id for grouping queries
CREATE INDEX IF NOT EXISTS idx_layout_items_group_id ON layout_items(group_id);
