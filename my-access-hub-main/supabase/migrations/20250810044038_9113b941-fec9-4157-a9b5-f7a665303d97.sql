-- Create email accounts table to store user email configurations
CREATE TABLE public.email_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'gmail', 'outlook', 'imap', etc.
  display_name TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB, -- Store provider-specific settings
  access_token_encrypted TEXT, -- Store encrypted access tokens
  refresh_token_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email_address)
);

-- Create email folders table
CREATE TABLE public.email_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  folder_id TEXT NOT NULL, -- Provider's folder ID
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'inbox', 'sent', 'drafts', 'custom', etc.
  parent_folder_id TEXT,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, folder_id)
);

-- Create email labels table (for Gmail-style labels)
CREATE TABLE public.email_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  label_id TEXT NOT NULL, -- Provider's label ID
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'system', 'user'
  color TEXT,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, label_id)
);

-- Enable Row Level Security
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_labels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_accounts
CREATE POLICY "Users can manage their email accounts" 
ON public.email_accounts 
FOR ALL 
USING (user_id = auth.uid());

-- Create RLS policies for email_folders
CREATE POLICY "Users can manage their email folders" 
ON public.email_folders 
FOR ALL 
USING (user_id = auth.uid());

-- Create RLS policies for email_labels
CREATE POLICY "Users can manage their email labels" 
ON public.email_labels 
FOR ALL 
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_email_accounts_updated_at
  BEFORE UPDATE ON public.email_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_folders_updated_at
  BEFORE UPDATE ON public.email_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_labels_updated_at
  BEFORE UPDATE ON public.email_labels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();