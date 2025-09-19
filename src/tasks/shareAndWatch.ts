import { getHttpClient } from '../core/http.js';
import type { TaskResult, ApiResponse } from '../types/user.js';
import type { FunctionConfig } from '../types/config.js';
import { shareLogger } from '../core/logger.js';

interface VideoInfo {
  aid: number;
  bvid: string;
  title: string;
  duration: number;
  owner: {
    mid: number;
    name: string;
  };
}

interface RankingResponse {
  list: VideoInfo[];
}

interface ShareResponse {
  code: number;
  message: string;
}

class ShareAndWatchTask {
  private httpClient = getHttpClient();
  private config: FunctionConfig;

  constructor(config: FunctionConfig) {
    this.config = config;
  }

  /**
   * 执行分享观看任务
   */
  public async execute(): Promise<TaskResult> {
    try {
      shareLogger.info('开始执行分享观看任务...');
      
      if (!this.config.shareAndWatch) {
        shareLogger.info('分享观看任务已禁用');
        return {
          taskType: 'shareAndWatch',
          success: true,
          message: '分享观看任务已禁用',
          timestamp: Date.now()
        };
      }

      // 获取推荐视频
      const video = await this.getRecommendVideo();
      
      // 执行分享任务
      const shareResult = await this.shareVideo(video);
      
      // 执行观看任务
      const watchResult = await this.watchVideo(video);

      const success = shareResult && watchResult;
      const message = success 
        ? `分享观看任务完成: ${video.title}`
        : '分享观看任务部分失败';
      
      if (success) {
        shareLogger.info(message);
      } else {
        shareLogger.warn(message);
      }
      
      return {
        taskType: 'shareAndWatch',
        success,
        message,
        data: {
          video: {
            aid: video.aid,
            bvid: video.bvid,
            title: video.title
          },
          shareResult,
          watchResult
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      shareLogger.error(`分享观看任务失败: ${errorMessage}`);
      
      return {
        taskType: 'shareAndWatch',
        success: false,
        message: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 获取推荐视频
   */
  private async getRecommendVideo(): Promise<VideoInfo> {
    // 先尝试获取热门视频
    try {
      const response: ApiResponse<RankingResponse> = await this.httpClient.get(
        'https://api.bilibili.com/x/web-interface/ranking/v2',
        {
          searchParams: {
            rid: 0,
            type: 'all'
          }
        }
      );

      if (response.code === 0 && response.data.list.length > 0) {
        // 随机选择一个视频
        const randomIndex = Math.floor(Math.random() * Math.min(10, response.data.list.length));
        return response.data.list[randomIndex];
      }
    } catch (error) {
      shareLogger.warn('获取热门视频失败，尝试获取推荐视频');
    }

    // 如果热门视频获取失败，尝试获取推荐视频
    const recommendResponse: ApiResponse<{ item: VideoInfo[] }> = await this.httpClient.get(
      'https://api.bilibili.com/x/web-interface/index/top/rcmd',
      {
        searchParams: {
          fresh_type: 3,
          version: 1,
          ps: 10
        }
      }
    );

    if (recommendResponse.code !== 0 || !recommendResponse.data.item.length) {
      throw new Error('获取推荐视频失败');
    }

    return recommendResponse.data.item[0];
  }

  /**
   * 分享视频
   */
  private async shareVideo(video: VideoInfo): Promise<boolean> {
    try {
      shareLogger.info(`正在分享视频: ${video.title}`);
      
      const response: ApiResponse<ShareResponse> = await this.httpClient.postForm(
        'https://api.bilibili.com/x/web-interface/share/add',
        {
          aid: video.aid,
          csrf: this.extractCsrf()
        }
      );

      if (response.code === 0) {
        shareLogger.info(`视频分享成功`);
        return true;
      } else {
        shareLogger.warn(`视频分享失败 - ${response.message}`);
        return false;
      }
    } catch (error) {
      shareLogger.error(`视频分享异常`, error);
      return false;
    }
  }

  /**
   * 观看视频（上报观看进度）
   */
  private async watchVideo(video: VideoInfo): Promise<boolean> {
    try {
      shareLogger.info(`正在观看视频: ${video.title}`);
      
      // 计算观看时长（视频时长的30%或最少15秒）
      const watchDuration = Math.max(15, Math.floor(video.duration * 0.3));
      
      // 上报观看开始
      await this.reportHeartbeat(video, 0);
      
      // 模拟观看过程
      await this.delay(Math.min(watchDuration * 1000, 30000)); // 最多等待30秒
      
      // 上报观看进度
      const response: ApiResponse<any> = await this.httpClient.postForm(
        'https://api.bilibili.com/x/click-interface/web/heartbeat',
        {
          aid: video.aid,
          bvid: video.bvid,
          mid: 0,
          csrf: this.extractCsrf(),
          played_time: watchDuration,
          realtime: watchDuration,
          start_ts: Math.floor(Date.now() / 1000) - watchDuration,
          type: 3,
          dt: 2,
          play_type: 1
        }
      );

      if (response.code === 0) {
        shareLogger.info(`视频观看完成: ${video.title}`);
        return true;
      } else {
        shareLogger.warn(`视频观看上报失败: ${video.title} - ${response.message}`);
        return false;
      }
    } catch (error) {
      shareLogger.error(`视频观看异常: ${video.title}`, error);
      return false;
    }
  }

  /**
   * 上报心跳
   */
  private async reportHeartbeat(video: VideoInfo, playedTime: number): Promise<void> {
    try {
      await this.httpClient.postForm(
        'https://api.bilibili.com/x/click-interface/web/heartbeat',
        {
          aid: video.aid,
          bvid: video.bvid,
          mid: 0,
          csrf: this.extractCsrf(),
          played_time: playedTime,
          realtime: playedTime,
          start_ts: Math.floor(Date.now() / 1000),
          type: 3,
          dt: 2,
          play_type: 1
        }
      );
    } catch (error) {
      // 心跳上报失败不影响主流程
      shareLogger.debug('心跳上报失败', error);
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
}

export { ShareAndWatchTask };