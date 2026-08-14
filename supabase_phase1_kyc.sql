-- Supabase migration for Phase 1 KYC verification flow
-- Apply this migration in your Supabase SQL editor or via CLI.

-- Ensure the pgcrypto extension is available for UUID generation.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tbl_kyc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  file_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  expiry_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES tbl_users(user_id) ON DELETE SET NULL,
  CHECK (status IN ('pending', 'approved', 'rejected', 'flagged'))
);

-- If you want a simpler lookup for latest KYC per user, this index helps performance.
CREATE INDEX IF NOT EXISTS idx_tbl_kyc_user_created_at ON tbl_kyc (user_id, created_at DESC);

-- Supabase storage bucket recommendation:
-- Create a public or authenticated bucket named "kyc-documents".
-- Make sure your Supabase storage policy allows signed uploads or client uploads
-- from authenticated users to this bucket.

-- Optional notification table if not already present:
-- CREATE TABLE IF NOT EXISTS tbl_notifications (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid NOT NULL,
--   message text NOT NULL,
--   type text NOT NULL,
--   is_read boolean NOT NULL DEFAULT false,
--   created_at timestamptz NOT NULL DEFAULT now(),
--   FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
-- );
