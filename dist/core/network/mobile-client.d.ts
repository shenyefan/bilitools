import { BaseResponse, AuthCodeData, LoginInfo } from './types.js';
/**
 * 移动端网络请求客户端
 */
declare class MobileNetworkClient {
    private client;
    private build;
    constructor();
    /**
     * 创建随机移动端UA
     */
    private createRandomMobileUA;
    /**
     * 获取应用签名
     */
    getAppSign(params: Record<string, string | boolean | number | Array<any>>, appkey?: string, appsec?: string): string;
    /**
     * 获取授权码
     */
    getAuthCode(appkey?: string, appsec?: string): Promise<BaseResponse<AuthCodeData>>;
    /**
     * 轮询登录状态
     */
    getPoll(authCode: string, appkey: string, appsec: string): Promise<BaseResponse<LoginInfo>>;
    /**
     * 获取随机UA
     */
    private getRandomUA;
    /**
     * 轮询授权码状态
     */
    pollAuthCode(auth_code: string): Promise<BaseResponse<LoginInfo>>;
    /**
     * 确认二维码
     */
    confirmQrcode(access_token: string, auth_code: string, csrf: string, scanning_type?: number): Promise<BaseResponse<any>>;
}
export declare const mobileNetworkClient: MobileNetworkClient;
export {};
