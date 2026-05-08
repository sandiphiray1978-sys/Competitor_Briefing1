/*
  # Create briefs history table

  1. New Tables
    - `briefs`
      - `id` (uuid, primary key, auto-generated)
      - `objective` (text, the user's original question)
      - `urls` (text, optional URLs provided by user)
      - `landscape_summary` (text)
      - `who_is_playing` (jsonb, array of competitor names)
      - `dominant_messaging_themes` (jsonb, array of theme strings)
      - `the_gap` (text)
      - `recommended_angle` (text)
      - `created_at` (timestamptz, auto-generated)

  2. Security
    - Enable RLS on `briefs` table
    - Add policy for anonymous users to insert briefs (demo app without auth)
    - Add policy for anonymous users to select briefs (demo app without auth)

  3. Notes
    - Since this is a demo/prototype without authentication, policies allow
      anon role access. In production, these would be scoped to auth.uid().
*/

CREATE TABLE IF NOT EXISTS briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective text NOT NULL,
  urls text DEFAULT '',
  landscape_summary text NOT NULL,
  who_is_playing jsonb NOT NULL DEFAULT '[]'::jsonb,
  dominant_messaging_themes jsonb NOT NULL DEFAULT '[]'::jsonb,
  the_gap text NOT NULL,
  recommended_angle text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to insert briefs"
  ON briefs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to select briefs"
  ON briefs
  FOR SELECT
  TO anon
  USING (true);
