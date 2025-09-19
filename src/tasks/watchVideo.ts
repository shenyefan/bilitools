import { getHttpClient } from '../core/http.js';
import type { WatchResult, TaskResult, ApiResponse } from '../types/user.js';
import type { FunctionConfig } from '../types/config.js';
import { watchLogger } from '../core/logger.js';

interface VideoInfo {
  aid: number;
  bvid: string;
  title: string;
  duration: number;
  pages: {
    cid: number;
    page: number;
    part: string;
    duration: number;
  }[];
  owner: {
    mid: number;
    name: string;
  };
}

interface RecommendResponse {
  item: VideoInfo[];
}

interface VideoDetailResponse {
  View: VideoInfo;
}

class WatchVideoTask {
  private httpClient = getHttpClient();
  private config: FunctionConfig;

  constructor(config: FunctionConfig) {
    this.config = config;
  }

  /**
   * 执行观看视频任务
   */
  public async execute(): Promise<TaskResult> {
    try {
      watchLogger.info('开始执行观看视频任务...');
      
      if (!this.config.watchVideo) {
        watchLogger.info('观看视频任务已禁用');
        return {
          taskType: 'watchVideo',
          success: true,
          message: '观看视频任务已禁用',
          timestamp: Date.now()
        };
      }

      const results: WatchResult[] = [];
      const targetCount = 3; // 观看3个视频

      // 获取推荐视频列表
      const videos = await this.getRecommendVideos(targetCount * 2);
      
      for (let i = 0; i < Math.min(targetCount, videos.length); i++) {
        const video = videos[i];
        const watchResult = await this.watchSingleVideo(video);
        results.push(watchResult);
        
        // 观看间隔
        if (i < targetCount - 1) {
          await this.delay(5000); // 5秒间隔
        }
      }

      const successCount = results.filter(r => r.success).length;
      const message = `观看视频任务完成，成功观看 ${successCount}/${targetCount} 个视频`;
      
      if (successCount > 0) {
        watchLogger.info(message);
      } else {
        watchLogger.warn(message);
      }
      
      return {
        taskType: 'watchVideo',
        success: successCount > 0,
        message,
        data: {
          results,
          successCount,
          totalCount: targetCount
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      watchLogger.error(`观看视频任务失败: ${errorMessage}`);
      
      return {
        taskType: 'watchVideo',
        success: false,
        message: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 获取推荐视频列表
   */
  private async getRecommendVideos(count: number): Promise<VideoInfo[]> {
    try {
      const response: ApiResponse<RecommendResponse> = await this.httpClient.get(
        'https://api.bilibili.com/x/web-interface/index/top/rcmd',
        {
          searchParams: {
            fresh_type: 3,
            version: 1,
            ps: count
          }
        }
      );

      if (response.code !== 0) {
        throw new Error(`获取推荐视频失败: ${response.message}`);
      }

      return response.data.item.filter(video => 
        video.duration > 60 && // 过滤掉太短的视频
        video.duration < 1800   // 过滤掉太长的视频（30分钟以上）
      );
    } catch (error) {
      watchLogger.warn('获取推荐视频失败，使用备用方案');
      return this.getFallbackVideos();
    }
  }

  /**
   * 备用视频获取方案
   */
  private async getFallbackVideos(): Promise<VideoInfo[]> {
    const response: ApiResponse<{ list: VideoInfo[] }> = await this.httpClient.get(
      'https://api.bilibili.com/x/web-interface/ranking/v2',
      {
        searchParams: {
          rid: 0,
          type: 'all'
        }
      }
    );

    if (response.code !== 0) {
      throw new Error('获取备用视频列表失败');
    }

    return response.data.list.slice(0, 6);
  }

  /**
   * 观看单个视频
   */
  private async watchSingleVideo(video: VideoInfo): Promise<WatchResult> {
    try {
      watchLogger.info(`开始观看视频: ${video.title}`);
      
      // 获取视频详细信息
      const videoDetail = await this.getVideoDetail(video.bvid);
      
      // 计算观看时长（视频时长的20-50%之间）
      const minWatchTime = Math.max(30, Math.floor(videoDetail.duration * 0.2));
      const maxWatchTime = Math.min(300, Math.floor(videoDetail.duration * 0.5)); // 最多5分钟
      const watchDuration = Math.floor(Math.random() * (maxWatchTime - minWatchTime + 1)) + minWatchTime;
      
      // 开始观看
      await this.startWatch(videoDetail);
      
      // 模拟观看过程
      const actualWatchTime = Math.min(watchDuration, 60); // 实际等待最多1分钟
      await this.simulateWatching(videoDetail, actualWatchTime);
      
      // 上报观看进度
      const success = await this.reportWatchProgress(videoDetail, watchDuration);
      
      if (success) {
        watchLogger.info(`视频观看完成`);
      } else {
        watchLogger.warn(`视频观看上报失败`);
      }
      
      return {
        aid: video.aid,
        bvid: video.bvid,
        title: video.title,
        watchDuration,
        success,
        message: success ? '观看成功' : '观看上报失败'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      watchLogger.error(`观看视频异常 - ${errorMessage}`);
      
      return {
        aid: video.aid,
        bvid: video.bvid,
        title: video.title,
        watchDuration: 0,
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * 获取视频详细信息
   */
  private async getVideoDetail(bvid: string): Promise<VideoInfo> {
    try {
      const response: ApiResponse<VideoDetailResponse> = await this.httpClient.get(
        'https://api.bilibili.com/x/web-interface/view',
        {
          searchParams: { bvid }
        }
      );

      if (response.code !== 0) {
        throw new Error(`获取视频详情失败: ${response.message}`);
      }

      // 检查返回的数据结构
      if (!response.data || !response.data.View) {
        // 如果没有View字段，尝试直接使用data
        const videoInfo = response.data as unknown as VideoInfo;
        if (videoInfo.aid && videoInfo.bvid) {
          return videoInfo;
        }
        throw new Error('视频详情数据结构异常');
      }

      return response.data.View;
    } catch (error) {
      // 如果获取详情失败，返回一个带有默认值的VideoInfo对象
      watchLogger.warn(`获取视频详情失败: ${error instanceof Error ? error.message : '未知错误'}`);
      return {
        aid: 0,
        bvid: bvid,
        title: '未知视频',
        duration: 300, // 默认5分钟
        pages: [{ cid: 0, page: 1, part: '1', duration: 300 }],
        owner: { mid: 0, name: '未知' }
      };
    }
  }

  /**
   * 开始观看视频
   */
  private async startWatch(video: VideoInfo): Promise<void> {
    try {
      await this.httpClient.postForm(
        'https://api.bilibili.com/x/click-interface/click/web/h5',
        {
          aid: video.aid,
          cid: video.pages[0].cid,
          bvid: video.bvid,
          part: 1,
          lv: 0,
          ftime: Math.floor(Date.now() / 1000),
          stime: Math.floor(Date.now() / 1000),
          type: 3,
          sub_type: 0,
          refer_url: 'https://www.bilibili.com/',
          csrf: this.extractCsrf()
        }
      );
    } catch (error) {
      // 开始观看失败不影响主流程
      watchLogger.debug('开始观看上报失败', error);
    }
  }

  /**
   * 模拟观看过程
   */
  private async simulateWatching(video: VideoInfo, duration: number): Promise<void> {
    const steps = Math.min(5, Math.floor(duration / 10)); // 分步上报
    const stepDuration = duration / steps;
    
    for (let i = 1; i <= steps; i++) {
      await this.delay(stepDuration * 1000 / steps); // 实际等待时间缩短
      
      // 上报心跳
      try {
        await this.httpClient.postForm(
          'https://api.bilibili.com/x/click-interface/web/heartbeat',
          {
            aid: video.aid,
            bvid: video.bvid,
            cid: video.pages[0].cid,
            mid: 0,
            csrf: this.extractCsrf(),
            played_time: Math.floor(stepDuration * i),
            realtime: Math.floor(stepDuration * i),
            start_ts: Math.floor(Date.now() / 1000) - Math.floor(stepDuration * i),
            type: 3,
            dt: 2,
            play_type: 1
          }
        );
      } catch (error) {
        // 心跳失败不影响主流程
        watchLogger.debug(`心跳上报失败 (${i}/${steps})`, error);
      }
    }
  }

  /**
   * 上报观看进度
   */
  private async reportWatchProgress(video: VideoInfo, watchDuration: number): Promise<boolean> {
    try {
      const response: ApiResponse<any> = await this.httpClient.postForm(
        'https://api.bilibili.com/x/click-interface/web/heartbeat',
        {
          aid: video.aid,
          bvid: video.bvid,
          cid: video.pages[0].cid,
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

      return response.code === 0;
    } catch (error) {
      return false;
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

export { WatchVideoTask };