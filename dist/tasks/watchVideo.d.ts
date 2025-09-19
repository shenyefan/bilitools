import type { TaskResult } from '../types/user.js';
import type { FunctionConfig } from '../types/config.js';
declare class WatchVideoTask {
    private httpClient;
    private config;
    constructor(config: FunctionConfig);
    /**
     * 执行观看视频任务
     */
    execute(): Promise<TaskResult>;
    /**
     * 获取推荐视频列表
     */
    private getRecommendVideos;
    /**
     * 备用视频获取方案
     */
    private getFallbackVideos;
    /**
     * 观看单个视频
     */
    private watchSingleVideo;
    /**
     * 获取视频详细信息
     */
    private getVideoDetail;
    /**
     * 开始观看视频
     */
    private startWatch;
    /**
     * 模拟观看过程
     */
    private simulateWatching;
    /**
     * 上报观看进度
     */
    private reportWatchProgress;
    /**
     * 从Cookie中提取CSRF token
     */
    private extractCsrf;
    /**
     * 延迟函数
     */
    private delay;
}
export { WatchVideoTask };
