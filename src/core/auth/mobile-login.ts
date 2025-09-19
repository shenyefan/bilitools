import { mobileNetworkClient } from '../network/index.js';
import { LoginInfo } from '../network/types.js';
import { printQRCode, clearScreen } from './qrcode.js';
import { authLogger } from '../logger.js';

/**
 * 移动端扫码登录
 * @returns 登录信息或undefined
 */
export function mbLogin(): Promise<LoginInfo | undefined> {
  return new Promise<LoginInfo | undefined>(async (resolve, reject) => {
    try {
      // 获取授权码
      const authCodeResult = await mobileNetworkClient.getAuthCode();
      if (authCodeResult.code !== 0) {
        return reject(new Error(`getAuthCode ${authCodeResult.code}: ${authCodeResult.message}`));
      }

      const { auth_code, url } = authCodeResult.data;
      await printQRCode(url);

      let count = 0;
      const timer = setInterval(async () => {
        try {
          const pollResult = await mobileNetworkClient.pollAuthCode(auth_code);
          
          if (pollResult.code !== 0) {
            authLogger.error(`轮询失败: ${pollResult.code}: ${pollResult.message}`);
            clearInterval(timer);
            return resolve(undefined);
          }

          const { mid, access_token, refresh_token, expires_in } = pollResult.data;

          if (mid && access_token) {
            // 登录成功
            clearInterval(timer);
            
            return resolve({
              mid,
              access_token,
              refresh_token,
              expires_in,
            });
          }

          // 定期刷新二维码显示
          if (count > 4) {
            clearScreen();
            count = 0;
            await printQRCode(url);
          }
          
          authLogger.info('等待扫码...');
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