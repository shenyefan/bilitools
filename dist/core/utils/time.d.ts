/**
 * 获取Unix时间戳（秒）
 * @returns Unix时间戳
 */
export declare function getUnixTime(): number;
/**
 * 获取Unix时间戳（毫秒）
 * @returns Unix时间戳（毫秒）
 */
export declare function getUnixTimeMs(): number;
/**
 * 延迟执行
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export declare function sleep(ms: number): Promise<void>;
