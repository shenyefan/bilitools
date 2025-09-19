import { BaseResponse, QRCodeData } from './types.js';
/**
 * PC端网络请求客户端
 */
declare class PCNetworkClient {
    private client;
    constructor();
    /**
     * 生成二维码
     */
    generateQRCode(): Promise<BaseResponse<QRCodeData>>;
    /**
     * 轮询二维码状态
     * @param key 二维码key
     */
    pollQRCode(key: string): Promise<any>;
    /**
     * 获取cookie
     */
    getCookie(): Promise<any>;
}
export declare const pcNetworkClient: PCNetworkClient;
export {};
