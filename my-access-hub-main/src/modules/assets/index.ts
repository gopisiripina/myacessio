import React from 'react';
import { ModuleConfig } from '@/core/types/modules';
import { TrendingDown } from 'lucide-react';

// Lazy load asset components
const AssetDashboard = React.lazy(() => import('../../pages/AssetDashboard'));
const AddAsset = React.lazy(() => import('../../pages/AddAsset'));
const AssetCategoriesManagement = React.lazy(() => import('../../pages/AssetCategoriesManagement'));
const AssetReports = React.lazy(() => import('../../pages/AssetReports'));
const DepreciationManagement = React.lazy(() => import('../../pages/DepreciationManagement'));
const AssetSettings = React.lazy(() => import('../../pages/admin/AssetSettings'));

export const assetsModule: ModuleConfig = {
  id: 'assets',
  name: 'Assets & Depreciation',
  description: 'Comprehensive asset management with depreciation tracking',
  version: '1.0.0',
  icon: 'TrendingDown',
  enabled: true,
  routes: [
    {
      path: '/assets-dashboard',
      component: AssetDashboard,
      requiresAuth: true
    },
    {
      path: '/assets/new',
      component: AddAsset,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    },
    {
      path: '/assets/categories',
      component: AssetCategoriesManagement,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    },
    {
      path: '/assets/reports',
      component: AssetReports,
      requiresAuth: true
    },
    {
      path: '/assets/depreciation',
      component: DepreciationManagement,
      requiresAuth: true,
      requiresRole: ['admin', 'finance']
    },
    {
      path: '/admin/asset-settings',
      component: AssetSettings,
      requiresAuth: true,
      requiresRole: ['admin']
    }
  ],
  sidebarItems: [
    {
      name: 'Assets & Depreciation',
      href: '/assets-dashboard',
      icon: TrendingDown,
      section: 'modules'
    }
  ],
  settingsPath: '/admin/asset-settings'
};