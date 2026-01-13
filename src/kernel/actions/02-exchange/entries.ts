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

