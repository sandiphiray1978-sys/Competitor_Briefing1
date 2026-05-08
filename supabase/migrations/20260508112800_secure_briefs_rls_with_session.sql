/*
  # Secure briefs table RLS policies with session-based access

  1. Modified Tables
    - `briefs`
      - Added `session_id` (text, not null, default '') to scope rows per client session

  2. Security Changes
    - Drop existing overly permissive RLS policies
    - Add new restrictive policies that check session_id matches the request header
    - Each policy ensures users can only access their own session's data

  3. Notes
    - The session_id is passed via the `x-session-id` request header
    - Accessed in policies via `current_setting('request.headers', true)` which Supabase
      automatically populates from incoming request headers
*/

-- Add session_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'briefs' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE briefs ADD COLUMN session_id text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow anon to insert briefs" ON briefs;
DROP POLICY IF EXISTS "Allow anon to select briefs" ON briefs;
DROP POLICY IF EXISTS "Allow anon to delete briefs" ON briefs;

-- Create a helper function to extract session_id from request headers
CREATE OR REPLACE FUNCTION public.get_session_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  );
$$;

-- New restrictive policies scoped by session_id
CREATE POLICY "Anon can select own session briefs"
  ON briefs
  FOR SELECT
  TO anon
  USING (session_id = public.get_session_id() AND session_id != '');

CREATE POLICY "Anon can insert own session briefs"
  ON briefs
  FOR INSERT
  TO anon
  WITH CHECK (session_id = public.get_session_id() AND session_id != '');

CREATE POLICY "Anon can delete own session briefs"
  ON briefs
  FOR DELETE
  TO anon
  USING (session_id = public.get_session_id() AND session_id != '');
