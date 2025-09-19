import * as crypto from 'crypto';

/**
 * 安全的随机数生成
 * @description 使用crypto模块生成安全的随机数
 */
export function safeRandom(): number {
  return crypto.randomBytes(4).readUInt32LE() / 0xffffffff;
}

/**
 * 生成随机数
 * @param lower 下限
 * @param upper 上限
 * @param floating 是否返回浮点数
 */
export function random(floating?: boolean): number;
export function random(lower: number, floating?: boolean): number;
export function random(lower: number, upper: number, floating?: boolean): number;
export function random(lower?: number | boolean, upper?: number | boolean, floating?: boolean): number {
  if (floating === undefined) {
    if (typeof upper === 'boolean') {
      floating = upper;
      upper = undefined;
    } else if (typeof lower === 'boolean') {
      floating = lower;
      lower = undefined;
    }
  }
  if (lower === undefined && upper === undefined) {
    lower = 0;
    upper = 1;
  } else if (upper === undefined) {
    upper = lower;
    lower = 0;
  }
  lower = Number(lower);
  upper = Number(upper);
  if (lower > upper) {
    const temp = lower;
    lower = upper;
    upper = temp;
  }
  if (floating || lower % 1 || upper % 1) {
    const rand = safeRandom();
    return Math.min(
      lower + rand * (upper - lower + parseFloat('1e-' + ((rand + '').length - 1))),
      upper
    );
  }
  return lower + Math.floor(safeRandom() * (upper - lower + 1));
}

/**
 * MD5哈希
 * @param str 要哈希的字符串
 * @param uppercase 是否返回大写
 */
export function md5(str: string, uppercase = false): string {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return uppercase ? hash.digest('hex').toUpperCase() : hash.digest('hex');
}

/**
 * 创建Buvid
 * @param prefix 前缀
 */
export function createBuvid(prefix = 'XY'): string {
  const rs = crypto.randomBytes(16).toString('hex').toUpperCase();
  return `${prefix}${rs[2]}${rs[12]}${rs[22]}${rs}`;
}