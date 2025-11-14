/**
 * Centralized Error Logging and Monitoring System
 * Handles errors, warnings, and info logs across the application
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: string;
  error?: Error;
  metadata?: Record<string, any>;
  stack?: string;
}

export class ErrorLogger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000;
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log an error with context
   */
  static error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      message,
      context,
      error,
      metadata,
      stack: error?.stack,
    };

    this.addLog(entry);
    this.consoleLog(entry);

    // In production, send to monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Log a critical error (requires immediate attention)
   */
  static critical(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.CRITICAL,
      message,
      context,
      error,
      metadata,
      stack: error?.stack,
    };

    this.addLog(entry);
    this.consoleLog(entry);

    // Always send critical errors to monitoring
    this.sendToMonitoring(entry);
  }

  /**
   * Log a warning
   */
  static warn(message: string, context?: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.WARN,
      message,
      context,
      metadata,
    };

    this.addLog(entry);
    if (this.isDevelopment) {
      this.consoleLog(entry);
    }
  }

  /**
   * Log informational message
   */
  static info(message: string, context?: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      message,
      context,
      metadata,
    };

    this.addLog(entry);
    if (this.isDevelopment) {
      this.consoleLog(entry);
    }
  }

  /**
   * Log debug information (dev only)
   */
  static debug(message: string, context?: string, metadata?: Record<string, any>): void {
    if (!this.isDevelopment) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.DEBUG,
      message,
      context,
      metadata,
    };

    this.addLog(entry);
    this.consoleLog(entry);
  }

  /**
   * Add log to in-memory storage
   */
  private static addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the latest maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Console log with formatting
   */
  private static consoleLog(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level}]${entry.context ? ` [${entry.context}]` : ''}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.metadata || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.metadata || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.metadata || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.error || '', entry.metadata || '');
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  /**
   * Send to monitoring service (placeholder for production)
   */
  private static sendToMonitoring(entry: LogEntry): void {
    // In production, send to Sentry, DataDog, or similar service
    // For now, just store in localStorage for debugging
    if (typeof window !== 'undefined') {
      try {
        const existingLogs = localStorage.getItem('quantum-casino-errors');
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        logs.push({
          ...entry,
          error: entry.error ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          } : undefined,
        });

        // Keep only last 100 errors
        const recentLogs = logs.slice(-100);
        localStorage.setItem('quantum-casino-errors', JSON.stringify(recentLogs));
      } catch (e) {
        console.error('Failed to store error log:', e);
      }
    }
  }

  /**
   * Get all logs
   */
  static getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  static clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('quantum-casino-errors');
      } catch (e) {
        console.error('Failed to clear error logs:', e);
      }
    }
  }

  /**
   * Get error summary
   */
  static getErrorSummary(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    recent: LogEntry[];
  } {
    const byLevel = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.CRITICAL]: 0,
    };

    for (const log of this.logs) {
      byLevel[log.level]++;
    }

    return {
      total: this.logs.length,
      byLevel,
      recent: this.logs.slice(-10),
    };
  }
}

/**
 * Async wrapper with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    ErrorLogger.error(
      `Operation failed: ${context}`,
      error instanceof Error ? error : new Error(String(error)),
      context
    );

    if (fallback !== undefined) {
      ErrorLogger.warn(`Using fallback value for: ${context}`, context, { fallback });
      return fallback;
    }

    throw error;
  }
}

/**
 * Sync wrapper with error handling
 */
export function withErrorHandlingSync<T>(
  operation: () => T,
  context: string,
  fallback?: T
): T {
  try {
    return operation();
  } catch (error) {
    ErrorLogger.error(
      `Sync operation failed: ${context}`,
      error instanceof Error ? error : new Error(String(error)),
      context
    );

    if (fallback !== undefined) {
      ErrorLogger.warn(`Using fallback value for: ${context}`, context, { fallback });
      return fallback;
    }

    throw error;
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    context?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    context = 'Unknown operation',
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        ErrorLogger.info(`Retry attempt ${attempt}/${maxRetries}`, context);
      }
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        ErrorLogger.warn(
          `Operation failed, retrying in ${delay}ms`,
          context,
          { attempt: attempt + 1, maxRetries, error: lastError.message }
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  ErrorLogger.error(
    `Operation failed after ${maxRetries} retries`,
    lastError,
    context
  );
  throw lastError;
}

// Export singleton
export default ErrorLogger;
