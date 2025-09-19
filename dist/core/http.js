import got from 'got';
import { httpLogger } from './logger.js';
class HttpClient {
    client;
    config;
    cookie;
    userAgent;
    constructor(config) {
        this.config = config.network;
        this.cookie = config.cookie;
        this.userAgent = config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        // 创建got实例
        this.client = got.extend({
            timeout: {
                request: this.config.timeout
            },
            retry: {
                limit: this.config.retries,
                methods: ['GET', 'POST'],
                statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524]
            },
            headers: {
                'User-Agent': this.userAgent,
                'Cookie': this.cookie,
                'Referer': 'https://www.bilibili.com/',
                'Origin': 'https://www.bilibili.com'
            },
            hooks: {
                beforeRequest: [
                    (options) => {
                        httpLogger.debug(`请求: ${options.method} ${options.url}`);
                    }
                ],
                afterResponse: [
                    (response) => {
                        httpLogger.debug(`响应: ${response.statusCode} ${response.url}`);
                        return response;
                    }
                ],
                beforeError: [
                    (error) => {
                        httpLogger.error(`请求错误: ${error.message}`, error);
                        return error;
                    }
                ]
            }
        });
    }
    /**
     * GET请求
     */
    async get(url, options) {
        try {
            await this.delay();
            const response = await this.client.get(url, options);
            return JSON.parse(response.body);
        }
        catch (error) {
            httpLogger.error(`GET请求失败: ${url}`, error);
            throw error;
        }
    }
    /**
     * POST请求
     */
    async post(url, data, options) {
        try {
            await this.delay();
            const response = await this.client.post(url, {
                ...options,
                json: data,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers
                }
            });
            return JSON.parse(response.body);
        }
        catch (error) {
            httpLogger.error(`POST请求失败: ${url}`, error);
            throw error;
        }
    }
    /**
     * POST表单请求
     */
    async postForm(url, data, options) {
        try {
            await this.delay();
            const response = await this.client.post(url, {
                ...options,
                form: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    ...options?.headers
                }
            });
            return JSON.parse(response.body);
        }
        catch (error) {
            httpLogger.error(`POST表单请求失败: ${url}`, error);
            throw error;
        }
    }
    /**
     * 请求延迟
     */
    async delay() {
        if (this.config.delay > 0) {
            const randomDelay = Math.floor(Math.random() * this.config.delay * 1000);
            await new Promise(resolve => setTimeout(resolve, randomDelay));
        }
    }
    /**
     * 更新Cookie
     */
    updateCookie(cookie) {
        this.cookie = cookie;
        this.client = this.client.extend({
            headers: {
                'Cookie': cookie
            }
        });
    }
    /**
     * 获取当前Cookie
     */
    getCookie() {
        return this.cookie;
    }
}
// 全局HTTP客户端实例
let httpClient;
export function initHttpClient(config) {
    httpClient = new HttpClient(config);
    return httpClient;
}
export function getHttpClient() {
    if (!httpClient) {
        throw new Error('HttpClient not initialized. Call initHttpClient first.');
    }
    return httpClient;
}
export { HttpClient };
