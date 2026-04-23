/**
 * @file entries.ts
 * @description 
 * 该文件定义了交换阶段(action exchange)的入口配置，包括Fetch和XHR传输处理器。
 * 这些入口配置定义了网络传输方式的选择和处理逻辑。
 */

import { ActionCategory, ActionEntry } from "../../types";
import { FetchTransportHandler } from "./FetchTransport";
import { XhrTransportHandler } from "./XhrTransport";

export const FetchTransportEntry: ActionEntry = {
    name: 'FetchTransport',
    category: ActionCategory.EXCHANGE,
    description: 'Fetch transport data from remote server',
    isHttp: true,
    offset: 100,
    handler: FetchTransportHandler
};

export const XhrTransportEntry: ActionEntry = {
    name: 'XhrTransport',
    category: ActionCategory.EXCHANGE,
    description: 'XHR transport data from remote server',
    isHttp: true,
    offset: 110, // 稍微靠后一点，或者与 Fetch 同级
    handler: XhrTransportHandler
};