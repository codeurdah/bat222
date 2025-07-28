import { config } from '../config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!config.features.enableLogging) return false;
    
    // In production, only log warnings and errors
    if (config.app.environment === 'production') {
      return level === 'warn' || level === 'error';
    }
    
    return true;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
    
    // In production, send errors to monitoring service
    if (config.app.environment === 'production' && config.features.enableErrorReporting) {
      this.reportError(message, error, ...args);
    }
  }

  private reportError(message: string, error?: Error, ...args: any[]): void {
    // Here you would integrate with error reporting services like Sentry, LogRocket, etc.
    // For now, we'll just log to console in production
    try {
      const errorData = {
        message,
        error: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        additionalData: args,
      };
      
      // Send to error reporting service
      // Example: Sentry.captureException(error, { extra: errorData });
      console.error('Error reported:', errorData);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

export const logger = new Logger();