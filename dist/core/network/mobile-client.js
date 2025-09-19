import { createRequest } from '@catlair/node-got';
import { cookieManager } from './cookie.js';
import { random, generateBuvid, getSign, getUnixTime } from '../utils/index.js';
/**
 * 移动端网络请求客户端
 */
class MobileNetworkClient {
    client;
    build;
    constructor() {
        const v1 = 7;
        const v2 = random(50, 80);
        const v3 = random(0, 9);
        this.build = `${v1}${v2}0${v3}00`;
        this.client = createRequest({
            timeout: 10000,
            headers: {
                'user-agent': this.createRandomMobileUA(),
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
     * 创建随机移动端UA
     */
    createRandomMobileUA() {
        const channels = [
            '360', 'baidu', 'xiaomi', 'meizu', 'oppo', 'vivo', 'coolpad',
            'lenovo', 'samsung', 'gionee', 'smartisan', 'oneplus', 'zte',
            'nubia', 'sony', 'htc', 'asus', 'alps', 'lg', 'google',
        ];
        const modelRandom = random(6, 13);
        const xiaomiModels = [
            `MI ${modelRandom}`,
            `MI ${modelRandom} X`,
            `MI ${modelRandom} SE`,
            `MI ${modelRandom} Pro`,
            `MI ${modelRandom} Lite`,
            `MI ${modelRandom} Youth`,
        ];
        const osVer = random(7, 13);
        const v1 = 7;
        const v2 = random(50, 80);
        return `Mozilla/5.0 BiliDroid/${v1}.${v2}.0 (bbcallen@gmail.com) os/android model/${xiaomiModels[random(xiaomiModels.length - 1)]} mobi_app/android build/${this.build} channel/${channels[random(channels.length - 1)]} innerVer/xiaomi osVer/${osVer} network/2`;
    }
    /**
     * 获取应用签名
     */
    getAppSign(params, appkey = '783bbb7264451d82', appsec = '2653583c8873dea268ab9386918b1d65') {
        return getSign({
            platform: 'android',
            mobi_app: 'android',
            disable_rcmd: 0,
            build: this.build,
            c_locale: 'zh_CN',
            s_locale: 'zh_CN',
            ts: getUnixTime(),
            local_id: 0,
            actionKey: 'appkey',
            appkey,
            ...params,
        }, appsec);
    }
    /**
     * 获取授权码
     */
    async getAuthCode(appkey = '783bbb7264451d82', appsec = '2653583c8873dea268ab9386918b1d65') {
        return this.client.post('https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code', this.getAppSign({}, appkey, appsec));
    }
    /**
     * 轮询登录状态
     */
    async getPoll(authCode, appkey, appsec) {
        return this.client.post('https://passport.bilibili.com/x/passport-tv-login/qrcode/poll', this.getAppSign({ auth_code: authCode }, appkey, appsec));
    }
    /**
     * 获取随机UA
     */
    getRandomUA() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }
    /**
     * 轮询授权码状态
     */
    async pollAuthCode(auth_code) {
        const params = {
            auth_code,
            local_id: generateBuvid(),
        };
        return this.client.post('https://passport.bilibili.com/x/passport-tv-login/qrcode/poll', {
            form: getSign(params, '59b43e04ad6965f34319062b478f83dd'),
            headers: {
                'User-Agent': this.getRandomUA(),
            },
        });
    }
    /**
     * 确认二维码
     */
    async confirmQrcode(access_token, auth_code, csrf, scanning_type = 3) {
        const params = {
            access_token,
            auth_code,
            csrf,
            scanning_type,
        };
        return this.client.post('https://passport.bilibili.com/x/passport-tv-login/h5/qrcode/confirm', {
            form: params,
        });
    }
}
export const mobileNetworkClient = new MobileNetworkClient();
