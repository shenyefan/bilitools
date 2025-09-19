import type { TaskResult } from '../types/user.js';
import type { CoinConfig } from '../types/config.js';
declare class AddCoinsTask {
    private httpClient;
    private config;
    constructor(config: CoinConfig);
    /**
     * 执行投币任务
     */
    execute(): Promise<TaskResult>;
    /**
     * 获取热门视频列表
     */
    private getHotVideos;
    /**
     * 给视频投币
     */
    private coinToVideo;
    /**
     * 从Cookie中提取CSRF token
     */
    private extractCsrf;
    /**
     * 延迟函数
     */
    private delay;
    /**
     * 获取今日已投币数量
     */
    getTodayCoins(): Promise<number>;
}
export { AddCoinsTask };
