import log4js from 'log4js';

// 日志级别枚举
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// 内存日志条目接口
export interface MemoryLogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
}

// 内存日志存储数组
const memoryLogs: MemoryLogEntry[] = [];

// 自定义内存appender
function memoryAppender() {
  return (loggingEvent: any) => {
    // 格式化消息，处理对象参数
    const formattedMessage = loggingEvent.data.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return JSON.stringify(item);
      }
      return String(item);
    }).join(' ');
    
    const logEntry: MemoryLogEntry = {
      timestamp: new Date(loggingEvent.startTime).toISOString().replace('T', ' ').substring(0, 19),
      level: loggingEvent.level.levelStr,
      module: loggingEvent.categoryName,
      message: formattedMessage
    };
    memoryLogs.push(logEntry);
  };
}

// 配置log4js
log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] [%c] %m'
      }
    },
    memory: {
      type: { configure: memoryAppender }
    }
  },
  categories: {
    default: {
      appenders: ['console', 'memory'],
      level: 'info'
    }
  }
});

// Logger类
export class Logger {
  private log4jsLogger: log4js.Logger;

  constructor(module: string) {
    this.log4jsLogger = log4js.getLogger(module);
  }

  debug(message: string, ...args: any[]): void {
    this.log4jsLogger.debug(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log4jsLogger.info(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log4jsLogger.warn(message, ...args);
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (error instanceof Error) {
      this.log4jsLogger.error(message, error.message, error.stack, ...args);
    } else if (error) {
      this.log4jsLogger.error(message, error, ...args);
    } else {
      this.log4jsLogger.error(message, ...args);
    }
  }
}

// 获取内存中的日志
export function getMemoryLogs(): MemoryLogEntry[] {
  return [...memoryLogs];
}

// 清空内存日志
export function clearMemoryLogs(): void {
  memoryLogs.length = 0;
}

// 获取格式化的内存日志内容
export function getFormattedMemoryLogs(): string {
  return memoryLogs.map(log => {
    const modulePrefix = log.module ? `[${log.module}]` : '';
    return `${log.timestamp} [${log.level}] ${modulePrefix} ${log.message}`;
  }).join('\n');
}

// 创建logger的工厂函数
export function createLogger(module: string): Logger {
  if (!loggers[module]) {
    loggers[module] = new Logger(module);
  }
  return loggers[module];
}

// 预定义的模块loggers缓存
const loggers: { [key: string]: Logger } = {};

// 导出常用模块的logger实例
export const httpLogger = createLogger('HTTP');
export const schedulerLogger = createLogger('SCHEDULER');
export const loginLogger = createLogger('LOGIN');
export const coinsLogger = createLogger('COINS');
export const shareLogger = createLogger('SHARE');
export const watchLogger = createLogger('WATCH');
export const mainLogger = createLogger('MAIN');
export const notificationLogger = createLogger('NOTIFICATION');
export const authLogger = createLogger('AUTH');
export const configLogger = createLogger('CONFIG');

// 默认导出
export default { Logger, createLogger, LogLevel };

// 优雅关闭log4js
process.on('exit', () => {
  log4js.shutdown();
});

process.on('SIGINT', () => {
  log4js.shutdown(() => {
    process.exit(0);
  });
});