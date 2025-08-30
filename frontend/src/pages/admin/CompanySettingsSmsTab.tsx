import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Smartphone, TestTube2, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SmsTabProps {
  smsForm: UseFormReturn<any>;
  onSubmitSms: (data: any) => void;
  handleTestSms: () => void;
  isUpdatingSms: boolean;
  isTestingSms: boolean;
}

export const SmsTab: React.FC<SmsTabProps> = ({
  smsForm,
  onSubmitSms,
  handleTestSms,
  isUpdatingSms,
  isTestingSms
}) => {
  const isEnabled = smsForm.watch('is_enabled');
  const selectedProvider = smsForm.watch('provider');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          SMS Gateway Configuration
        </CardTitle>
        <CardDescription>
          Configure SMS service provider for sending text message notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...smsForm}>
          <form onSubmit={smsForm.handleSubmit(onSubmitSms)} className="space-y-6">
            <FormField
              control={smsForm.control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable SMS Notifications</FormLabel>
                    <FormDescription>
                      Allow the system to send SMS notifications and alerts
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
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    SMS gateway configuration requires API credentials from your chosen provider. Popular providers include Twilio, AWS SNS, Nexmo, and TextLocal.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <FormField
                    control={smsForm.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMS Provider *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select SMS provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="aws-sns">AWS SNS</SelectItem>
                            <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                            <SelectItem value="textlocal">TextLocal</SelectItem>
                            <SelectItem value="msg91">MSG91</SelectItem>
                            <SelectItem value="fast2sms">Fast2SMS</SelectItem>
                            <SelectItem value="custom">Custom Provider</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={smsForm.control}
                      name="api_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key *</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Your SMS provider API key" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {selectedProvider === 'twilio' && 'Account SID from Twilio Console'}
                            {selectedProvider === 'aws-sns' && 'AWS Access Key ID'}
                            {selectedProvider === 'nexmo' && 'API Key from Vonage Dashboard'}
                            {selectedProvider === 'textlocal' && 'API Key from TextLocal'}
                            {selectedProvider === 'msg91' && 'Authkey from MSG91'}
                            {selectedProvider === 'fast2sms' && 'Authorization key from Fast2SMS'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="api_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            API Secret 
                            {selectedProvider === 'twilio' && ' *'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Your SMS provider API secret" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {selectedProvider === 'twilio' && 'Auth Token from Twilio Console'}
                            {selectedProvider === 'aws-sns' && 'AWS Secret Access Key'}
                            {selectedProvider === 'nexmo' && 'API Secret from Vonage Dashboard'}
                            {selectedProvider !== 'twilio' && selectedProvider !== 'aws-sns' && selectedProvider !== 'nexmo' && 'API Secret (if required by provider)'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="sender_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender ID</FormLabel>
                          <FormControl>
                            <Input placeholder="YOUR_BRAND" {...field} />
                          </FormControl>
                          <FormDescription>
                            The sender name or number that recipients will see
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="base_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.provider.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            API endpoint base URL (for custom providers)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="webhook_url"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourapp.com/webhooks/sms" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL to receive delivery status updates (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Provider-specific help */}
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium">Provider Setup Resources:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {selectedProvider === 'twilio' && (
                        <>
                          <a 
                            href="https://console.twilio.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Twilio Console
                          </a>
                          <a 
                            href="https://www.twilio.com/docs/sms/api" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            SMS API Documentation
                          </a>
                        </>
                      )}
                      
                      {selectedProvider === 'aws-sns' && (
                        <>
                          <a 
                            href="https://console.aws.amazon.com/sns/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            AWS SNS Console
                          </a>
                          <a 
                            href="https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-phone-number-as-subscriber.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            SMS Documentation
                          </a>
                        </>
                      )}

                      {selectedProvider === 'nexmo' && (
                        <>
                          <a 
                            href="https://dashboard.nexmo.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Vonage Dashboard
                          </a>
                          <a 
                            href="https://developer.vonage.com/messaging/sms/overview" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            SMS API Documentation
                          </a>
                        </>
                      )}

                      {selectedProvider === 'textlocal' && (
                        <>
                          <a 
                            href="https://www.textlocal.com/login/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            TextLocal Login
                          </a>
                          <a 
                            href="https://www.textlocal.com/documentation/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            API Documentation
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between">
              {isEnabled && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTestSms}
                  disabled={isTestingSms}
                  className="flex items-center gap-2"
                >
                  {isTestingSms ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4" />
                  )}
                  Test Configuration
                </Button>
              )}
              
              <Button type="submit" disabled={isUpdatingSms} className="flex items-center gap-2">
                {isUpdatingSms ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save SMS Settings
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};