/**
 * Cookie转换为access_token
 * @param cookie Cookie字符串
 * @returns access_token或undefined
 */
export declare function cookieToToken(cookie: string): Promise<string | undefined>;
/**
 * access_token转换为Cookie
 * @param accessToken access_token
 * @returns Cookie字符串或undefined
 */
export declare function tokenToCookie(accessToken: string): Promise<string | undefined>;
