import { getHttpClient } from '../core/http.js';
import type { UserInfo, TaskResult, ApiResponse } from '../types/user.js';
import { loginLogger } from '../core/logger.js';

interface NavResponse {
  isLogin: boolean;
  uname: string;
  mid: number;
  level_info: {
    current_level: number;
    current_min: number;
    current_exp: number;
    next_exp: number;
  };
  vipType: number;
  vipStatus: number;
}

interface CoinResponse {
  money: number;
}

class LoginTask {
  private httpClient = getHttpClient();
  private userInfo: UserInfo | null = null;

  /**
   * 执行登录任务
   */
  public async execute(): Promise<TaskResult> {
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
    } catch (error) {
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
  private async getNavInfo(): Promise<NavResponse> {
    const response: ApiResponse<NavResponse> = await this.httpClient.get(
      'https://api.bilibili.com/x/web-interface/nav'
    );

    if (response.code !== 0) {
      throw new Error(`获取用户信息失败: ${response.message}`);
    }

    return response.data;
  }

  /**
   * 获取硬币余额
   */
  private async getCoinBalance(): Promise<number> {
    const response: ApiResponse<CoinResponse> = await this.httpClient.get(
      'https://account.bilibili.com/site/getCoin'
    );

    if (response.code !== 0) {
      throw new Error(`获取硬币余额失败: ${response.message}`);
    }

    return response.data.money;
  }

  /**
   * 获取用户信息
   */
  public getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  /**
   * 检查是否已登录
   */
  public isLoggedIn(): boolean {
    return this.userInfo?.isLogin || false;
  }

  /**
   * 获取用户等级
   */
  public getUserLevel(): number {
    return this.userInfo?.level || 0;
  }

  /**
   * 获取硬币数量
   */
  public getCoinCount(): number {
    return this.userInfo?.coins || 0;
  }

  /**
   * 检查是否为VIP用户
   */
  public isVip(): boolean {
    return (this.userInfo?.vipStatus || 0) === 1;
  }
}

export { LoginTask };