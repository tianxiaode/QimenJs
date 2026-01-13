import { ActionCategory, ActionEntry } from '../../types';
import { DownloadInterceptorHandler } from './DownloadInterceptor';

export const DownloadActionEntry: ActionEntry = {
    name: 'DownloadAction',
    category: ActionCategory.ALIGN,
    description: '下载数据',
    isHttp: true,
    offset: 999, // 确保在对齐阶段的最末尾执行
    handler: DownloadInterceptorHandler
};


