import type { UserInfo, TaskResult } from '../types/user.js';
interface SchedulerResult {
    success: boolean;
    message: string;
    results: TaskResult[];
    userInfo?: UserInfo;
    totalTime: number;
}
declare class TaskScheduler {
    private config;
    private configManager;
    private userInfo;
    constructor();
    /**
     * 延迟执行（随机延迟）
     */
    private delay;
    /**
     * 执行每日任务
     */
    executeDailyTasks(): Promise<SchedulerResult>;
    /**
     * 执行单个任务
     */
    private executeTask;
    /**
     * 获取用户信息
     */
    getUserInfo(): UserInfo | null;
    /**
     * 检查任务是否可以执行
     */
    canExecuteTasks(): boolean;
}
export { TaskScheduler };
