-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS tbl_password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON tbl_password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON tbl_password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON tbl_password_reset_tokens(expires_at);

-- Auto-cleanup: delete expired tokens (run this occasionally or set up a scheduled job)
-- DELETE FROM tbl_password_reset_tokens WHERE expires_at < now() AND used = false;
