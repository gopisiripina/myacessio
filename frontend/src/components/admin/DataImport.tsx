import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, AlertTriangle, File, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface DragState {
  isDragOver: boolean;
  isDragActive: boolean;
}

export function DataImport() {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [dragState, setDragState] = useState<DragState>({ isDragOver: false, isDragActive: false });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        data.push(row);
      }
    }

    return data;
  };

  const importServices = async (data: any[]): Promise<ImportResult> => {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        // More flexible column mapping for service_name (required field)
        const serviceName = row.service_name || row.name || row.serviceName || row.service || row.title;
        const provider = row.provider || row.vendor || row.company || row.supplier;
        
        // Validate required fields
        if (!serviceName) {
          result.failed++;
          result.errors.push(`Row ${result.success + result.failed}: Missing required service_name/name field. Available columns: ${Object.keys(row).join(', ')}`);
          continue;
        }
        
        if (!provider) {
          result.failed++;
          result.errors.push(`Row ${result.success + result.failed}: Missing required provider field. Available columns: ${Object.keys(row).join(', ')}`);
          continue;
        }

        // Get current user ID instead of hardcoded value
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          result.failed++;
          result.errors.push(`Row ${result.success + result.failed}: User not authenticated`);
          continue;
        }

        // Map CSV columns to database columns with better fallbacks
        const service = {
          service_name: serviceName,
          provider: provider,
          plan_name: row.plan_name || row.plan || row.planName,
          amount: parseFloat(row.amount || row.cost || row.price) || 0,
          currency: row.currency || 'USD',
          billing_cycle: row.billing_cycle || row.billingCycle || row.cycle || 'Monthly',
          status: row.status || 'Active',
          start_date: row.start_date || row.startDate || new Date().toISOString().split('T')[0],
          dashboard_url: row.dashboard_url || row.dashboardUrl || row.url,
          account_email: row.account_email || row.accountEmail || row.email,
          auto_renew: row.auto_renew === 'true' || row.auto_renew === '1' || row.autoRenew === 'true',
          user_id: user.id,
          category_id: '39904b37-b9ff-4a5f-af6f-88cb1169f6ab' // Default category
        };

        const { error } = await supabase
          .from('services')
          .insert(service);

        if (error) {
          result.failed++;
          result.errors.push(`Service ${service.service_name}: ${error.message}`);
        } else {
          result.success++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${result.success + result.failed}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  };

  const importPayments = async (data: any[]): Promise<ImportResult> => {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        const payment = {
          service_id: row.service_id,
          amount: parseFloat(row.amount) || 0,
          currency: row.currency || 'USD',
          payment_date: row.payment_date,
          invoice_number: row.invoice_number,
          paid_by: row.paid_by,
          remarks: row.remarks,
          user_id: row.user_id || '00000000-0000-0000-0000-000000000000'
        };

        const { error } = await supabase
          .from('payments')
          .insert(payment);

        if (error) {
          result.failed++;
          result.errors.push(`Payment ${payment.invoice_number || 'Unknown'}: ${error.message}`);
        } else {
          result.success++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${result.success + result.failed}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  };

  const importVendors = async (data: any[]): Promise<ImportResult> => {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        const vendor = {
          name: row.name,
          website: row.website,
          support_email: row.support_email,
          support_phone: row.support_phone,
          notes: row.notes
        };

        const { error } = await supabase
          .from('vendors')
          .insert(vendor);

        if (error) {
          result.failed++;
          result.errors.push(`Vendor ${vendor.name}: ${error.message}`);
        } else {
          result.success++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${result.success + result.failed}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['text/csv', 'application/json', 'text/plain'];
    const validExtensions = ['.csv', '.json'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType && !hasValidExtension) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or JSON file",
        variant: "destructive"
      });
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setIsImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      let data: any[] = [];
      let result: ImportResult;

      if (file.name.toLowerCase().endsWith('.csv')) {
        data = parseCSV(text);
      } else if (file.name.toLowerCase().endsWith('.json')) {
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON.');
      }

      if (data.length === 0) {
        throw new Error('No valid data found in file');
      }

      // Check if this is a system export file (nested structure)
      const firstRow = data[0];
      if (firstRow.services || firstRow.payments || firstRow.vendors) {
        // This is a system export file, extract the appropriate data
        const fileName = file.name.toLowerCase();
        
        if (fileName.includes('service') && firstRow.services) {
          data = Array.isArray(firstRow.services) ? firstRow.services : [firstRow.services];
        } else if (fileName.includes('payment') && firstRow.payments) {
          data = Array.isArray(firstRow.payments) ? firstRow.payments : [firstRow.payments];
        } else if (fileName.includes('vendor') && firstRow.vendors) {
          data = Array.isArray(firstRow.vendors) ? firstRow.vendors : [firstRow.vendors];
        } else {
          // Auto-detect based on which data is available and has content
          if (firstRow.services && Array.isArray(firstRow.services) && firstRow.services.length > 0) {
            data = firstRow.services;
            toast({
              title: "System export detected",
              description: "Importing services data from system export file"
            });
          } else if (firstRow.payments && Array.isArray(firstRow.payments) && firstRow.payments.length > 0) {
            data = firstRow.payments;
            toast({
              title: "System export detected", 
              description: "Importing payments data from system export file"
            });
          } else if (firstRow.vendors && Array.isArray(firstRow.vendors) && firstRow.vendors.length > 0) {
            data = firstRow.vendors;
            toast({
              title: "System export detected",
              description: "Importing vendors data from system export file"
            });
          } else {
            throw new Error('System export file detected but no importable data found. Available sections: ' + Object.keys(firstRow).filter(key => Array.isArray(firstRow[key]) && firstRow[key].length > 0).join(', ') + '. Please ensure your export file contains data in the services, payments, or vendors sections.');
          }
        }
        
        if (data.length === 0) {
          throw new Error('No data found in the selected section of the export file');
        }
      }

      // Determine import type based on file name or data structure
      const fileName = file.name.toLowerCase();
      if (fileName.includes('service')) {
        result = await importServices(data);
      } else if (fileName.includes('payment')) {
        result = await importPayments(data);
      } else if (fileName.includes('vendor')) {
        result = await importVendors(data);
      } else {
        // Try to auto-detect based on data structure
        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        
        // More flexible detection patterns
        const hasServiceFields = keys.some(key => 
          key.toLowerCase().includes('service') || 
          key.toLowerCase().includes('provider') ||
          key.toLowerCase().includes('subscription') ||
          key.toLowerCase().includes('renewal')
        );
        
        const hasPaymentFields = keys.some(key => 
          key.toLowerCase().includes('payment') || 
          key.toLowerCase().includes('invoice') ||
          key.toLowerCase().includes('amount') ||
          key.toLowerCase().includes('transaction')
        );
        
        const hasVendorFields = keys.some(key => 
          key.toLowerCase().includes('vendor') || 
          key.toLowerCase().includes('supplier') ||
          key.toLowerCase().includes('company') ||
          (key.toLowerCase().includes('name') && (
            keys.some(k => k.toLowerCase().includes('website')) ||
            keys.some(k => k.toLowerCase().includes('email')) ||
            keys.some(k => k.toLowerCase().includes('contact'))
          ))
        );

        if (hasServiceFields) {
          result = await importServices(data);
        } else if (hasPaymentFields) {
          result = await importPayments(data);
        } else if (hasVendorFields) {
          result = await importVendors(data);
        } else {
          throw new Error(`Could not determine data type from file structure. Available columns: ${keys.join(', ')}. Please name your file with "service", "payment", or "vendor" keyword, or ensure your data has recognizable column names.`);
        }
      }

      setImportResults(result);

      toast({
        title: "Import completed",
        description: `${result.success} records imported successfully, ${result.failed} failed`
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragOver: true, isDragActive: true });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragOver: false, isDragActive: false });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragOver: false, isDragActive: false });

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    await processFile(file);
  }, []);

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Data Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Supported formats: CSV, JSON. File should contain services, payments, or vendors data.
            Name your file with "service", "payment", or "vendor" keyword for auto-detection.
          </AlertDescription>
        </Alert>

        {/* Drag and Drop Zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
            dragState.isDragOver 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isImporting && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!isImporting ? openFileDialog : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileInput}
            className="hidden"
            disabled={isImporting}
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            {dragState.isDragOver ? (
              <>
                <Upload className="h-8 w-8 text-primary animate-bounce" />
                <p className="text-sm font-medium text-primary">Drop your file here!</p>
              </>
            ) : selectedFile ? (
              <>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedFile();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to select a different file or drag & drop to replace
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drag & drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV or JSON files up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {isImporting && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Processing file...</span>
          </div>
        )}

        {importResults && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Successful: {importResults.success}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Failed: {importResults.failed}</span>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-destructive">Errors:</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importResults.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      {error}
                    </div>
                  ))}
                  {importResults.errors.length > 10 && (
                    <div className="text-xs text-muted-foreground">
                      ... and {importResults.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Sample CSV Format:</Label>
          <div className="text-xs bg-muted p-2 rounded font-mono">
            <div>Services: service_name,provider,amount,currency,billing_cycle,status</div>
            <div>Payments: service_id,amount,currency,payment_date,invoice_number</div>
            <div>Vendors: name,website,support_email,support_phone</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}