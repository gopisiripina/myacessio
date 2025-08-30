import React from 'react';
import { ModuleConfig } from '@/core/types/modules';
import { Repeat } from 'lucide-react';

// Lazy load subscription components
const SubscriptionDashboard = React.lazy(() => import('../../pages/SubscriptionDashboard'));
const AddService = React.lazy(() => import('../../pages/AddService'));
const EditService = React.lazy(() => import('../../pages/EditService'));
const Services = React.lazy(() => import('../../pages/Services'));
const Payments = React.lazy(() => import('../../pages/Payments'));
const Reports = React.lazy(() => import('../../pages/Reports'));
const SubscriptionCategoriesManagement = React.lazy(() => import('../../pages/SubscriptionCategoriesManagement'));
const SubscriptionSettings = React.lazy(() => import('../../pages/admin/SubscriptionSettings'));

export const subscriptionModule: ModuleConfig = {
  id: 'subscriptions',
  name: 'Subscription Management',
  description: 'Manage recurring subscriptions, payments, and billing cycles',
  version: '1.0.0',
  icon: 'Repeat',
  enabled: true,
  routes: [
    {
      path: '/',
      component: SubscriptionDashboard,
      requiresAuth: true
    },
    {
      path: '/subscriptions',
      component: SubscriptionDashboard,
      requiresAuth: true
    },
    {
      path: '/services/new',
      component: AddService,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    },
    {
      path: '/services/edit/:id',
      component: EditService,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    },
    {
      path: '/services',
      component: Services,
      requiresAuth: true
    },
    {
      path: '/payments',
      component: Payments,
      requiresAuth: true
    },
    {
      path: '/reports',
      component: Reports,
      requiresAuth: true
    },
    {
      path: '/subscription-management/categories',
      component: SubscriptionCategoriesManagement,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    },
    {
      path: '/categories',
      component: SubscriptionCategoriesManagement,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    },
    {
      path: '/admin/subscription-settings',
      component: SubscriptionSettings,
      requiresAuth: true,
      requiresRole: ['admin']
    }
  ],
  sidebarItems: [
    {
      name: 'Subscriptions',
      href: '/subscriptions',
      icon: Repeat,
      section: 'modules'
    }
  ],
  settingsPath: '/admin/subscription-settings'
};