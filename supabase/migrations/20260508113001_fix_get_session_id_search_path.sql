/*
  # Fix mutable search_path on get_session_id function

  1. Security Changes
    - Recreate `public.get_session_id()` with an immutable search_path
      set explicitly to '' to prevent search_path manipulation attacks
*/

CREATE OR REPLACE FUNCTION public.get_session_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  );
$$;
