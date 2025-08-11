import { useState } from 'react';
import { Upload, File, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceUploadProps {
  serviceId?: string;
  currentInvoiceUrl?: string;
  existingUrl?: string | null;
  onInvoiceChange?: (url: string | null) => void;
  onFileUploaded?: (url: string | null) => void;
  disabled?: boolean;
}

export function InvoiceUpload({ 
  serviceId, 
  currentInvoiceUrl, 
  existingUrl,
  onInvoiceChange,
  onFileUploaded, 
  disabled 
}: InvoiceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(currentInvoiceUrl || existingUrl || null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or image file (JPEG, PNG)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${serviceId || 'temp'}_${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('invoices')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('invoices')
        .getPublicUrl(data.path);

      setUploadedFile(publicUrl);
      onInvoiceChange?.(publicUrl);
      onFileUploaded?.(publicUrl);

      toast({
        title: 'Invoice uploaded',
        description: 'Invoice file has been uploaded successfully',
      });

    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!uploadedFile) return;

    try {
      // Extract file path from URL
      const url = new URL(uploadedFile);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // user_id/filename

      // Delete from storage
      const { error } = await supabase.storage
        .from('invoices')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
      }

      setUploadedFile(null);
      onInvoiceChange?.(null);
      onFileUploaded?.(null);

      toast({
        title: 'Invoice removed',
        description: 'Invoice file has been removed',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove invoice file',
        variant: 'destructive',
      });
    }
  };

  const handleViewFile = () => {
    if (uploadedFile) {
      window.open(uploadedFile, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <Label>Invoice File</Label>
      
      {uploadedFile ? (
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">Invoice file uploaded</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewFile}
            disabled={disabled}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF, PNG, JPG or JPEG (max 5MB)</p>
              </div>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading || disabled}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4 animate-pulse" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
}