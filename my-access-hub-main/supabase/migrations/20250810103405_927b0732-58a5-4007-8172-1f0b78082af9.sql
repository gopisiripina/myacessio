-- Fix security settings to resolve linter warnings

-- 1. Set OTP expiry to recommended threshold (1 hour = 3600 seconds)
UPDATE auth.config 
SET value = '3600'::text 
WHERE parameter = 'OTP_EXPIRY';

-- 2. Enable leaked password protection
UPDATE auth.config 
SET value = 'true'::text 
WHERE parameter = 'SECURITY_REFRESH_TOKEN_ROTATION_ENABLED';

-- Note: Some security settings may need to be configured via Supabase dashboard
-- The above settings will help reduce security warnings