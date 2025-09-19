import axios from 'axios';
import { getFormattedMemoryLogs } from './logger.js';
import { Config } from '../types/config.js';
import { getConfig } from './config.js';
import { notificationLogger } from './logger.js';

/**
 * 处理日志内容，移除时间戳和日志级别
 * @param logContent 原始日志内容
 * @returns 处理后的日志内容
 */
function processLogContent(logContent: string): string {
  // 按行分割日志
  const lines = logContent.split('\n');
  // 过滤掉空行
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  // 移除每行的时间戳和日志级别
  const processedLines = nonEmptyLines.map(line => {
    // 匹配格式: "2025-09-18 18:39:08 [INFO] [NOTIFICATION] 这是一条info日志"
    const match = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[\w+\] \[\w+\] (.*)/);
    return match ? match[1] : line;
  });
  
  return processedLines.join('\n');
}

/**
 * 发送企业微信通知
 * @param title 通知标题
 * @param content 通知内容，如果为空则自动读取日志文件
 * @returns 是否发送成功
 */
interface WechatWorkNotificationConfig {
  enabled: boolean;
  corpid: string;
  corpsecret: string;
  agentid: number;
  touser: string;
  baseUrl?: string;
}

export async function sendWechatWorkNotification(title: string, content?: string): Promise<boolean> {
  const config = getConfig();
  const wechatConfig = config.notification?.wechatWork as WechatWorkNotificationConfig;

  if (!wechatConfig || !wechatConfig.enabled) {
    notificationLogger.debug('企业微信通知未启用');
    return false;
  }

  try {
    // 如果没有提供content，则从内存中获取日志
    let messageContent = content || '';
    if (!content) {
      try {
        const logContent = getFormattedMemoryLogs();
        messageContent = logContent ? processLogContent(logContent) : '暂无日志内容';
        notificationLogger.debug('成功获取内存日志内容');
      } catch (error: any) {
        messageContent = '获取日志失败';
        notificationLogger.error(`获取内存日志失败: ${error.message}`);
      }
    }

    // 获取基础URL
    const baseUrl = wechatConfig.baseUrl || 'https://qyapi.weixin.qq.com';
    
    // 获取访问令牌
    const tokenResponse = await axios.get(
      `${baseUrl}/cgi-bin/gettoken?corpid=${wechatConfig.corpid}&corpsecret=${wechatConfig.corpsecret}`
    );

    if (tokenResponse.data.errcode !== 0) {
      notificationLogger.error(`获取企业微信访问令牌失败: ${tokenResponse.data.errmsg}`);
      return false;
    }

    const accessToken = tokenResponse.data.access_token;

    // 构建完整的消息内容：标题 + 换行 + 日志内容
    const fullContent = messageContent ? `${title}\n${messageContent}` : title;

    // 发送消息
    const messageResponse = await axios.post(
      `${baseUrl}/cgi-bin/message/send?access_token=${accessToken}`,
      {
        touser: wechatConfig.touser,
        msgtype: 'text',
        agentid: wechatConfig.agentid,
        text: {
          content: fullContent
        }
      }
    );

    if (messageResponse.data.errcode !== 0) {
      notificationLogger.error(`发送企业微信通知失败: ${messageResponse.data.errmsg}`);
      return false;
    }

    notificationLogger.info('企业微信通知发送成功');
    return true;
  } catch (error: any) {
    notificationLogger.error(`发送企业微信通知出错: ${error.message || '未知错误'}`);
    return false;
  }
}