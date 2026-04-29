/*
  # Add website_config to events

  1. Changes
    - Adds `website_config` jsonb column to `events` for storing editable landing page
      configuration: tagline, description, banner image, registration flow,
      navigation tab visibility/order, colors, footer text, and custom HTML.
    - Defaults to an empty object so existing rows remain valid.

  2. Security
    - No RLS changes. Existing SELECT policies already expose event rows needed
      for the public preview page; the new column is covered by those policies.

  3. Notes
    - The column is authored as a single JSON document to keep the schema flexible
      as we iterate on the website editor.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'events'
      AND column_name = 'website_config'
  ) THEN
    ALTER TABLE events ADD COLUMN website_config jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;
