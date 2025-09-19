import { OptionsOfJSONResponseBody } from 'got';
import type { Config } from '../types/config.js';
import type { ApiResponse } from '../types/user.js';
declare class HttpClient {
    private client;
    private config;
    private cookie;
    private userAgent;
    constructor(config: Config);
    /**
     * GET请求
     */
    get<T = any>(url: string, options?: OptionsOfJSONResponseBody): Promise<ApiResponse<T>>;
    /**
     * POST请求
     */
    post<T = any>(url: string, data?: any, options?: OptionsOfJSONResponseBody): Promise<ApiResponse<T>>;
    /**
     * POST表单请求
     */
    postForm<T = any>(url: string, data?: any, options?: OptionsOfJSONResponseBody): Promise<ApiResponse<T>>;
    /**
     * 请求延迟
     */
    private delay;
    /**
     * 更新Cookie
     */
    updateCookie(cookie: string): void;
    /**
     * 获取当前Cookie
     */
    getCookie(): string;
}
export declare function initHttpClient(config: Config): HttpClient;
export declare function getHttpClient(): HttpClient;
export { HttpClient };
