/*
  # Fix handle_new_user trigger function search_path

  1. Changes
    - Recreate `handle_new_user()` function with explicit `search_path = public`
    - Use fully qualified `public.profiles` table reference
    - Ensures the trigger works correctly when fired by Supabase auth service

  2. Notes
    - The previous function had no search_path configured, causing the auth service
      to fail when trying to insert into the profiles table during signup
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;