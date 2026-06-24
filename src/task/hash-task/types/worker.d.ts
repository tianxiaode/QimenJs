import { Chunk } from "./chunk";
/**
 * Worker消息联合类型
 *
 * 定义了发送给Worker的各种消息类型
 */
export type WorkerMessage = {
    /** 初始化消息类型 */
    type: 'init';
} | {
    /** 更新消息类型 */
    type: 'update';
    /** 要处理的数据块 */
    chunk: Chunk;
} | {
    /** 摘要消息类型，用于生成最终哈希值 */
    type: 'digest';
};
/**
 * Worker响应联合类型
 *
 * 定义了Worker可能返回的各种响应类型
 */
export type WorkerResponse = {
    /** 确认响应类型 */
    type: 'ack';
} | {
    /** 结果响应类型 */
    type: 'result';
    /** 计算得到的哈希值 */
    hash: Uint8Array;
} | {
    /** 错误响应类型 */
    type: 'error';
    /** 错误信息 */
    error: string;
};
//# sourceMappingURL=worker.d.ts.map