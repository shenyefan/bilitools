#!/usr/bin/env node
import { loadConfig } from './core/config.js';
import { LoginTask } from './tasks/loginTask.js';
import { initHttpClient } from './core/http.js';
import { mainLogger } from './core/logger.js';
import { pcLogin } from './core/auth/pc-login.js';
import { fileURLToPath } from 'url';
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
        const config = loadConfig(process.env.CONFIG_PATH);
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
                // 输出JSON格式的用户信息，便于其他程序解析
                console.log('USER_INFO:', JSON.stringify({
                    username: userInfo.username,
                    level: userInfo.level,
                    coins: userInfo.coins,
                    vipStatus: userInfo.vipStatus,
                    loginStatus: 'success'
                }));
            }
            process.exit(0);
        }
        else {
            mainLogger.error('登录状态: 未登录');
            mainLogger.error(`错误信息: ${result.message}`);
            // 启动扫码登录流程
            mainLogger.info('检测到未登录，正在启动扫码登录...');
            try {
                const loginData = await pcLogin();
                if (loginData) {
                    mainLogger.info('扫码登录成功！');
                    mainLogger.info(`用户ID: ${loginData.mid}`);
                    // 重新初始化HTTP客户端以使用新的cookie
                    initHttpClient(config);
                    // 重新执行登录检查
                    const newLoginTask = new LoginTask();
                    const newResult = await newLoginTask.execute();
                    if (newResult.success) {
                        const newUserInfo = newLoginTask.getUserInfo();
                        mainLogger.info('登录验证成功！');
                        if (newUserInfo) {
                            mainLogger.info(`用户名: ${newUserInfo.username}`);
                            mainLogger.info(`等级: ${newUserInfo.level}`);
                            mainLogger.info(`硬币: ${newUserInfo.coins}`);
                            mainLogger.info(`VIP状态: ${newUserInfo.vipStatus === 1 ? '是' : '否'}`);
                            // 输出JSON格式的用户信息
                            console.log('USER_INFO:', JSON.stringify({
                                username: newUserInfo.username,
                                level: newUserInfo.level,
                                coins: newUserInfo.coins,
                                vipStatus: newUserInfo.vipStatus,
                                loginStatus: 'success',
                                loginMethod: 'qrcode'
                            }));
                        }
                        process.exit(0);
                    }
                    else {
                        mainLogger.error('登录验证失败:', newResult.message);
                        console.log('USER_INFO:', JSON.stringify({
                            loginStatus: 'failed',
                            error: '扫码登录后验证失败: ' + newResult.message,
                            loginMethod: 'qrcode'
                        }));
                        process.exit(1);
                    }
                }
                else {
                    mainLogger.error('扫码登录失败或被取消');
                    console.log('USER_INFO:', JSON.stringify({
                        loginStatus: 'failed',
                        error: '扫码登录失败或被取消',
                        loginMethod: 'qrcode'
                    }));
                    process.exit(1);
                }
            }
            catch (qrError) {
                const qrErrorMessage = qrError instanceof Error ? qrError.message : '扫码登录过程中发生未知错误';
                mainLogger.error('扫码登录过程中发生错误:', qrErrorMessage);
                console.log('USER_INFO:', JSON.stringify({
                    loginStatus: 'failed',
                    error: '扫码登录错误: ' + qrErrorMessage,
                    loginMethod: 'qrcode'
                }));
                process.exit(1);
            }
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        mainLogger.error('检查登录状态时发生异常:', errorMessage);
        // 输出JSON格式的异常信息
        console.log('USER_INFO:', JSON.stringify({
            loginStatus: 'error',
            error: errorMessage
        }));
        process.exit(1);
    }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    checkLoginStatus();
}
// 导出函数供其他模块调用
export { checkLoginStatus };
