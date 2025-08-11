// Module registry and initialization
import { moduleManager } from '@/core/modules/ModuleManager';
import { subscriptionModule } from './subscriptions';
import { assetsModule } from './assets';
import { companyCalendarModule } from './company-calendar';

// Register all available modules
export function initializeModules() {
  // Register core modules
  moduleManager.registerModule(subscriptionModule);
  moduleManager.registerModule(assetsModule);
  moduleManager.registerModule(companyCalendarModule);

  // Future modules will be registered here
  // moduleManager.registerModule(inventoryModule);
  // moduleManager.registerModule(crmModule);
  // moduleManager.registerModule(hrModule);
  // etc...
}

// Export for use in components
export { moduleManager };
export * from './subscriptions';
export * from './assets';
export * from './company-calendar';