export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export interface MemoryLogEntry {
    timestamp: string;
    level: string;
    module: string;
    message: string;
}
export declare class Logger {
    private log4jsLogger;
    constructor(module: string);
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, error?: Error | any, ...args: any[]): void;
}
export declare function getMemoryLogs(): MemoryLogEntry[];
export declare function clearMemoryLogs(): void;
export declare function getFormattedMemoryLogs(): string;
export declare function createLogger(module: string): Logger;
export declare const httpLogger: Logger;
export declare const schedulerLogger: Logger;
export declare const loginLogger: Logger;
export declare const coinsLogger: Logger;
export declare const shareLogger: Logger;
export declare const watchLogger: Logger;
export declare const mainLogger: Logger;
export declare const notificationLogger: Logger;
export declare const authLogger: Logger;
export declare const configLogger: Logger;
declare const _default: {
    Logger: typeof Logger;
    createLogger: typeof createLogger;
    LogLevel: typeof LogLevel;
};
export default _default;
