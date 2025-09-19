import { LoginInfo } from '../network/types.js';
/**
 * 移动端扫码登录
 * @returns 登录信息或undefined
 */
export declare function mbLogin(): Promise<LoginInfo | undefined>;
