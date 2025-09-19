import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import JSON5 from 'json5';
import type { Config } from '../types/config.js';
import { configLogger } from './logger.js';



class ConfigManager {
  private config: Config | null = null;
  private configPath: string;

  constructor() {
    this.configPath = ['config.json5', 'dist/config.json5']
      .map(p => resolve(process.cwd(), p))
      .find(existsSync) ?? resolve(process.cwd(), 'config.json5');
  }

  /**
   * 加载配置文件
   */
  public loadConfig(): Config {
    if (this.config) {
      return this.config;
    }

    if (!existsSync(this.configPath)) {
      throw new Error(`配置文件不存在: ${this.configPath}`);
    }

    try {
      const configContent = readFileSync(this.configPath, 'utf-8');
      this.config = JSON5.parse(configContent) as Config;
      
      // 验证配置
      this.validateConfig(this.config);
      
      return this.config;
    } catch (error) {
      throw new Error(`配置文件解析失败: ${error}`);
    }
  }

  /**
   * 获取配置
   */
  public getConfig(): Config {
    if (!this.config) {
      return this.loadConfig();
    }
    return this.config;
  }

  /**
   * 重新加载配置
   */
  public reloadConfig(): Config {
    this.config = null;
    return this.loadConfig();
  }

  /**
   * 获取配置文件路径
   */
  public getConfigPath(): string {
    return this.configPath;
  }

  /**
   * 验证配置文件
   */
  private validateConfig(config: Config): void {
    if (!config.cookie) {
      throw new Error('配置文件中缺少 cookie 字段');
    }

    if (!config.coin) {
      throw new Error('配置文件中缺少 coin 字段');
    }

    if (!config.shareAndWatch) {
      throw new Error('配置文件中缺少 shareAndWatch 字段');
    }

    if (!config.watchVideo) {
      throw new Error('配置文件中缺少 watchVideo 字段');
    }

    if (!config.global) {
      throw new Error('配置文件中缺少 global 字段');
    }

    if (!config.network) {
      throw new Error('配置文件中缺少 network 字段');
    }

    if (!config.log) {
      throw new Error('配置文件中缺少 log 字段');
    }
  }

  /**
   * 获取默认User-Agent
   */
  public getUserAgent(): string {
    const config = this.getConfig();
    return config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * 检查任务是否启用
   */
  public isTaskEnabled(taskName: 'coin' | 'shareAndWatch' | 'watchVideo'): boolean {
    const config = this.getConfig();
    return config[taskName].enabled || false;
  }

  /**
   * 获取任务延迟时间
   */
  public getTaskDelay(taskName: 'coin' | 'shareAndWatch' | 'watchVideo'): number {
    const config = this.getConfig();
    return config[taskName].delay || 0;
  }

  /**
   * 获取全局启动延迟时间
   */
  public getStartupDelay(): number {
    const config = this.getConfig();
    return config.global.startupDelay || 0;
  }



  /**
   * 更新Cookie并保存到配置文件
   */
  public updateCookie(cookie: string): void {
    if (!this.config) {
      this.loadConfig();
    }
    
    if (this.config) {
      this.config.cookie = cookie;
      
      try {
        // 将更新后的配置写入文件
        writeFileSync(this.configPath, JSON5.stringify(this.config, null, 2), 'utf-8');
        configLogger.info('Cookie已成功保存到配置文件');
      } catch (error) {
        configLogger.error('保存Cookie到配置文件失败:', error);
      }
    }
  }
}

const configManager = new ConfigManager();

export const initConfig = () => configManager.loadConfig();
export const getConfig = () => configManager.getConfig();
export const loadConfig = () => configManager.loadConfig();

export { ConfigManager };