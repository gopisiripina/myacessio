import { LucideIcon } from 'lucide-react';

// Module type definitions
export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  enabled: boolean;
  routes: ModuleRoute[];
  sidebarItems: ModuleSidebarItem[];
  dependencies?: string[];
  settingsPath?: string;
}

export interface ModuleRoute {
  path: string;
  component: React.ComponentType;
  requiresAuth?: boolean;
  requiresRole?: string[];
}

export interface ModuleSidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  section: 'main' | 'modules';
  requiresRole?: string[];
}

export interface ModuleRegistry {
  [moduleId: string]: ModuleConfig;
}

// Module installation status
export interface ModuleStatus {
  installed: boolean;
  enabled: boolean;
  version: string;
}