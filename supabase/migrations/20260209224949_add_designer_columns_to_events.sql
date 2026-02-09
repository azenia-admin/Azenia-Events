/*
  # Add generated columns to events table for seating plan designer compatibility

  1. Modified Tables
    - `events`
      - Added `title` (text, generated from `name`) - Read-only alias for designer
      - Added `created_by` (uuid, generated from `user_id`) - Read-only alias for designer
      - Added `event_date` (timestamptz, generated from `start_date`) - Read-only alias for designer

  2. Important Notes
    - Generated columns automatically mirror existing data (name -> title, user_id -> created_by, start_date -> event_date)
    - No data duplication concerns - PostgreSQL manages sync automatically
    - Existing application code continues to use name/user_id/start_date unchanged
    - Seating plan designer can read title/created_by/event_date as expected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'title'
  ) THEN
    ALTER TABLE events ADD COLUMN title text GENERATED ALWAYS AS (name) STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events ADD COLUMN created_by uuid GENERATED ALWAYS AS (user_id) STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE events ADD COLUMN event_date timestamptz GENERATED ALWAYS AS (start_date) STORED;
  END IF;
END $$;
