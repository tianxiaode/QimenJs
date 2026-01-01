import { Chunk } from '../types/chunk';

/**
 * =========================
 * 主线程 → Worker 通信协议
 * hashWorkerProtocol 只解决一件事：
 * 主线程 ↔ Worker 之间"能且只能"交换什么
 * 我们要确保：
 * ❌ 不 eval
 * ❌ 不传函数
 * ❌ 不暴露内部状态
 * ✔ 可扩展（以后加算法、并行）
 * =========================
 */

/**
 * 初始化Worker的消息类型
 * 用于向Worker传递哈希算法类型
 */
export type HashWorkerInitMessage = {
  /** 消息类型：初始化 */
  type: 'init';
  /** 算法标识，例如 'sha-256' */
  algorithm: string;
};

/**
 * 更新哈希计算的消息类型
 * 用于向Worker传递数据块进行哈希计算
 */
export type HashWorkerUpdateMessage = {
  /** 消息类型：更新 */
  type: 'update';
  /** chunk 唯一标识（用于调试 / 并发） */
  chunkId: string;
  /** chunk 数据 */
  data: ArrayBuffer;
};

/**
 * 请求最终哈希结果的消息类型
 * 用于通知Worker完成哈希计算并返回最终结果
 */
export type HashWorkerFinalMessage = {
  /** 消息类型：完成 */
  type: 'final';
};

/**
 * 重置Worker状态的消息类型
 * 用于重置Worker内部的哈希计算状态
 */
export type HashWorkerResetMessage = {
  /** 消息类型：重置 */
  type: 'reset';
};

/**
 * 主线程向Worker发送的消息联合类型
 */
export type HashWorkerMessage =
  | HashWorkerInitMessage
  | HashWorkerUpdateMessage
  | HashWorkerFinalMessage
  | HashWorkerResetMessage;

/**
 * =========================
 * Worker → 主线程 通信协议
 * =========================
 */

/**
 * Worker确认消息类型
 * 用于向主线程确认已处理某条消息
 */
export type HashWorkerAck = {
  /** 消息类型：确认 */
  type: 'ack';
  /** 可选：回应哪个 chunk */
  chunkId?: string;
};

/**
 * Worker返回最终哈希结果的消息类型
 */
export type HashWorkerDigest = {
  /** 消息类型：摘要 */
  type: 'digest';
  /** 最终 hash 结果 */
  result: ArrayBuffer;
};

/**
 * Worker错误消息类型
 * 用于向主线程报告错误
 */
export type HashWorkerError = {
  /** 消息类型：错误 */
  type: 'error';
  /** 错误代码 */
  code: number | string;
  /** 错误消息 */
  message: string;
};

/**
 * Worker向主线程发送的响应消息联合类型
 */
export type HashWorkerResponse =
  | HashWorkerAck
  | HashWorkerDigest
  | HashWorkerError;