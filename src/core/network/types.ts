/**
 * 基础API响应类型
 */
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  ttl: number;
  data: T;
}

/**
 * 登录信息接口
 */
export interface LoginInfo {
  mid: number;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  is_new?: boolean;
  token_info?: any;
  cookie_info?: any;
  sso?: any;
  hint?: string;
}

/**
 * PC端登录数据
 */
export interface PCLoginData {
  refresh_token: string;
  timestamp: number;
  cookie: string;
  mid: number;
}

/**
 * 二维码生成响应数据
 */
export interface QRCodeData {
  qrcode_key: string;
  url: string;
}

/**
 * 授权码响应数据
 */
export interface AuthCodeData {
  auth_code: string;
  url: string;
}