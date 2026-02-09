/*
  # Align layouts table with seating plan designer schema

  1. Modified Tables
    - `layouts`
      - Added `width` (numeric, default 100) - Layout canvas width
      - Added `height` (numeric, default 100) - Layout canvas height

  2. Important Notes
    - Existing columns (layout_data, canvas_width, canvas_height, zoom_level) are preserved
    - The designer uses width/height for its canvas dimensions
    - Table had 0 rows so no data impact
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'layouts' AND column_name = 'width'
  ) THEN
    ALTER TABLE layouts ADD COLUMN width numeric NOT NULL DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'layouts' AND column_name = 'height'
  ) THEN
    ALTER TABLE layouts ADD COLUMN height numeric NOT NULL DEFAULT 100;
  END IF;
END $$;
