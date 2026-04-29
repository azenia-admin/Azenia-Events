/*
  # Add slug column to events for public preview URLs

  1. Changes
    - Adds `slug` text column to `events` table (nullable, unique when present)
    - Backfills existing rows with a URL-safe slug derived from `name` plus a short id suffix
    - Adds a unique partial index so blank slugs are permitted but filled ones stay unique

  2. Security
    - No RLS changes. Existing public read policy for events already exposes the fields
      required for the preview page.

  3. Notes
    - Slug is managed by the application layer when events are created or renamed.
    - The column is kept nullable for legacy data; new events should always receive a slug.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'slug'
  ) THEN
    ALTER TABLE events ADD COLUMN slug text;
  END IF;
END $$;

UPDATE events
SET slug = trim(both '-' from
    regexp_replace(lower(coalesce(name, 'event')), '[^a-z0-9]+', '-', 'g')
  ) || '-' || substr(replace(id::text, '-', ''), 1, 6)
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique_idx
  ON events (slug)
  WHERE slug IS NOT NULL AND slug <> '';
