#!/usr/bin/env node
import { cookieToToken, tokenToCookie } from './index.js';
/**
 * PC端扫码登录
 */
export declare function pcLogin(): Promise<void>;
/**
 * 移动端扫码登录
 */
export declare function mbLogin(): Promise<void>;
export { cookieToToken, tokenToCookie };
