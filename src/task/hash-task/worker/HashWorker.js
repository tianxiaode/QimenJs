"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const crypto = __importStar(require("crypto"));
/**
 * Node.js环境下的哈希计算Worker
 *
 * 该Worker只负责一件事：按固定协议，增量计算哈希
 *
 * 必须满足：
 * ❌ 不 eval
 * ❌ 不接受函数
 * ❌ 不关心任务状态 / 进度
 * ✔ 支持大文件（多次 update）
 * ✔ 可被 reset / 重用
 * ✔ 出错可恢复
 */
if (!worker_threads_1.parentPort) {
    throw new Error('hash.worker must be run in a Worker thread');
}
let hash = null;
let algorithm = null;
/**
 * 允许的算法白名单
 * ❗ 不允许任意字符串
 */
const ALLOWED_ALGORITHMS = new Set([
    'sha1',
    'sha256',
    'sha384',
    'sha512',
    'md5', // 如不需要可移除
]);
/**
 * 向主线程发送消息的辅助函数
 *
 * @param message 要发送的响应消息
 */
function post(message) {
    worker_threads_1.parentPort.postMessage(message);
}
/**
 * 重置内部哈希状态
 */
function reset() {
    hash = null;
    algorithm = null;
}
worker_threads_1.parentPort.on('message', (msg) => {
    try {
        switch (msg.type) {
            case 'init': {
                if (!ALLOWED_ALGORITHMS.has(msg.algorithm)) {
                    throw {
                        code: 'UNSUPPORTED_ALGORITHM',
                        message: `Unsupported: ${msg.algorithm}`,
                    };
                }
                algorithm = msg.algorithm;
                hash = crypto.createHash(algorithm);
                post({ type: 'ack' });
                break;
            }
            case 'update': {
                if (!hash) {
                    throw new Error('Hash not initialized');
                }
                hash.update(Buffer.from(msg.data));
                post({ type: 'ack', chunkId: msg.chunkId });
                break;
            }
            case 'final': {
                if (!hash) {
                    throw new Error('Hash not initialized');
                }
                const result = hash.digest();
                post({
                    type: 'digest',
                    result: result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength),
                });
                reset();
                break;
            }
            case 'reset': {
                reset();
                post({ type: 'ack' });
                break;
            }
            default:
                throw { code: 'UNKNOWN_COMMAND', message: `Unknown type: ${msg.type}` };
        }
    }
    catch (err) {
        post({
            type: 'error',
            code: err.code || 'WORKER_INTERNAL_ERROR',
            message: err.message,
        });
    }
});
//# sourceMappingURL=HashWorker.js.map