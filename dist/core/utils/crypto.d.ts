/**
 * 安全的随机数生成
 * @description 使用crypto模块生成安全的随机数
 */
export declare function safeRandom(): number;
/**
 * 生成随机数
 * @param lower 下限
 * @param upper 上限
 * @param floating 是否返回浮点数
 */
export declare function random(floating?: boolean): number;
export declare function random(lower: number, floating?: boolean): number;
export declare function random(lower: number, upper: number, floating?: boolean): number;
/**
 * MD5哈希
 * @param str 要哈希的字符串
 * @param uppercase 是否返回大写
 */
export declare function md5(str: string, uppercase?: boolean): string;
/**
 * 创建Buvid
 * @param prefix 前缀
 */
export declare function createBuvid(prefix?: string): string;
