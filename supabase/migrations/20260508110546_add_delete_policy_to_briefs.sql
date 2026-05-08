/*
  # Add delete policy for briefs table

  1. Security Changes
    - Add policy allowing anon role to delete briefs (for clearing history in demo app)
*/

CREATE POLICY "Allow anon to delete briefs"
  ON briefs
  FOR DELETE
  TO anon
  USING (true);
