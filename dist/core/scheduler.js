import { getConfig } from './config.js';
import { sendWechatWorkNotification } from './notification.js';
import { LoginTask } from '../tasks/loginTask.js';
import { AddCoinsTask } from '../tasks/addCoins.js';
import { ShareAndWatchTask } from '../tasks/shareAndWatch.js';
import { WatchVideoTask } from '../tasks/watchVideo.js';
import { schedulerLogger } from './logger.js';
class TaskScheduler {
    config;
    userInfo = null;
    constructor() {
        this.config = getConfig();
    }
    /**
     * 执行每日任务
     */
    async executeDailyTasks() {
        const startTime = Date.now();
        const results = [];
        try {
            schedulerLogger.info('');
            schedulerLogger.info('coinsLogger.info("────────「开始执行」────────");');
            // 1. 执行登录任务
            const loginTask = new LoginTask();
            const loginResult = await this.executeTask('登录验证', () => loginTask.execute());
            results.push(loginResult);
            if (!loginResult.success) {
                throw new Error('登录失败，无法继续执行后续任务');
            }
            this.userInfo = loginTask.getUserInfo();
            // 2. 执行投币任务
            if (this.config.function.addCoins) {
                const addCoinsTask = new AddCoinsTask(this.config.coin);
                const coinResult = await this.executeTask('投币任务', () => addCoinsTask.execute());
                results.push(coinResult);
            }
            else {
                schedulerLogger.info('投币任务已禁用，跳过执行');
            }
            // 3. 执行分享观看任务
            if (this.config.function.shareAndWatch) {
                const shareWatchTask = new ShareAndWatchTask(this.config.function);
                const shareResult = await this.executeTask('分享观看任务', () => shareWatchTask.execute());
                results.push(shareResult);
            }
            else {
                schedulerLogger.info('分享观看任务已禁用，跳过执行');
            }
            // 4. 执行观看视频任务
            if (this.config.function.watchVideo) {
                const watchVideoTask = new WatchVideoTask(this.config.function);
                const watchResult = await this.executeTask('观看视频任务', () => watchVideoTask.execute());
                results.push(watchResult);
            }
            else {
                schedulerLogger.info('观看视频任务已禁用，跳过执行');
            }
            const totalTime = Date.now() - startTime;
            const successCount = results.filter(r => r.success).length;
            const totalCount = results.length;
            schedulerLogger.info(`执行完成！成功: ${successCount}/${totalCount}, 耗时: ${Math.round(totalTime / 1000)}秒`);
            // 发送企业微信通知
            const notificationTitle = `BiliTools`;
            // 直接发送通知，内容将自动从日志文件中读取
            await sendWechatWorkNotification(notificationTitle);
            return {
                success: successCount > 0,
                message: `任务执行完成，成功: ${successCount}/${totalCount}`,
                results,
                userInfo: this.userInfo || undefined,
                totalTime
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            const totalTime = Date.now() - startTime;
            schedulerLogger.error(`任务执行失败: ${errorMessage}`);
            return {
                success: false,
                message: errorMessage,
                results,
                totalTime
            };
        }
    }
    /**
     * 执行单个任务
     */
    async executeTask(taskName, taskFn) {
        try {
            const startTime = Date.now();
            const result = await taskFn();
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            schedulerLogger.error(`执行异常`, new Error(errorMessage), { task: taskName });
            return {
                taskType: taskName,
                success: false,
                message: errorMessage,
                timestamp: Date.now()
            };
        }
    }
    /**
     * 获取用户信息
     */
    getUserInfo() {
        return this.userInfo;
    }
    /**
     * 检查任务是否可以执行
     */
    canExecuteTasks() {
        try {
            // 检查配置是否有效
            if (!this.config.cookie) {
                schedulerLogger.error('Cookie未配置，无法执行任务');
                return false;
            }
            // 检查是否有启用的任务
            const hasEnabledTasks = this.config.function.addCoins ||
                this.config.function.shareAndWatch ||
                this.config.function.watchVideo;
            if (!hasEnabledTasks) {
                schedulerLogger.warn('所有任务都已禁用');
                return false;
            }
            return true;
        }
        catch (error) {
            schedulerLogger.error('检查任务执行条件失败', error);
            return false;
        }
    }
}
export { TaskScheduler };
