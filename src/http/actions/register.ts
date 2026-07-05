/**
 * 注册默认的 HTTP Actions
 */

import { HttpActionRegistrar, HttpActionCategory } from '../HttpActionRegistrar';
import { CommonParamsEnricherHandler } from './prepare/CommonParamsEnricher';
import { TokenInjectorHandler } from './prepare/TokenInjector';
import { UrlBuilderHandler } from './prepare/UrlBuilder';
import { FetchTransportHandler } from './exchange/FetchTransport';
import { XhrTransportHandler } from './exchange/XhrTransport';
import { ResponseAnalyzerHandler } from './process/ResponseAnalyzer';
import { DataParserHandler } from './process/DataParser';
import { DownloadInterceptorHandler } from './align/DownloadInterceptor';

/**
 * 注册所有默认的 HTTP Actions
 */
export function registerDefaultHttpActions(): void {
    const registrar = HttpActionRegistrar.getInstance();

    // 准备阶段
    registrar.registerAll([
        {
            name: 'CommonParamsEnricher',
            category: HttpActionCategory.PREPARE,
            offset: 10,
            handler: CommonParamsEnricherHandler,
            description: '合并公共参数',
        },
        {
            name: 'TokenInjector',
            category: HttpActionCategory.PREPARE,
            offset: 15,
            handler: TokenInjectorHandler,
            description: 'Token 注入',
        },
        {
            name: 'UrlBuilder',
            category: HttpActionCategory.PREPARE,
            offset: 20,
            handler: UrlBuilderHandler,
            description: '构建 URL',
        },
    ]);

    // 交换阶段
    registrar.registerAll([
        {
            name: 'FetchTransport',
            category: HttpActionCategory.EXCHANGE,
            offset: 10,
            handler: FetchTransportHandler,
            description: 'Fetch 传输',
        },
        {
            name: 'XhrTransport',
            category: HttpActionCategory.EXCHANGE,
            offset: 20,
            handler: XhrTransportHandler,
            description: 'XHR 传输',
        },
    ]);

    // 处理阶段
    registrar.registerAll([
        {
            name: 'ResponseAnalyzer',
            category: HttpActionCategory.PROCESS,
            offset: 10,
            handler: ResponseAnalyzerHandler,
            description: '响应分析',
        },
        {
            name: 'DataParser',
            category: HttpActionCategory.PROCESS,
            offset: 20,
            handler: DataParserHandler,
            description: '数据解析',
        },
    ]);

    // 对齐阶段
    registrar.registerAll([
        {
            name: 'DownloadInterceptor',
            category: HttpActionCategory.ALIGN,
            offset: 10,
            handler: DownloadInterceptorHandler,
            description: '下载拦截器',
        },
    ]);
}

// 自动注册
registerDefaultHttpActions();
