/**
 * 常用 MIME 类型映射
 *
 * 按类别组织，覆盖常见的文件类型
 * 引入 @orbitjs/mime 时自动注册到 MimeTypeRegistrar
 */

/**
 * 图片类型
 */
export const IMAGE_MIMES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    avif: 'image/avif',
};

/**
 * 文档类型
 */
export const DOCUMENT_MIMES: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    rtf: 'application/rtf',
    csv: 'text/csv',
};

/**
 * 音频类型
 */
export const AUDIO_MIMES: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    wma: 'audio/x-ms-wma',
};

/**
 * 视频类型
 */
export const VIDEO_MIMES: Record<string, string> = {
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    mkv: 'video/x-matroska',
    webm: 'video/webm',
    m4v: 'video/mp4',
};

/**
 * 压缩包类型
 */
export const ARCHIVE_MIMES: Record<string, string> = {
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    bz2: 'application/x-bzip2',
};

/**
 * Web/代码类型
 */
export const WEB_MIMES: Record<string, string | string[]> = {
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: ['text/javascript', 'application/javascript'],
    mjs: 'text/javascript',
    json: 'application/json',
    xml: 'application/xml',
    ts: 'text/typescript',
    tsx: 'text/typescript',
    jsx: 'text/jsx',
    vue: 'text/x-vue',
    map: 'application/json',
};

/**
 * 字体类型
 */
export const FONT_MIMES: Record<string, string> = {
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
    eot: 'application/vnd.ms-fontobject',
};

/**
 * 所有常用 MIME 类型（合并以上所有类别）
 */
export const COMMON_MIMES: Record<string, string | string[]> = {
    ...IMAGE_MIMES,
    ...DOCUMENT_MIMES,
    ...AUDIO_MIMES,
    ...VIDEO_MIMES,
    ...ARCHIVE_MIMES,
    ...WEB_MIMES,
    ...FONT_MIMES,
};
