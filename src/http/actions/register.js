"use strict";
/**
 * 注册默认的 HTTP Actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDefaultHttpActions = registerDefaultHttpActions;
const HttpActionRegistrar_1 = require("../HttpActionRegistrar");
const CommonParamsEnricher_1 = require("./prepare/CommonParamsEnricher");
const UrlBuilder_1 = require("./prepare/UrlBuilder");
const FetchTransport_1 = require("./exchange/FetchTransport");
const XhrTransport_1 = require("./exchange/XhrTransport");
const ResponseAnalyzer_1 = require("./process/ResponseAnalyzer");
const DataParser_1 = require("./process/DataParser");
const DownloadInterceptor_1 = require("./align/DownloadInterceptor");
/**
 * 注册所有默认的 HTTP Actions
 */
function registerDefaultHttpActions() {
    const registrar = HttpActionRegistrar_1.HttpActionRegistrar.getInstance();
    // 准备阶段
    registrar.registerAll([
        {
            name: 'CommonParamsEnricher',
            category: HttpActionRegistrar_1.HttpActionCategory.PREPARE,
            offset: 10,
            handler: CommonParamsEnricher_1.CommonParamsEnricherHandler,
            description: '合并公共参数',
        },
        {
            name: 'UrlBuilder',
            category: HttpActionRegistrar_1.HttpActionCategory.PREPARE,
            offset: 20,
            handler: UrlBuilder_1.UrlBuilderHandler,
            description: '构建 URL',
        },
    ]);
    // 交换阶段
    registrar.registerAll([
        {
            name: 'FetchTransport',
            category: HttpActionRegistrar_1.HttpActionCategory.EXCHANGE,
            offset: 10,
            handler: FetchTransport_1.FetchTransportHandler,
            description: 'Fetch 传输',
        },
        {
            name: 'XhrTransport',
            category: HttpActionRegistrar_1.HttpActionCategory.EXCHANGE,
            offset: 20,
            handler: XhrTransport_1.XhrTransportHandler,
            description: 'XHR 传输',
        },
    ]);
    // 处理阶段
    registrar.registerAll([
        {
            name: 'ResponseAnalyzer',
            category: HttpActionRegistrar_1.HttpActionCategory.PROCESS,
            offset: 10,
            handler: ResponseAnalyzer_1.ResponseAnalyzerHandler,
            description: '响应分析',
        },
        {
            name: 'DataParser',
            category: HttpActionRegistrar_1.HttpActionCategory.PROCESS,
            offset: 20,
            handler: DataParser_1.DataParserHandler,
            description: '数据解析',
        },
    ]);
    // 对齐阶段
    registrar.registerAll([
        {
            name: 'DownloadInterceptor',
            category: HttpActionRegistrar_1.HttpActionCategory.ALIGN,
            offset: 10,
            handler: DownloadInterceptor_1.DownloadInterceptorHandler,
            description: '下载拦截器',
        },
    ]);
}
// 自动注册
registerDefaultHttpActions();
//# sourceMappingURL=register.js.map