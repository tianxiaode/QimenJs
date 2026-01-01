import { parentPort } from 'worker_threads';
import * as crypto from 'crypto';
import { HashWorkerMessage, HashWorkerResponse } from './HashWorkerProtocol';

/**
 * worker 只做一件事：
 * 按固定协议，增量计算 hash
 * 必须满足：
 * ❌ 不 eval
 * ❌ 不接受函数
 * ❌ 不关心任务状态 / 进度
 * ✔ 支持大文件（多次 update）
 * ✔ 可被 reset / 重用
 * ✔ 出错可恢复
 */

if (!parentPort) {
    throw new Error('hash.worker must be run in a Worker thread');
}

let hash: crypto.Hash | null = null;
let algorithm: string | null = null;

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

function post(message: HashWorkerResponse) {
    parentPort!.postMessage(message);
}

function reset() {
    hash = null;
    algorithm = null;
}

parentPort.on('message', (msg: HashWorkerMessage) => {
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
                    result: result.buffer.slice(
                        result.byteOffset,
                        result.byteOffset + result.byteLength
                    ),
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
                throw { code: 'UNKNOWN_COMMAND', message: `Unknown type: ${(msg as any).type}` };
        }
    } catch (err: any) {
        post({
            type: 'error',
            code: err.code || 'WORKER_INTERNAL_ERROR',
            message: (err as Error).message,
        });
    }
});
