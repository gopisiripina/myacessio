import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Mail, TestTube2, Save, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailTabProps {
  emailForm: UseFormReturn<any>;
  onSubmitEmail: (data: any) => void;
  handleTestEmail: () => void;
  isUpdatingEmail: boolean;
  isTestingEmail: boolean;
}

export const EmailTab: React.FC<EmailTabProps> = ({
  emailForm,
  onSubmitEmail,
  handleTestEmail,
  isUpdatingEmail,
  isTestingEmail
}) => {
  const isEnabled = emailForm.watch('is_enabled');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration
        </CardTitle>
        <CardDescription>
          Configure SMTP and IMAP settings for email notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
            <FormField
              control={emailForm.control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                    <FormDescription>
                      Allow the system to send emails for notifications and alerts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isEnabled && (
              <>
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    SMTP configuration is required for sending emails. IMAP configuration is optional and used for reading emails.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SMTP Configuration (Outgoing)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtp_host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host *</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="587"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username *</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="App password or account password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_encryption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Encryption</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select encryption" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tls">TLS (recommended)</SelectItem>
                              <SelectItem value="ssl">SSL</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_from_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="noreply@yourcompany.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_from_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">IMAP Configuration (Incoming - Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="imap_host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="imap.gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="imap_port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="993"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="imap_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="imap_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="App password or account password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="imap_encryption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Encryption</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select encryption" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ssl">SSL (recommended)</SelectItem>
                              <SelectItem value="tls">TLS</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between">
              {isEnabled && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTestEmail}
                  disabled={isTestingEmail}
                  className="flex items-center gap-2"
                >
                  {isTestingEmail ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4" />
                  )}
                  Test Configuration
                </Button>
              )}
              
              <Button type="submit" disabled={isUpdatingEmail} className="flex items-center gap-2">
                {isUpdatingEmail ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Email Settings
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};