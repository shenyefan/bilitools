import * as QRCode from 'qrcode';
import { authLogger } from '../logger.js';

/**
 * 打印二维码到控制台
 * @param url 二维码URL
 */
export async function printQRCode(url: string): Promise<void> {
  try {
    const qrString = await QRCode.toString(url, { type: 'terminal' });
    authLogger.info(qrString);
    authLogger.info(url);
    authLogger.info('请使用手机扫描二维码登录');
  } catch (err: any) {
    authLogger.error('二维码生成失败:', err.message);
    authLogger.info('请使用 npm install qrcode 或其他方式安装 qrcode');
    authLogger.info('二维码URL:', url);
  }
}

/**
 * 清屏函数
 */
export function clearScreen(): void {
  authLogger.info('\x1Bc');
}