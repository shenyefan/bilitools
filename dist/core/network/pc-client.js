import { createRequest } from '@catlair/node-got';
import { cookieManager } from './cookie.js';
import { random } from '../utils/index.js';
/**
 * PC端网络请求客户端
 */
class PCNetworkClient {
    client;
    constructor() {
        const v1 = random(90, 122);
        const v2 = random(1500);
        const v3 = random(9);
        this.client = createRequest({
            timeout: 10000,
            headers: {
                'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v1}.0.0.0 Safari/537.36 Edg/${v1}.0.${v2}.${v3}`,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'accept-language': 'zh-CN,zh;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
            },
            requestOptions: {
                isTransformResponse: true,
                ignoreCancelToken: true,
            },
            cookieJar: cookieManager.getRawCookieJar(),
        });
    }
    /**
     * 生成二维码
     */
    async generateQRCode() {
        return this.client.get('https://passport.bilibili.com/x/passport-login/web/qrcode/generate');
    }
    /**
     * 轮询二维码状态
     * @param key 二维码key
     */
    async pollQRCode(key) {
        return this.client.get(`https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${key}`);
    }
    /**
     * 获取cookie
     */
    async getCookie() {
        try {
            return this.client.get('https://www.bilibili.com/');
        }
        catch (error) {
            return error;
        }
    }
}
export const pcNetworkClient = new PCNetworkClient();
