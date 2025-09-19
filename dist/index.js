#!/usr/bin/env node
import { loadConfig } from './core/config.js';
import { TaskScheduler } from './core/scheduler.js';
import { initHttpClient } from './core/http.js';
import { mainLogger } from './core/logger.js';
import { fileURLToPath } from 'url';
// 兼容青龙面板环境
class Env {
    name;
    constructor(name) {
        this.name = name;
    }
}
const $ = new Env('哔哩哔哩 - 每日任务');
/**
 * 执行每日任务的独立入口文件
 * 适用于青龙面板、云函数等环境
 */
async function runDailyTasks() {
    try {
        // 加载配置
        const config = loadConfig(process.env.CONFIG_PATH);
        // 初始化HTTP客户端
        initHttpClient(config);
        // 创建任务调度器
        const scheduler = new TaskScheduler();
        // 检查是否可以执行任务
        if (!scheduler.canExecuteTasks()) {
            mainLogger.error('任务执行条件不满足');
            process.exit(1);
        }
        // 执行任务
        const result = await scheduler.executeDailyTasks();
        if (result.success) {
            mainLogger.info('每日任务执行完成');
            mainLogger.info(`执行结果: ${result.message}`);
            process.exit(0);
        }
        else {
            mainLogger.error('每日任务执行失败');
            mainLogger.error(`错误信息: ${result.message}`);
            process.exit(1);
        }
    }
    catch (error) {
        mainLogger.error('执行每日任务时发生异常:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runDailyTasks();
}
// 导出函数供其他模块调用
export { runDailyTasks };
