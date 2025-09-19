import { CookieJar } from 'tough-cookie';
/**
 * Cookie管理器
 * 提供cookie的存储、获取和管理功能
 */
export class CookieManager {
    cookieJar;
    constructor() {
        this.cookieJar = new CookieJar();
    }
    /**
     * 获取所有cookie字符串
     */
    async getCookieString(url = 'https://bilibili.com') {
        return await this.cookieJar.getCookieString(url);
    }
    /**
     * 设置cookie
     */
    async setCookie(rawCookie, url) {
        await this.cookieJar.setCookie(rawCookie, url);
    }
    /**
     * 获取指定cookie
     */
    async getCookie(key, url = 'https://bilibili.com') {
        const cookies = await this.cookieJar.getCookies(url);
        const cookie = cookies.find(c => c.key === key);
        return cookie?.value;
    }
    /**
     * 获取原始cookieJar实例
     */
    getRawCookieJar() {
        return this.cookieJar;
    }
}
// 全局cookie管理器实例
export const cookieManager = new CookieManager();
