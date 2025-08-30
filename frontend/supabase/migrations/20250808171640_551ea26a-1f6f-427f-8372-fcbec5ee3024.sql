-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);

-- Create RLS policies for invoice files
CREATE POLICY "Users can view their own invoices" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admin and finance can upload invoices" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'invoices' AND can_manage_data(auth.uid()));

CREATE POLICY "Admin and finance can update invoices" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'invoices' AND can_manage_data(auth.uid()));

CREATE POLICY "Admin can delete invoices" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'::app_role));

-- Add invoice file URL field to services table
ALTER TABLE public.services 
ADD COLUMN invoice_file_url TEXT;

-- Add comment to the new column
COMMENT ON COLUMN public.services.invoice_file_url IS 'URL of uploaded invoice file in storage';