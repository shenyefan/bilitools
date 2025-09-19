#!/usr/bin/env node
/**
 * 执行每日任务的独立入口文件
 * 适用于青龙面板、云函数等环境
 */
declare function runDailyTasks(): Promise<void>;
export { runDailyTasks };
