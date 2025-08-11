import React from 'react';
import { ModuleConfig } from '@/core/types/modules';
import { CalendarDays } from 'lucide-react';

// Lazy load Company Calendar page
const CompanyCalendar = React.lazy(() => import('../../pages/CompanyCalendar'));

export const companyCalendarModule: ModuleConfig = {
  id: 'company-calendar',
  name: 'Company Calendar',
  description: 'Assign and track working days, holidays, weekends, events, disasters, and strikes by year',
  version: '1.0.0',
  icon: 'CalendarDays',
  enabled: true,
  routes: [
    {
      path: '/company-calendar',
      component: CompanyCalendar,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    }
  ],
  sidebarItems: [
    {
      name: 'Company Calendar',
      href: '/company-calendar',
      icon: CalendarDays,
      section: 'modules',
      requiresRole: ['admin', 'finance']
    }
  ],
  settingsPath: undefined,
};
