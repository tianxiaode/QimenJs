/**
 * 设置 Cookie
 * @param {string} name - Cookie 名称
 * @param {any} value - Cookie 值
 * @param {number | Date} [expires] - 过期时间，可以是秒数或 Date 对象
 * @param {string} [path='/'] - Cookie 路径
 * @param {string} [domain] - Cookie 域名
 * @param {boolean} [secure=false] - 是否仅通过 HTTPS 传输
 * @param {'Strict' | 'Lax' | 'None'} [sameSite='Lax'] - SameSite 属性
 * @returns {boolean} - 如果设置成功返回 true，否则返回 false
 */
export declare function set(name: string, value: any, expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite?: 'Strict' | 'Lax' | 'None'): boolean;
//# sourceMappingURL=set.d.ts.map