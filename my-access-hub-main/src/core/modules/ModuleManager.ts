import { ModuleConfig, ModuleRegistry } from '@/core/types/modules';

// Available modules registry
const moduleRegistry: ModuleRegistry = {};

// Module manager class
export class ModuleManager {
  private static instance: ModuleManager;
  private enabledModules: Set<string> = new Set();
  private moduleConfigs: Map<string, ModuleConfig> = new Map();
  private hasStoredState = false;

  private constructor() {
    this.loadEnabledModules();
  }

  static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  // Register a module
  registerModule(config: ModuleConfig): void {
    this.moduleConfigs.set(config.id, config);
    moduleRegistry[config.id] = config;

    // Respect persisted state if it exists; otherwise use module default
    if (!this.hasStoredState && config.enabled) {
      this.enabledModules.add(config.id);
    }
  }

  // Get all registered modules
  getAllModules(): ModuleConfig[] {
    return Array.from(this.moduleConfigs.values());
  }

  // Get enabled modules
  getEnabledModules(): ModuleConfig[] {
    return Array.from(this.moduleConfigs.values()).filter(
      module => this.enabledModules.has(module.id)
    );
  }

  // Enable a module
  enableModule(moduleId: string): boolean {
    const module = this.moduleConfigs.get(moduleId);
    if (!module) return false;

    // Check dependencies
    if (module.dependencies) {
      for (const dep of module.dependencies) {
        if (!this.enabledModules.has(dep)) {
          console.warn(`Cannot enable ${moduleId}: dependency ${dep} is not enabled`);
          return false;
        }
      }
    }

    this.enabledModules.add(moduleId);
    this.saveEnabledModules();
    return true;
  }

  // Disable a module
  disableModule(moduleId: string): boolean {
    // Check if other modules depend on this one
    const dependentModules = Array.from(this.moduleConfigs.values()).filter(
      module => module.dependencies?.includes(moduleId) && this.enabledModules.has(module.id)
    );

    if (dependentModules.length > 0) {
      console.warn(`Cannot disable ${moduleId}: modules ${dependentModules.map(m => m.id).join(', ')} depend on it`);
      return false;
    }

    this.enabledModules.delete(moduleId);
    this.saveEnabledModules();
    return true;
  }

  // Check if module is enabled
  isModuleEnabled(moduleId: string): boolean {
    return this.enabledModules.has(moduleId);
  }

  // Get all routes from enabled modules
  getEnabledRoutes(): { path: string; component: React.ComponentType; requiresAuth?: boolean; requiresRole?: string[] }[] {
    const routes: { path: string; component: React.ComponentType; requiresAuth?: boolean; requiresRole?: string[] }[] = [];
    
    for (const module of this.getEnabledModules()) {
      routes.push(...module.routes);
    }
    
    return routes;
  }

  // Get sidebar items from enabled modules
  getEnabledSidebarItems(): any[] {
    const items: any[] = [];
    
    for (const module of this.getEnabledModules()) {
      items.push(...module.sidebarItems);
    }
    
    return items;
  }

  // Save enabled modules to localStorage
  private saveEnabledModules(): void {
    localStorage.setItem('enabledModules', JSON.stringify(Array.from(this.enabledModules)));
  }

  // Load enabled modules from localStorage
  private loadEnabledModules(): void {
    try {
      const stored = localStorage.getItem('enabledModules');
      this.hasStoredState = stored !== null;
      if (stored) {
        const enabledArray = JSON.parse(stored);
        this.enabledModules = new Set(enabledArray);
      }
    } catch (error) {
      console.error('Failed to load enabled modules:', error);
    }
  }
}

// Export singleton instance
export const moduleManager = ModuleManager.getInstance();