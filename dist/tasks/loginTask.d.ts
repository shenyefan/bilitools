import type { UserInfo, TaskResult } from '../types/user.js';
declare class LoginTask {
    private httpClient;
    private userInfo;
    /**
     * 执行登录任务
     */
    execute(): Promise<TaskResult>;
    /**
     * 获取用户导航信息
     */
    private getNavInfo;
    /**
     * 获取硬币余额
     */
    private getCoinBalance;
    /**
     * 获取用户信息
     */
    getUserInfo(): UserInfo | null;
    /**
     * 检查是否已登录
     */
    isLoggedIn(): boolean;
    /**
     * 获取用户等级
     */
    getUserLevel(): number;
    /**
     * 获取硬币数量
     */
    getCoinCount(): number;
    /**
     * 检查是否为VIP用户
     */
    isVip(): boolean;
}
export { LoginTask };
