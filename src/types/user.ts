export interface UserInfo {
  uid: string;
  username: string;
  level: number;
  coins: number;
  vipType: number;
  vipStatus: number;
  isLogin: boolean;
}

export interface TaskResult {
  taskType: string;
  success: boolean;
  message: string;
  timestamp: number;
  data?: any;
}

export interface CoinResult {
  aid: number;
  bvid?: string;
  title?: string;
  coins: number;
  success: boolean;
  message?: string;
}

export interface WatchResult {
  aid: number;
  bvid?: string;
  title: string;
  watchDuration: number;
  success: boolean;
  message?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}