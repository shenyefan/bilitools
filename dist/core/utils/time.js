/**
 * 获取Unix时间戳（秒）
 * @returns Unix时间戳
 */
export function getUnixTime() {
    return Math.floor(Date.now() / 1000);
}
/**
 * 获取Unix时间戳（毫秒）
 * @returns Unix时间戳（毫秒）
 */
export function getUnixTimeMs() {
    return Date.now();
}
/**
 * 延迟执行
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
