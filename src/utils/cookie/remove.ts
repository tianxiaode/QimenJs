/**
 * 删除指定名称的 Cookie
 * @param {string} name - 要删除的 Cookie 名称
 * @param {string} [path] - Cookie 的路径（可选）
 * @param {string} [domain] - Cookie 的域名（可选）
 * @param {boolean} [secure] - 是否仅通过 HTTPS 传输（可选）
 * @returns {boolean} - 如果成功删除返回 true，否则返回 false
 */
export function remove(name: string, path?: string, domain?: string, secure?: boolean): boolean {
  if (!name || !hasLocal(name)) {
    return false;
  }

  // 设置过期时间为过去，以删除 Cookie
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT` +
    (path ? `; path=${path}` : '') +
    (domain ? `; domain=${domain}` : '') +
    (secure ? '; secure' : '');

  return !hasLocal(name);
}

/**
 * 检查指定名称的 Cookie 是否存在（内部函数）
 * @param {string} name - 要检查的 Cookie 名称
 * @returns {boolean} - 如果 Cookie 存在返回 true，否则返回 false
 */
function hasLocal(name: string): boolean {
  if (!name) {
    return false;
  }

  // 使用正则表达式检查 Cookie 是否存在
  return new RegExp(
    "(?:^|;\\s*)" +
    encodeURIComponent(name).replace(/[-.+*]/g, "\\$&") +
    "\\s*\\="
  ).test(document.cookie);
}