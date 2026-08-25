import { ILogger, Logger } from '@qimenjs/logger';

const CHUNK_SIZE = 1 * 1024 * 1024;

const ALGO_MAP: Record<string, string> = {
    md5: 'md5',
    sha1: 'SHA-1',
    sha256: 'SHA-256',
    sha384: 'SHA-384',
    sha512: 'SHA-512',
};

interface FileHashProgress {
    progress: number;
}

type ProgressCallback = (p: FileHashProgress) => void;

export interface FileHashTask {
    start(): Promise<void>;
    result(): Promise<ArrayBuffer>;
    onProgress(cb: ProgressCallback): () => void;
    cancel(): void;
}

export function createFileHashTask(file: File, algorithm: string): FileHashTask {
    const logger = Logger.for('FileHash');
    const algo = ALGO_MAP[algorithm.toLowerCase()];
    if (!algo) throw new Error(`Unsupported hash algorithm: ${algorithm}`);

    let cancelled = false;
    let progressCb: ProgressCallback | null = null;
    let resolveResult: ((v: ArrayBuffer) => void) | null = null;
    let rejectResult: ((e: Error) => void) | null = null;
    let resultPromise: Promise<ArrayBuffer> | null = null;

    async function run(): Promise<void> {
        try {
            const total = file.size;
            let offset = 0;
            const chunks: Uint8Array[] = [];

            while (offset < total) {
                if (cancelled) throw new Error('Task cancelled');

                const end = Math.min(offset + CHUNK_SIZE, total);
                const buf = await file.slice(offset, end).arrayBuffer();
                chunks.push(new Uint8Array(buf));

                offset = end;
                progressCb?.({ progress: offset / total });
                await new Promise(r => setTimeout(r, 0));
            }

            const full = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0));
            let pos = 0;
            for (const c of chunks) { full.set(c, pos); pos += c.length; }

            let result: ArrayBuffer;
            if (algo === 'md5') {
                result = md5Bytes(full);
            } else {
                result = await crypto.subtle.digest(algo, full);
            }

            resolveResult?.(result);
        } catch (err: any) {
            logger.error?.('Hash failed:', err);
            rejectResult?.(err);
        }
    }

    return {
        onProgress(cb: ProgressCallback) {
            progressCb = cb;
            return () => { progressCb = null; };
        },
        cancel() { cancelled = true; },
        start() {
            resultPromise = new Promise((resolve, reject) => {
                resolveResult = resolve;
                rejectResult = reject;
            });
            setTimeout(run, 0);
            return resultPromise;
        },
        result() { return resultPromise ?? Promise.reject(new Error('Task not started')); },
    };
}

function md5Bytes(data: Uint8Array): ArrayBuffer {
    const words: number[] = [];
    for (let i = 0; i < data.length; i++) {
        const wi = i >> 2;
        words[wi] = (words[wi] | 0) | (data[i] << ((i % 4) * 8));
    }

    const bitLen = data.length * 8;
    const blockCount = ((data.length + 8) >>> 6) + 1;
    words[data.length >> 2] |= 0x80 << ((data.length % 4) * 8);
    words[blockCount * 16 - 2] = bitLen;

    let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

    const rotl = (x: number, n: number) => (x << n) | (x >>> (32 - n));
    const add = (x: number, y: number) => (x + y) | 0;

    const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
    const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
    const H = (x: number, y: number, z: number) => x ^ y ^ z;
    const I = (x: number, y: number, z: number) => y ^ (x | ~z);

    const T = new Int32Array([
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
    ]);

    const S: [number, number, number, number][] = [
        [7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21],
    ];

    const gg = (op: (x: number, y: number, z: number) => number, s: number[]) =>
        (idx: number, k: number) => {
            const g = (j: number) => {
                switch (op) {
                    case F: return j;
                    case G: return (1 + j * 5) % 16;
                    case H: return (5 + j * 3) % 16;
                    case I: return (j * 7) % 16;
                    default: return j;
                }
            };
            return { shift: s[idx % 4], mi: g(idx), ti: k };
        };

    for (let i = 0; i < blockCount * 16; i += 16) {
        let A = a, B = b, C = c, D = d;

        for (let j = 0; j < 64; j++) {
            const round = j >>> 4;
            const op = [F, G, H, I][round];
            const { shift, mi, ti } = gg(op, S[round])(j, T[j]);
            const X = words[i + mi] | 0;
            const temp = add(add(add(A, op(B, C, D)), X), ti);
            [A, B, C, D] = [D, add(B, rotl(temp, shift)), B, C];
        }

        a = add(a, A);
        b = add(b, B);
        c = add(c, C);
        d = add(d, D);
    }

    const out = new Uint8Array(16);
    const w32 = (v: number, off: number) => {
        out[off] = v & 0xff;
        out[off + 1] = (v >>> 8) & 0xff;
        out[off + 2] = (v >>> 16) & 0xff;
        out[off + 3] = (v >>> 24) & 0xff;
    };
    w32(a, 0);
    w32(b, 4);
    w32(c, 8);
    w32(d, 12);

    return out.buffer;
}