/**
 * @file DownloadInterceptor.ts
 * @description
 * 该文件实现了下载拦截器，用于处理被识别为下载类型的响应。
 * 当响应被标记为下载且包含有效的Blob数据时，它会触发浏览器的文件下载功能。
 */
import type { RequestContext } from '@orbitjs/context';
export declare const DownloadInterceptorHandler: (context: RequestContext) => Promise<void>;
//# sourceMappingURL=DownloadInterceptor.d.ts.map