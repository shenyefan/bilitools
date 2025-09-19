export interface Config {
  cookie: string;
  userAgent?: string;
  coin: CoinConfig;
  function: FunctionConfig;
  limit: LimitConfig;
  log: LogConfig;
  network: NetworkConfig;
  notification?: NotificationConfig;
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

export interface CoinConfig {
  targetCoins: number;
  targetLevel: number;
  stayCoins: number;
  retryNum: number;
  coinsPerVideo: number;
  selectLike: boolean;
  delay: number;
}

export interface FunctionConfig {
  addCoins: boolean;
  shareAndWatch: boolean;
  watchVideo: boolean;
}

export interface LimitConfig {
  level6: boolean;
  coins5: boolean;
}

export interface LogConfig {  level: 'debug' | 'info' | 'warn' | 'error';
}

export interface NetworkConfig {
  timeout: number;
  retries: number;
  delay: number;
}