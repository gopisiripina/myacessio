-- Create invoices bucket if it doesn't exist (make it private for security)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  updated_at = now();

-- Create RLS policies for invoice access
-- Users can only access their own invoices
CREATE POLICY "Users can view their own invoices" ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'invoices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin and finance users can view all invoices
CREATE POLICY "Admin and finance can view all invoices" ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'invoices' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'finance')
  )
);

-- Users can upload their own invoices
CREATE POLICY "Users can upload their own invoices" ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'invoices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin and finance can upload invoices for any user
CREATE POLICY "Admin and finance can upload invoices" ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'invoices' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'finance')
  )
);

-- Users can update their own invoices
CREATE POLICY "Users can update their own invoices" ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'invoices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin and finance can update all invoices
CREATE POLICY "Admin and finance can update all invoices" ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'invoices' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'finance')
  )
);

-- Users can delete their own invoices
CREATE POLICY "Users can delete their own invoices" ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'invoices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin can delete any invoice
CREATE POLICY "Admin can delete any invoice" ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'invoices' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);