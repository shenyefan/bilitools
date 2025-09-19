import { cookieManager, mobileNetworkClient } from '../network/index.js';
import { authLogger } from '../logger.js';
/**
 * Cookie转换为access_token
 * @param cookie Cookie字符串
 * @returns access_token或undefined
 */
export async function cookieToToken(cookie) {
    try {
        // 设置cookie
        await cookieManager.setCookie(cookie, 'https://passport.bilibili.com');
        // 获取应用签名
        return mobileNetworkClient.getAppSign({});
    }
    catch (error) {
        authLogger.error('Cookie转换失败:', error.message);
        return undefined;
    }
}
/**
 * access_token转换为Cookie
 * @param accessToken access_token
 * @returns Cookie字符串或undefined
 */
export async function tokenToCookie(accessToken) {
    try {
        // 使用access_token确认二维码
        const confirmResult = await mobileNetworkClient.confirmQrcode(accessToken, '', '');
        if (confirmResult.code !== 0) {
            authLogger.error(`Token转Cookie失败: ${confirmResult.code}: ${confirmResult.message}`);
            return undefined;
        }
        // 获取cookie
        const cookieString = await cookieManager.getCookieString();
        return cookieString;
    }
    catch (error) {
        authLogger.error('Token转换失败:', error.message);
        return undefined;
    }
}
