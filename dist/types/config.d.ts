export interface Config {
    cookie: string;
    userAgent?: string;
    coin: CoinTaskConfig;
    shareAndWatch: ShareAndWatchTaskConfig;
    watchVideo: WatchVideoTaskConfig;
    global: GlobalTaskConfig;
    log: LogConfig;
    network: NetworkConfig;
    notification?: NotificationConfig;
}
export interface GlobalTaskConfig {
    startupDelay: number;
}
export interface CoinTaskConfig {
    enabled: boolean;
    targetCoins: number;
    targetLevel: number;
    stayCoins: number;
    retryNum: number;
    coinsPerVideo: number;
    selectLike: boolean;
    delay: number;
}
export interface ShareAndWatchTaskConfig {
    enabled: boolean;
    delay: number;
}
export interface WatchVideoTaskConfig {
    enabled: boolean;
    delay: number;
}
export interface NotificationConfig {
    wechatWork?: WechatWorkNotificationConfig;
}
export interface WechatWorkNotificationConfig {
    enabled: boolean;
    corpid: string;
    corpsecret: string;
    agentid: number;
    touser: string;
    baseUrl?: string;
}
export interface NetworkConfig {
    timeout: number;
    retries: number;
    delay: number;
}
export interface LogConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
}
