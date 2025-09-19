import log4js from 'log4js';
// 日志级别枚举
export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
// 内存日志存储数组
const memoryLogs = [];
// 自定义内存appender
function memoryAppender() {
    return (loggingEvent) => {
        // 格式化消息，处理对象参数
        const formattedMessage = loggingEvent.data.map((item) => {
            if (typeof item === 'object' && item !== null) {
                return JSON.stringify(item);
            }
            return String(item);
        }).join(' ');
        const logEntry = {
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
    log4jsLogger;
    constructor(module) {
        this.log4jsLogger = log4js.getLogger(module);
    }
    debug(message, ...args) {
        this.log4jsLogger.debug(message, ...args);
    }
    info(message, ...args) {
        this.log4jsLogger.info(message, ...args);
    }
    warn(message, ...args) {
        this.log4jsLogger.warn(message, ...args);
    }
    error(message, error, ...args) {
        if (error instanceof Error) {
            this.log4jsLogger.error(message, error.message, error.stack, ...args);
        }
        else if (error) {
            this.log4jsLogger.error(message, error, ...args);
        }
        else {
            this.log4jsLogger.error(message, ...args);
        }
    }
}
// 获取内存中的日志
export function getMemoryLogs() {
    return [...memoryLogs];
}
// 清空内存日志
export function clearMemoryLogs() {
    memoryLogs.length = 0;
}
// 获取格式化的内存日志内容
export function getFormattedMemoryLogs() {
    return memoryLogs.map(log => {
        const modulePrefix = log.module ? `[${log.module}]` : '';
        return `${log.timestamp} [${log.level}] ${modulePrefix} ${log.message}`;
    }).join('\n');
}
// 创建logger的工厂函数
export function createLogger(module) {
    if (!loggers[module]) {
        loggers[module] = new Logger(module);
    }
    return loggers[module];
}
// 预定义的模块loggers缓存
const loggers = {};
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
