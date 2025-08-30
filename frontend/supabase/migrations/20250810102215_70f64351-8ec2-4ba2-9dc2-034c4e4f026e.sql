-- Create emails table to store actual email messages
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT NOT NULL DEFAULT '',
  sender_name TEXT,
  sender_email TEXT NOT NULL,
  recipient_emails TEXT[] DEFAULT '{}',
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  body_text TEXT,
  body_html TEXT,
  received_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_important BOOLEAN NOT NULL DEFAULT false,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  size_bytes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, message_id)
);

-- Create email attachments table
CREATE TABLE public.email_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER DEFAULT 0,
  attachment_data BYTEA,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on emails table
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for emails
CREATE POLICY "Users can view their own emails" 
ON public.emails 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails" 
ON public.emails 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails" 
ON public.emails 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails" 
ON public.emails 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on email attachments
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email attachments
CREATE POLICY "Users can view their own email attachments" 
ON public.email_attachments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.emails 
  WHERE emails.id = email_attachments.email_id 
  AND emails.user_id = auth.uid()
));

CREATE POLICY "Users can manage their own email attachments" 
ON public.email_attachments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.emails 
  WHERE emails.id = email_attachments.email_id 
  AND emails.user_id = auth.uid()
));

-- Add indexes for better performance
CREATE INDEX idx_emails_account_folder ON public.emails(account_id, folder_id);
CREATE INDEX idx_emails_user_received_date ON public.emails(user_id, received_date DESC);
CREATE INDEX idx_emails_is_read ON public.emails(user_id, is_read);
CREATE INDEX idx_emails_is_starred ON public.emails(user_id, is_starred);
CREATE INDEX idx_emails_message_id ON public.emails(account_id, message_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_emails_updated_at
BEFORE UPDATE ON public.emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();