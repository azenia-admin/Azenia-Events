/*
  # Create public storage bucket for event website assets

  1. New Storage
    - Bucket `event-assets` (public) for banner and card images uploaded by
      event organizers from the Event Website editor.

  2. Security
    - Bucket is public so uploaded images can be rendered on the public
      /preview/<slug> page without signed URLs.
    - INSERT / UPDATE / DELETE limited to authenticated users under a path that
      begins with their user id (e.g. `<auth.uid()>/banner-....jpg`).
    - Public SELECT is allowed so everyone can read the image URLs.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-assets', 'event-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read of event assets'
  ) THEN
    CREATE POLICY "Public read of event assets"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'event-assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users upload their own event assets'
  ) THEN
    CREATE POLICY "Users upload their own event assets"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'event-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users update their own event assets'
  ) THEN
    CREATE POLICY "Users update their own event assets"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'event-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'event-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users delete their own event assets'
  ) THEN
    CREATE POLICY "Users delete their own event assets"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'event-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
