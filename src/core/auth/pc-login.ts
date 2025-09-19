import { pcNetworkClient, cookieManager } from '../network/index.js';
import { PCLoginData } from '../network/types.js';
import { printQRCode, clearScreen } from './qrcode.js';
import { authLogger } from '../logger.js';

/**
 * PC端扫码登录
 * @returns 登录结果数据或undefined
 */
export function pcLogin(): Promise<PCLoginData | undefined> {
  return new Promise<PCLoginData | undefined>(async (resolve, reject) => {
    try {
      // 生成二维码
      const { data, code, message } = await pcNetworkClient.generateQRCode();
      if (code !== 0) {
        return reject(new Error(`generateQRCode ${code}: ${message}`));
      }

      const { qrcode_key, url } = data;
      await printQRCode(url);

      let count = 0;
      const timer = setInterval(async () => {
        try {
          const pollResult = await pcNetworkClient.pollQRCode(qrcode_key);
          
          if (pollResult.code !== 0) {
            authLogger.error(`轮询失败: ${pollResult.code}: ${pollResult.message}`);
            clearInterval(timer);
            return resolve(undefined);
          }

          const { code: pollCode, message: pollMessage, refresh_token, timestamp } = pollResult.data;

          if (pollCode === 86038) {
            // 二维码已失效
            clearInterval(timer);
            authLogger.info(pollMessage);
            return resolve(undefined);
          } else if (pollCode === 86090) {
            // 二维码已扫码未确认
            authLogger.info(pollMessage);
            count++;
          } else if (pollCode === 0) {
            // 扫码成功
            clearInterval(timer);
            await pcNetworkClient.getCookie();
            const cookie = await cookieManager.getCookieString();
            const mid = +(await cookieManager.getCookie('DedeUserID') || '0');
            
            return resolve({
              refresh_token,
              timestamp,
              cookie,
              mid,
            });
          }

          // 定期刷新二维码显示
          if (count > 4) {
            clearScreen();
            count = 0;
            await printQRCode(url);
          }
          
          authLogger.info(pollMessage);
          count++;
        } catch (error: any) {
          authLogger.error('轮询过程中发生错误:', error.message);
        }
      }, 3000);
    } catch (error: any) {
      reject(error);
    }
  });
}