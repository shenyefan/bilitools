import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import JSON5 from 'json5';
import { configLogger } from './logger.js';
class ConfigManager {
    config = null;
    configPath;
    constructor(configPath) {
        this.configPath = configPath || resolve(process.cwd(), 'config/config.json5');
    }
    /**
     * 加载配置文件
     */
    loadConfig() {
        if (this.config) {
            return this.config;
        }
        if (!existsSync(this.configPath)) {
            throw new Error(`配置文件不存在: ${this.configPath}`);
        }
        try {
            const configContent = readFileSync(this.configPath, 'utf-8');
            this.config = JSON5.parse(configContent);
            // 验证配置
            this.validateConfig(this.config);
            return this.config;
        }
        catch (error) {
            throw new Error(`配置文件解析失败: ${error}`);
        }
    }
    /**
     * 获取配置
     */
    getConfig() {
        if (!this.config) {
            return this.loadConfig();
        }
        return this.config;
    }
    /**
     * 重新加载配置
     */
    reloadConfig() {
        this.config = null;
        return this.loadConfig();
    }
    /**
     * 验证配置文件
     */
    validateConfig(config) {
        if (!config.cookie) {
            throw new Error('配置文件中缺少 cookie 字段');
        }
        if (!config.coin) {
            throw new Error('配置文件中 coin.targetCoins 字段无效');
        }
        if (!config.function) {
            throw new Error('配置文件中缺少 function 字段');
        }
        if (!config.network) {
            throw new Error('配置文件中缺少 network 字段');
        }
    }
    /**
     * 获取默认User-Agent
     */
    getUserAgent() {
        const config = this.getConfig();
        return config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }
    /**
     * 检查功能是否启用
     */
    isFunctionEnabled(functionName) {
        const config = this.getConfig();
        return config.function[functionName] || false;
    }
    /**
     * 更新Cookie并保存到配置文件
     */
    updateCookie(cookie) {
        if (!this.config) {
            this.loadConfig();
        }
        if (this.config) {
            this.config.cookie = cookie;
            try {
                // 将更新后的配置写入文件
                writeFileSync(this.configPath, JSON5.stringify(this.config, null, 2), 'utf-8');
                configLogger.info('Cookie已成功保存到配置文件');
            }
            catch (error) {
                configLogger.error('保存Cookie到配置文件失败:', error);
            }
        }
    }
}
const configManager = new ConfigManager();
export const initConfig = (configPath) => configManager.loadConfig();
export const getConfig = () => configManager.getConfig();
export const loadConfig = (configPath) => {
    if (configPath) {
        const newManager = new ConfigManager(configPath);
        return newManager.loadConfig();
    }
    return configManager.loadConfig();
};
export { ConfigManager };
