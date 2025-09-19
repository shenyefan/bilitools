type Params = Record<string, string | boolean | number | Array<any>>;
/**
 * 获取Unix时间戳
 */
export declare function getUnixTime(): number;
/**
 * 检查值的类型
 */
export declare function is(val: unknown, type: string): boolean;
/**
 * 检查是否为对象
 */
export declare function isObject(val: any): val is Record<any, any>;
/**
 * 检查是否为数组
 */
export declare function isArray(val: any): val is Array<any>;
/**
 * 参数字符串化
 * @param entries 参数对象或数组
 */
export declare function stringify(entries: Record<string, any> | [string, any][]): string;
/**
 * 获取签名
 * @param params 参数对象
 * @param appsec 应用密钥
 */
export declare function getSign(params: Params, appsec: string): string;
export {};
