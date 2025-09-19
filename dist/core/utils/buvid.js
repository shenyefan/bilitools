/**
 * 生成Buvid
 * @returns 随机生成的Buvid字符串
 */
export function generateBuvid() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 37; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
