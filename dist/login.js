#!/usr/bin/env node
import { loadConfig, ConfigManager } from './core/config.js';
import { LoginTask } from './tasks/loginTask.js';
import { initHttpClient } from './core/http.js';
import { mainLogger } from './core/logger.js';
import { pcLogin } from './core/auth/login.js';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import JSON5 from 'json5';
// 兼容青龙面板环境
class Env {
    name;
    constructor(name) {
        this.name = name;
    }
}
const $ = new Env('哔哩哔哩 - 登录');
/**
 * 检查登录状态的独立入口文件
 * 适用于青龙面板、云函数等环境
 */
async function checkLoginStatus() {
    try {
        // 加载配置
        let config;
        try {
            config = loadConfig();
        }
        catch (configError) {
            // 如果是配置文件不存在的错误，生成默认配置后重新加载
            const errorMessage = configError instanceof Error ? configError.message : '未知错误';
            if (errorMessage.includes('配置文件不存在')) {
                mainLogger.warn('配置文件不存在，正在生成默认配置文件...');
                generateDefaultConfig();
                // 重新尝试加载配置
                config = loadConfig();
            }
            else {
                throw configError;
            }
        }
        // 初始化HTTP客户端
        initHttpClient(config);
        // 执行登录检查
        const loginTask = new LoginTask();
        const result = await loginTask.execute();
        if (result.success) {
            const userInfo = loginTask.getUserInfo();
            mainLogger.info('登录状态: 已登录');
            if (userInfo) {
                mainLogger.info(`用户名: ${userInfo.username}`);
                mainLogger.info(`等级: ${userInfo.level}`);
                mainLogger.info(`硬币: ${userInfo.coins}`);
                mainLogger.info(`VIP状态: ${userInfo.vipStatus === 1 ? '是' : '否'}`);
            }
            process.exit(0);
        }
        else {
            mainLogger.error('登录状态: 未登录');
            mainLogger.error(`错误信息: ${result.message}`);
            // 启动扫码登录流程
            mainLogger.info('检测到未登录，正在启动扫码登录...');
            await pcLogin();
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        mainLogger.error('检查登录状态时发生异常:', errorMessage);
        process.exit(1);
    }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    checkLoginStatus();
}
/**
 * 生成默认配置文件
 */
function generateDefaultConfig() {
    // 使用ConfigManager的路径查找逻辑
    const configManager = new ConfigManager();
    const defaultConfigPath = configManager.getConfigPath();
    const defaultConfig = {
        cookie: "your_bilibili_cookie_here",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        global: {
            startupDelay: 1800
        },
        coin: {
            enabled: true,
            targetCoins: 2,
            targetLevel: 6,
            stayCoins: 0,
            retryNum: 3,
            coinsPerVideo: 1,
            selectLike: true,
            delay: 30
        },
        shareAndWatch: {
            enabled: true,
            delay: 30
        },
        watchVideo: {
            enabled: true,
            delay: 30
        },
        notification: {
            wechatWork: {
                enabled: false,
                corpid: "",
                corpsecret: "",
                agentid: 0,
                touser: "@all",
                baseUrl: "https://qyapi.weixin.qq.com"
            }
        },
        network: {
            timeout: 10000,
            retries: 3,
            delay: 30
        },
        log: {
            level: "info"
        }
    };
    try {
        // 写入默认配置文件
        writeFileSync(defaultConfigPath, JSON5.stringify(defaultConfig, null, 2), 'utf-8');
        mainLogger.info(`默认配置文件已生成: ${defaultConfigPath}`);
    }
    catch (error) {
        throw new Error(`生成默认配置文件失败: ${error}`);
    }
}
// 导出函数供其他模块调用
export { checkLoginStatus };
