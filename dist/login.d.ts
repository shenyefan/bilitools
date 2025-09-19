#!/usr/bin/env node
/**
 * 检查登录状态的独立入口文件
 * 适用于青龙面板、云函数等环境
 */
declare function checkLoginStatus(): Promise<void>;
export { checkLoginStatus };
