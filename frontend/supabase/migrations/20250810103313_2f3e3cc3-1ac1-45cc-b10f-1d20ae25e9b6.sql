-- Add password field to email_accounts table for IMAP authentication
ALTER TABLE email_accounts 
ADD COLUMN password_encrypted text;

-- Add comment for security
COMMENT ON COLUMN email_accounts.password_encrypted IS 'Encrypted password for IMAP/SMTP authentication';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_active ON email_accounts(user_id, is_active) WHERE is_active = true;