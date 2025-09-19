import { CookieJar } from 'tough-cookie';
/**
 * Cookie管理器
 * 提供cookie的存储、获取和管理功能
 */
export declare class CookieManager {
    private cookieJar;
    constructor();
    /**
     * 获取所有cookie字符串
     */
    getCookieString(url?: string): Promise<string>;
    /**
     * 设置cookie
     */
    setCookie(rawCookie: string, url: string): Promise<void>;
    /**
     * 获取指定cookie
     */
    getCookie(key: string, url?: string): Promise<string | undefined>;
    /**
     * 获取原始cookieJar实例
     */
    getRawCookieJar(): CookieJar;
}
export declare const cookieManager: CookieManager;
