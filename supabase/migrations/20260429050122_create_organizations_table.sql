/*
  # Create organizations table and link events

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references auth.users) - admin who created it
      - `name` (text)
      - `slug` (text)
      - `logo_url` (text, nullable)
      - `website` (text, nullable)
      - `description` (text, nullable)
      - `is_primary` (boolean, default false) - default org for the owner
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Schema Changes
    - Add `organization_id` (uuid, nullable) column to `events` table referencing organizations.id

  3. Security
    - Enable RLS on `organizations`
    - Authenticated users can SELECT/INSERT/UPDATE/DELETE their own organizations (where owner_id = auth.uid())

  4. Automatic Behavior
    - Trigger on profile creation creates a default "My Organization" marked is_primary = true
    - Unique partial index ensures each owner has at most one primary organization

  5. Notes
    - Events can optionally belong to an organization. Existing events remain unlinked.
    - This lays the groundwork for multi-tenant organization management per user.
*/

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Organization',
  slug text NOT NULL DEFAULT '',
  logo_url text,
  website text,
  description text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_one_primary_per_owner
  ON organizations(owner_id)
  WHERE is_primary;

CREATE INDEX IF NOT EXISTS organizations_owner_idx ON organizations(owner_id);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read own organizations" ON organizations;
CREATE POLICY "Owners can read own organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert own organizations" ON organizations;
CREATE POLICY "Owners can insert own organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own organizations" ON organizations;
CREATE POLICY "Owners can update own organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete own organizations" ON organizations;
CREATE POLICY "Owners can delete own organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE events ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS events_organization_idx ON events(organization_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_name text;
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  default_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'My'
  ) || '''s Organization';

  INSERT INTO organizations (owner_id, name, is_primary)
  SELECT NEW.id, default_name, true
  WHERE NOT EXISTS (
    SELECT 1 FROM organizations WHERE owner_id = NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

INSERT INTO organizations (owner_id, name, is_primary)
SELECT p.id, 'My Organization', true
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o WHERE o.owner_id = p.id
);
