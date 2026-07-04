/**
 * 自动注册常用 MIME 类型
 *
 * 引入 @orbit-js/mime 时自动执行，将常用 MIME 类型注册到 MimeTypeRegistrar
 */

import { MimeTypeRegistrar } from './MimeTypeRegistrar';
import { COMMON_MIMES } from './presets';

/**
 * 注册常用 MIME 类型到 MimeTypeRegistrar
 *
 * @param extra - 额外的 MIME 类型映射，与 COMMON_MIMES 合并注册
 */
export function registerCommonMimeTypes(extra?: Record<string, string | string[]>): void {
    const registrar = MimeTypeRegistrar.getInstance();
    registrar.register(COMMON_MIMES);
    if (extra) {
        registrar.register(extra);
    }
}

// 自动注册常用 MIME 类型
registerCommonMimeTypes();
