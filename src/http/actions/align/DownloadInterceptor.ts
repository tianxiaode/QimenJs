/**
 * @file DownloadInterceptor.ts
 * @description
 * 该文件实现了下载拦截器，用于处理被识别为下载类型的响应。
 * 当响应被标记为下载且包含有效的Blob数据时，它会触发浏览器的文件下载功能。
 */

import type { RequestContext } from '@qimenjs/context';

export const DownloadInterceptorHandler = async (context: RequestContext) => {
    if (!context.metadata.isDownload) return;

    // 只有在成功解析出 Blob 且被判定为下载时执行
    const canDownload =
        context.metadata.isDownload && !context.error && context.data.raw instanceof Blob;

    if (!canDownload) return;

    // 执行下载（创建下载链接）
    const blob = context.data.raw as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = context.metadata.fileName || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 记录审计日志或标记
    context.metadata.isDownloadHandled = true;
};
