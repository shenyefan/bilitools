import { PCLoginData } from '../network/types.js';
/**
 * PC端扫码登录
 * @returns 登录结果数据或undefined
 */
export declare function pcLogin(): Promise<PCLoginData | undefined>;
