/**
 * 预定义验证模式
 *
 * 覆盖 ValidationPatternType 枚举中全部 19 个模式：
 * - 格式验证（15 个）：email, url, ipv4, ipv6, mac, phone, uuid, base64,
 *   hexColor, rgbColor, rgbaColor, creditCard, chineseId, chinesePostcode, username
 * - 密码验证（4 个）：uppercase, lowercase, digit, specialChar
 *
 * 引入 @orbit-js/pattern 时自动注册到 PatternRegistrar
 */

/**
 * 格式验证模式（15 个）
 */
export const FORMAT_PATTERNS: Record<string, RegExp> = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    ipv6: /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4})$/,
    mac: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    phone: /^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    base64: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
    hexColor: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
    rgbColor: /^rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)$/,
    rgbaColor: /^rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(0|0?\.\d+|1|100%?)\s*\)$/,
    creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
    chineseId: /^[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
    chinesePostcode: /^[1-9]\d{5}$/,
    username: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/,
};

/**
 * 密码验证模式（4 个）
 */
export const PASSWORD_PATTERNS: Record<string, RegExp> = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    digit: /\d/,
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
};

/**
 * 所有验证模式（合并格式 + 密码）
 */
export const VALIDATION_PATTERNS: Record<string, RegExp> = {
    ...FORMAT_PATTERNS,
    ...PASSWORD_PATTERNS,
};
