import { getHttpClient } from '../core/http.js';
import { loginLogger } from '../core/logger.js';
class LoginTask {
    httpClient = getHttpClient();
    userInfo = null;
    /**
     * 执行登录任务
     */
    async execute() {
        try {
            loginLogger.info('');
            loginLogger.info('coinsLogger.info("────────「开始登录」────────");');
            // 获取用户导航信息
            const navInfo = await this.getNavInfo();
            if (!navInfo.isLogin) {
                throw new Error('用户未登录，请检查Cookie是否有效');
            }
            // 获取硬币余额
            const coinBalance = await this.getCoinBalance();
            // 构建用户信息
            this.userInfo = {
                uid: navInfo.mid.toString(),
                username: navInfo.uname,
                level: navInfo.level_info.current_level,
                coins: coinBalance,
                vipType: navInfo.vipType,
                vipStatus: navInfo.vipStatus,
                isLogin: true
            };
            loginLogger.info(`登录成功！欢迎 ${this.userInfo.username}(Lv.${this.userInfo.level}), 硬币: ${this.userInfo.coins}`);
            return {
                taskType: 'loginTask',
                success: true,
                message: `登录成功，用户: ${this.userInfo.username}`,
                timestamp: Date.now()
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            loginLogger.error('登录任务失败', errorMessage);
            return {
                taskType: 'loginTask',
                success: false,
                message: errorMessage,
                timestamp: Date.now()
            };
        }
    }
    /**
     * 获取用户导航信息
     */
    async getNavInfo() {
        const response = await this.httpClient.get('https://api.bilibili.com/x/web-interface/nav');
        if (response.code !== 0) {
            throw new Error(`获取用户信息失败: ${response.message}`);
        }
        return response.data;
    }
    /**
     * 获取硬币余额
     */
    async getCoinBalance() {
        const response = await this.httpClient.get('https://account.bilibili.com/site/getCoin');
        if (response.code !== 0) {
            throw new Error(`获取硬币余额失败: ${response.message}`);
        }
        return response.data.money;
    }
    /**
     * 获取用户信息
     */
    getUserInfo() {
        return this.userInfo;
    }
    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return this.userInfo?.isLogin || false;
    }
    /**
     * 获取用户等级
     */
    getUserLevel() {
        return this.userInfo?.level || 0;
    }
    /**
     * 获取硬币数量
     */
    getCoinCount() {
        return this.userInfo?.coins || 0;
    }
    /**
     * 检查是否为VIP用户
     */
    isVip() {
        return (this.userInfo?.vipStatus || 0) === 1;
    }
}
export { LoginTask };
