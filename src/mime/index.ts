/**
 * @orbitjs/mime - MIME 类型管理
 *
 * 提供 MIME 类型注册器，管理文件扩展名与 MIME 类型的映射关系。
 * 引入即自动注册常用 MIME 类型。
 *
 * @example
 * ```typescript
 * import '@orbitjs/mime';
 *
 * // 使用 MimeTypeRegistrar
 * import { MimeTypeRegistrar } from '@orbitjs/mime';
 * const mimes = MimeTypeRegistrar.getInstance().get('jpg'); // ['image/jpeg']
 * const ext = MimeTypeRegistrar.getInstance().getByMime('image/jpeg'); // 'jpg'
 * ```
 */

// MimeTypeRegistrar 核心
export { MimeTypeRegistrar, MimeTypeRegistrarName } from './MimeTypeRegistrar';

// 预定义 MIME 类型常量
export {
    IMAGE_MIMES,
    DOCUMENT_MIMES,
    AUDIO_MIMES,
    VIDEO_MIMES,
    ARCHIVE_MIMES,
    WEB_MIMES,
    FONT_MIMES,
    COMMON_MIMES,
} from './presets';

// 自动注册（必须在最后，触发 registerCommonMimeTypes）
export { registerCommonMimeTypes } from './register';
