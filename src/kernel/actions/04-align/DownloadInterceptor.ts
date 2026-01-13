import { ActionHandler, FlowContext } from '../../types';
import { triggerDownload } from '@orbitjs/utils';

export const DownloadInterceptorHandler: ActionHandler = async (context: FlowContext) => {

    if(!context.metadata.isDownload) return;

    // 只有在成功解析出 Blob 且被判定为下载时执行
    const canDownload =
        context.metadata.isDownload &&
        !context.metadata.hasError &&
        context.data.raw instanceof Blob;

    if (!canDownload) return;

    // 执行下载（通过 Utils）
    triggerDownload(context.data.raw as Blob, context.metadata.fileName || 'download');

    // 记录审计日志或标记
    context.metadata.isDownloadHandled = true;
};
