/**
 * 获取指定名称的 Cookie 值
 * @param {string} name - Cookie 名称
 * @returns {string | null} - 如果 Cookie 存在返回解码后的值，否则返回 null
 */
export function get(name: string): string | null {
    return (
        decodeURIComponent(
            document.cookie.replace(
                new RegExp(
                    '(?:(?:^|.*;)\\s*' +
                        encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') +
                        '\\s*\\=\\s*([^;]*).*$)|^.*$'
                ),
                '$1'
            )
        ) || null
    );
}
