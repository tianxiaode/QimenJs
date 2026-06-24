"use strict";
/**
 * @file DownloadInterceptor.ts
 * @description
 * 该文件实现了下载拦截器，用于处理被识别为下载类型的响应。
 * 当响应被标记为下载且包含有效的Blob数据时，它会触发浏览器的文件下载功能。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadInterceptorHandler = void 0;
const utils_1 = require("@orbitjs/utils");
const DownloadInterceptorHandler = async (context) => {
    if (!context.metadata.isDownload)
        return;
    // 只有在成功解析出 Blob 且被判定为下载时执行
    const canDownload = context.metadata.isDownload &&
        !context.metadata.hasError &&
        context.data.raw instanceof Blob;
    if (!canDownload)
        return;
    // 执行下载（通过 Utils）
    (0, utils_1.triggerDownload)(context.data.raw, context.metadata.fileName || 'download');
    // 记录审计日志或标记
    context.metadata.isDownloadHandled = true;
};
exports.DownloadInterceptorHandler = DownloadInterceptorHandler;
//# sourceMappingURL=DownloadInterceptor.js.map