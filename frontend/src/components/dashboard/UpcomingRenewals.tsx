import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { useUpcomingRenewals, useOverdueServices } from '@/hooks/useServices';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

export function UpcomingRenewals() {
  const { data: upcoming7Days } = useUpcomingRenewals(7);
  const { data: upcoming30Days } = useUpcomingRenewals(30);
  const { data: overdue } = useOverdueServices();


  const getUrgencyColor = (renewalDate: string) => {
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'destructive';
    if (days <= 7) return 'destructive';
    if (days <= 30) return 'secondary';
    return 'default';
  };

  const getUrgencyLabel = (renewalDate: string) => {
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Overdue Services */}
      <Card className="border-destructive/30 bg-[hsl(var(--destructive)/0.08)] dark:bg-[hsl(var(--destructive)/0.12)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-destructive flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Overdue ({overdue?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overdue?.slice(0, 5).map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{service.service_name}</p>
                <p className="text-xs text-muted-foreground">{service.provider}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="destructive" className="text-xs">
                    {getUrgencyLabel(service.next_renewal_date!)}
                  </Badge>
                  <span className="text-xs font-medium">
                    {formatCurrency(service.next_renewal_amount ?? service.amount, service.currency)}
                  </span>
                </div>
              </div>
              {service.dashboard_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          ))}
          {(overdue?.length || 0) === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No overdue services
            </p>
          )}
        </CardContent>
      </Card>

      {/* Next 7 Days */}
      <Card className="border-accent/30 bg-[hsl(var(--accent)/0.08)] dark:bg-[hsl(var(--accent)/0.12)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-accent flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Next 7 Days ({upcoming7Days?.filter(s => !overdue?.find(o => o.id === s.id))?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming7Days?.filter(s => !overdue?.find(o => o.id === s.id)).slice(0, 5).map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{service.service_name}</p>
                <p className="text-xs text-muted-foreground">{service.provider}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getUrgencyColor(service.next_renewal_date!)} className="text-xs">
                    {format(new Date(service.next_renewal_date!), 'MMM dd')}
                  </Badge>
                  <span className="text-xs font-medium">
                    {formatCurrency(service.next_renewal_amount ?? service.amount, service.currency)}
                  </span>
                </div>
              </div>
              {service.dashboard_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          ))}
          {(upcoming7Days?.filter(s => !overdue?.find(o => o.id === s.id))?.length || 0) === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No renewals in next 7 days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Next 30 Days */}
      <Card className="border-secondary/30 bg-[hsl(var(--secondary)/0.08)] dark:bg-[hsl(var(--secondary)/0.12)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-secondary flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Next 30 Days ({upcoming30Days?.filter(s => 
              !overdue?.find(o => o.id === s.id) && 
              !upcoming7Days?.find(u => u.id === s.id)
            )?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming30Days?.filter(s => 
            !overdue?.find(o => o.id === s.id) && 
            !upcoming7Days?.find(u => u.id === s.id)
          ).slice(0, 5).map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{service.service_name}</p>
                <p className="text-xs text-muted-foreground">{service.provider}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {format(new Date(service.next_renewal_date!), 'MMM dd')}
                  </Badge>
                  <span className="text-xs font-medium">
                    {formatCurrency(service.next_renewal_amount ?? service.amount, service.currency)}
                  </span>
                </div>
              </div>
              {service.dashboard_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          ))}
          {(upcoming30Days?.filter(s => 
            !overdue?.find(o => o.id === s.id) && 
            !upcoming7Days?.find(u => u.id === s.id)
          )?.length || 0) === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No renewals in next 30 days
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}