import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

export default function Dashboard() {
  const { canManageData } = usePermissions();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Overview of your subscriptions and upcoming renewals
          </p>
        </div>
        {canManageData && (
          <Button asChild size="sm" className="w-full md:w-auto">
            <Link to="/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        )}
      </div>

      <DashboardStats />
      
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Upcoming Renewals</h2>
        <UpcomingRenewals />
      </div>
    </div>
  );
}