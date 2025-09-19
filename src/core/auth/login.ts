#!/usr/bin/env node

import { pcLogin as corepcLogin, mbLogin as corembLogin, cookieToToken, tokenToCookie } from './index.js';
import { ConfigManager } from '../config.js';
import { authLogger } from '../logger.js';

/**
 * PC端扫码登录
 */
export async function pcLogin(): Promise<void> {
  try {
    authLogger.info('开始PC端扫码登录...');
    const result = await corepcLogin();
    
    if (result) {
      authLogger.info('登录成功!');
      
      // 保存Cookie到配置文件
      const configManager = new ConfigManager();
      configManager.updateCookie(result.cookie);
      
      authLogger.info('Cookie已保存到配置文件');
    } else {
      authLogger.info('登录失败或被取消');
    }
  } catch (error: any) {
    authLogger.error('PC端登录失败:', error.message);
    throw error;
  }
}

/**
 * 移动端扫码登录
 */
export async function mbLogin(): Promise<void> {
  try {
    authLogger.info('开始移动端扫码登录...');
    const result = await corembLogin();
    
    if (result) {
      authLogger.info('登录成功!');
      authLogger.info('Token已保存');
    } else {
      authLogger.info('登录失败或被取消');
    }
  } catch (error: any) {
    authLogger.error('移动端登录失败:', error.message);
    throw error;
  }
}

// 导出工具函数供其他模块使用
export { cookieToToken, tokenToCookie };