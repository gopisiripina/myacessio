import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MessageSquare, TestTube2, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhatsAppTabProps {
  whatsappForm: UseFormReturn<any>;
  onSubmitWhatsApp: (data: any) => void;
  handleTestWhatsApp: () => void;
  isUpdatingWhatsApp: boolean;
  isTestingWhatsApp: boolean;
}

export const WhatsAppTab: React.FC<WhatsAppTabProps> = ({
  whatsappForm,
  onSubmitWhatsApp,
  handleTestWhatsApp,
  isUpdatingWhatsApp,
  isTestingWhatsApp
}) => {
  const isEnabled = whatsappForm.watch('is_enabled');
  const selectedProvider = whatsappForm.watch('provider');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Business API Configuration
        </CardTitle>
        <CardDescription>
          Configure WhatsApp Business API for sending message notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...whatsappForm}>
          <form onSubmit={whatsappForm.handleSubmit(onSubmitWhatsApp)} className="space-y-6">
            <FormField
              control={whatsappForm.control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable WhatsApp Notifications</FormLabel>
                    <FormDescription>
                      Allow the system to send WhatsApp messages for notifications
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
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    WhatsApp Business API requires approval from Meta and a verified business account. You'll need a Phone Number ID and Access Token from your WhatsApp Business Account.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <FormField
                    control={whatsappForm.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="meta">Meta (Facebook)</SelectItem>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="360dialog">360dialog</SelectItem>
                            <SelectItem value="whatsapp-business-cloud">WhatsApp Business Cloud API</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your WhatsApp Business API provider
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={whatsappForm.control}
                      name="phone_number_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890123456" {...field} />
                          </FormControl>
                          <FormDescription>
                            The Phone Number ID from your WhatsApp Business account
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="access_token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Your WhatsApp API access token" {...field} />
                          </FormControl>
                          <FormDescription>
                            Permanent access token from your WhatsApp Business App
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="business_account_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Account ID</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890123456" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your WhatsApp Business Account ID (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="webhook_verify_token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Verify Token</FormLabel>
                          <FormControl>
                            <Input placeholder="your_verify_token" {...field} />
                          </FormControl>
                          <FormDescription>
                            Token for webhook verification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="webhook_url"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourapp.com/webhooks/whatsapp" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL to receive WhatsApp webhook events (messages, delivery status)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Setup Instructions */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-3">WhatsApp Business API Setup Guide:</h4>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Create a Facebook Business Account and verify your business</li>
                      <li>Set up a WhatsApp Business Account through Facebook Business Manager</li>
                      <li>Add a phone number and get it verified by WhatsApp</li>
                      <li>Create a WhatsApp Business App in Facebook Developers</li>
                      <li>Generate a permanent access token with required permissions</li>
                      <li>Configure webhook endpoint for receiving messages and updates</li>
                    </ol>
                  </div>

                  {/* Provider-specific resources */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Setup Resources:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <a 
                        href="https://developers.facebook.com/apps/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Facebook Developers Console
                      </a>
                      <a 
                        href="https://business.facebook.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Facebook Business Manager
                      </a>
                      <a 
                        href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        WhatsApp Business API Docs
                      </a>
                      <a 
                        href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Cloud API Getting Started
                      </a>
                    </div>
                  </div>

                  {selectedProvider === 'twilio' && (
                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertDescription>
                        For Twilio WhatsApp integration, use your Twilio Account SID as the access token and configure the phone number through Twilio Console.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-between">
              {isEnabled && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTestWhatsApp}
                  disabled={isTestingWhatsApp}
                  className="flex items-center gap-2"
                >
                  {isTestingWhatsApp ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4" />
                  )}
                  Test Configuration
                </Button>
              )}
              
              <Button type="submit" disabled={isUpdatingWhatsApp} className="flex items-center gap-2">
                {isUpdatingWhatsApp ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save WhatsApp Settings
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};