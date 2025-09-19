import { getHttpClient } from '../core/http.js';
import type { CoinResult, TaskResult, ApiResponse } from '../types/user.js';
import type { CoinConfig } from '../types/config.js';
import { coinsLogger } from '../core/logger.js';

interface VideoInfo {
  aid: number;
  bvid: string;
  title: string;
  owner: {
    mid: number;
    name: string;
  };
  stat: {
    coin: number;
    like: number;
    view: number;
  };
}

interface RankingResponse {
  list: VideoInfo[];
}

interface CoinResponse {
  like: boolean;
}

class AddCoinsTask {
  private httpClient = getHttpClient();
  private config: CoinConfig;

  constructor(config: CoinConfig) {
    this.config = config;
  }

  /**
   * 执行投币任务
   */
  public async execute(): Promise<TaskResult> {
    try {
      coinsLogger.info('');
      coinsLogger.info('────「投币任务」────');
      coinsLogger.debug(`投币配置: targetCoins=${this.config.targetCoins}, coinsPerVideo=${this.config.coinsPerVideo}`);
      
      const results: CoinResult[] = [];
      let totalCoins = 0;

      // 获取热门视频列表
      const videos = await this.getHotVideos();
      coinsLogger.debug(`获取到 ${videos.length} 个候选视频`);
      
      for (const video of videos) {
        if (totalCoins >= this.config.targetCoins) {
          coinsLogger.debug(`已达到目标投币数 ${this.config.targetCoins}，停止投币`);
          break;
        }

        coinsLogger.debug(`尝试给视频投币: ${video.title} (aid: ${video.aid})`);
        const coinResult = await this.coinToVideo(video);
        results.push(coinResult);
        
        if (coinResult.success) {
          totalCoins += coinResult.coins;
          coinsLogger.debug(`投币成功，当前总投币数: ${totalCoins}/${this.config.targetCoins}`);
        } else {
          coinsLogger.debug(`投币失败: ${coinResult.message}`);
        }

        // 投币间隔
        if (this.config.delay > 0) {
          coinsLogger.debug(`等待 ${this.config.delay}ms 后继续下一个视频`);
          await this.delay(this.config.delay);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const message = `投币任务完成，成功投币 ${successCount} 个视频，共 ${totalCoins} 枚硬币`;
      
      coinsLogger.info(message);
      
      return {
        taskType: 'addCoins',
        success: true,
        message,
        data: {
          results,
          totalCoins,
          successCount
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      coinsLogger.error('投币任务失败', new Error(errorMessage));
      
      return {
        taskType: 'addCoins',
        success: false,
        message: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 获取热门视频列表
   */
  private async getHotVideos(): Promise<VideoInfo[]> {
    coinsLogger.debug('正在获取热门视频列表...');
    
    const response: ApiResponse<RankingResponse> = await this.httpClient.get(
      'https://api.bilibili.com/x/web-interface/ranking/v2',
      {
        searchParams: {
          rid: 0,
          type: 'all'
        }
      }
    );

    coinsLogger.debug(`API响应: code=${response.code}, message=${response.message}`);
    
    if (response.code !== 0) {
      throw new Error(`获取热门视频失败: ${response.message}`);
    }

    const totalVideos = response.data.list.length;
    
    // 随机选择视频进行投币
    const allVideos = response.data.list;
    
    // 随机打乱视频列表
    const shuffledVideos = allVideos.sort(() => Math.random() - 0.5);
    
    // 选择足够的候选视频（目标投币数的2倍，确保有足够的备选）
    const candidateVideos = shuffledVideos.slice(0, this.config.targetCoins * 2);
    
    return candidateVideos;
  }

  /**
   * 给视频投币
   */
  private async coinToVideo(video: VideoInfo): Promise<CoinResult> {
    try {
      coinsLogger.info(`正在给视频投币: ${video.title}`);
      
      const csrf = this.extractCsrf();
      const coinParams = {
        aid: video.aid,
        multiply: this.config.coinsPerVideo,
        select_like: this.config.selectLike ? 1 : 0,
        cross_domain: true,
        csrf: csrf
      };
      
      coinsLogger.debug(`投币参数: aid=${video.aid}, multiply=${this.config.coinsPerVideo}, csrf=${csrf ? '已获取' : '未获取'}`);
      
      const response: ApiResponse<CoinResponse> = await this.httpClient.postForm(
        'https://api.bilibili.com/x/web-interface/coin/add',
        coinParams
      );

      if (response.code === 0) {
        coinsLogger.info(`投币成功: ${video.title}, 投币数量: ${this.config.coinsPerVideo}`);
        return {
          aid: video.aid,
          bvid: video.bvid,
          title: video.title,
          coins: this.config.coinsPerVideo,
          success: true,
          message: '投币成功'
        };
      } else {
        coinsLogger.error(`投币失败: ${video.title} - ${response.message}`);
        return {
          aid: video.aid,
          bvid: video.bvid,
          title: video.title,
          coins: 0,
          success: false,
          message: response.message
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      coinsLogger.error(`投币异常: ${video.title}`, error instanceof Error ? error : new Error(errorMessage));
      
      return {
        aid: video.aid,
        bvid: video.bvid,
        title: video.title,
        coins: 0,
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * 从Cookie中提取CSRF token
   */
  private extractCsrf(): string {
    const cookie = this.httpClient.getCookie();
    const match = cookie.match(/bili_jct=([^;]+)/);
    return match ? match[1] : '';
  }

  /**
   * 延迟函数
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取今日已投币数量
   */
  public async getTodayCoins(): Promise<number> {
    try {
      const response: ApiResponse<{ coins: number }> = await this.httpClient.get(
        'https://api.bilibili.com/x/web-interface/coin/today/exp'
      );

      if (response.code === 0) {
        return Math.floor(response.data.coins / 10); // 经验值除以10得到投币数
      }
      return 0;
    } catch (error) {
      coinsLogger.error('获取今日投币数失败', error);
      return 0;
    }
  }
}

export { AddCoinsTask };