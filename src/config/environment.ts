// Environment configuration
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Banque Atlantique',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  },
  features: {
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
  },
  contact: {
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@banqueatlantique.tg',
    phone: import.meta.env.VITE_CONTACT_PHONE || '+228-XX-XX-XX-XX',
  },
};

export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
export const isTest = config.app.environment === 'test';