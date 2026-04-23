/**
 * @file entries.ts
 * @description 
 * 该文件定义了对齐阶段(action align)的入口配置，包括下载拦截器。
 * 这些入口配置负责在请求完成后执行最后的处理步骤。
 */

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