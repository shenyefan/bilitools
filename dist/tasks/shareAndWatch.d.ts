import type { TaskResult } from '../types/user.js';
import type { FunctionConfig } from '../types/config.js';
declare class ShareAndWatchTask {
    private httpClient;
    private config;
    constructor(config: FunctionConfig);
    /**
     * 执行分享观看任务
     */
    execute(): Promise<TaskResult>;
    /**
     * 获取推荐视频
     */
    private getRecommendVideo;
    /**
     * 分享视频
     */
    private shareVideo;
    /**
     * 观看视频（上报观看进度）
     */
    private watchVideo;
    /**
     * 上报心跳
     */
    private reportHeartbeat;
    /**
     * 从Cookie中提取CSRF token
     */
    private extractCsrf;
    /**
     * 延迟函数
     */
    private delay;
}
export { ShareAndWatchTask };
