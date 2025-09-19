import type { Config } from '../types/config.js';
declare class ConfigManager {
    private config;
    private configPath;
    constructor(configPath?: string);
    /**
     * 加载配置文件
     */
    loadConfig(): Config;
    /**
     * 获取配置
     */
    getConfig(): Config;
    /**
     * 重新加载配置
     */
    reloadConfig(): Config;
    /**
     * 验证配置文件
     */
    private validateConfig;
    /**
     * 获取默认User-Agent
     */
    getUserAgent(): string;
    /**
     * 检查功能是否启用
     */
    isFunctionEnabled(functionName: keyof Config['function']): boolean;
    /**
     * 更新Cookie并保存到配置文件
     */
    updateCookie(cookie: string): void;
}
export declare const initConfig: (configPath?: string) => Config;
export declare const getConfig: () => Config;
export declare const loadConfig: (configPath?: string) => Config;
export { ConfigManager };
