"use strict";
/**
 * @file entries.ts
 * @description
 * 该文件定义了交换阶段(action exchange)的入口配置，包括Fetch和XHR传输处理器。
 * 这些入口配置定义了网络传输方式的选择和处理逻辑。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XhrTransportEntry = exports.FetchTransportEntry = void 0;
const types_1 = require("../../types");
const FetchTransport_1 = require("./FetchTransport");
const XhrTransport_1 = require("./XhrTransport");
exports.FetchTransportEntry = {
    name: 'FetchTransport',
    category: types_1.ActionCategory.EXCHANGE,
    description: 'Fetch transport data from remote server',
    isHttp: true,
    offset: 100,
    handler: FetchTransport_1.FetchTransportHandler
};
exports.XhrTransportEntry = {
    name: 'XhrTransport',
    category: types_1.ActionCategory.EXCHANGE,
    description: 'XHR transport data from remote server',
    isHttp: true,
    offset: 110, // 稍微靠后一点，或者与 Fetch 同级
    handler: XhrTransport_1.XhrTransportHandler
};
//# sourceMappingURL=entries.js.map