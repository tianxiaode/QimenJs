import { Chunk } from '../types/chunk';

/**
 * =========================
 * 主线程 → Worker
 * hashWorkerProtocol 只解决一件事：
 * 主线程 ↔ Worker 之间“能且只能”交换什么
 * 我们要确保：
 * ❌ 不 eval
 * ❌ 不传函数
 * ❌ 不暴露内部状态
 * ✔ 可扩展（以后加算法、并行）
 * =========================
 */

export type HashWorkerInitMessage = {
  type: 'init';
  /** 算法标识，例如 'sha-256' */
  algorithm: string;
};

export type HashWorkerUpdateMessage = {
  type: 'update';
  /** chunk 唯一标识（用于调试 / 并发） */
  chunkId: string;
  /** chunk 数据 */
  data: ArrayBuffer;
};

export type HashWorkerFinalMessage = {
  type: 'final';
};

export type HashWorkerResetMessage = {
  type: 'reset';
};

export type HashWorkerMessage =
  | HashWorkerInitMessage
  | HashWorkerUpdateMessage
  | HashWorkerFinalMessage
  | HashWorkerResetMessage;

/**
 * =========================
 * Worker → 主线程
 * =========================
 */

export type HashWorkerAck = {
  type: 'ack';
  /** 可选：回应哪个 chunk */
  chunkId?: string;
};

export type HashWorkerDigest = {
  type: 'digest';
  /** 最终 hash 结果 */
  result: ArrayBuffer;
};

export type HashWorkerError = {
  type: 'error';
  code: number | string;
  message: string;
};

export type HashWorkerResponse =
  | HashWorkerAck
  | HashWorkerDigest
  | HashWorkerError;
