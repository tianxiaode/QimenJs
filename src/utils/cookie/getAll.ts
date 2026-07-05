/**
 * 获取所有 Cookie 键值对
 * @returns {Record<string, string>} - 包含所有 Cookie 的对象，键为 Cookie 名称，值为解码后的 Cookie 值
 */
export function getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};

    if (document.cookie && document.cookie !== '') {
        const pairs = document.cookie.split(';');

        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');

            // 解码 Cookie 名称和值
            const name = decodeURIComponent(pair[0].trim());
            const value = pair.length > 1 ? decodeURIComponent(pair[1].trim()) : '';

            cookies[name] = value;
        }
    }

    return cookies;
}
