-- Upgrade the current user to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = '1b68667f-d965-4a9c-a182-1b91d9d35d80';

-- Verify the update
SELECT user_id, display_name, email, role 
FROM profiles 
WHERE user_id = '1b68667f-d965-4a9c-a182-1b91d9d35d80';