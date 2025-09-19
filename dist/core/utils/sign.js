import { md5 } from './crypto.js';
/**
 * 获取Unix时间戳
 */
export function getUnixTime() {
    return Math.floor(new Date().getTime() / 1000);
}
/**
 * 检查值的类型
 */
export function is(val, type) {
    return Object.prototype.toString.call(val) === `[object ${type}]`;
}
/**
 * 检查是否为对象
 */
export function isObject(val) {
    return val !== null && is(val, 'Object');
}
/**
 * 检查是否为数组
 */
export function isArray(val) {
    return val !== null && Array.isArray(val);
}
/**
 * 参数字符串化
 * @param entries 参数对象或数组
 */
export function stringify(entries) {
    if (!isObject(entries) && !isArray(entries)) {
        return entries;
    }
    const searchParams = new URLSearchParams();
    if (!Array.isArray(entries)) {
        entries = Object.entries(entries);
    }
    entries.forEach(([key, value]) => {
        if (isObject(value)) {
            searchParams.append(key, JSON.stringify(value));
            return;
        }
        searchParams.append(key, String(value));
    });
    return searchParams.toString();
}
/**
 * 排序参数
 * @param params 参数对象
 */
function sortParams(params) {
    const keys = Object.keys(params).sort();
    return keys.map(key => [key, params[key].toString()]);
}
/**
 * 获取签名
 * @param params 参数对象
 * @param appsec 应用密钥
 */
export function getSign(params, appsec) {
    const query = stringify(sortParams(params));
    return query + '&sign=' + md5(query + appsec);
}
