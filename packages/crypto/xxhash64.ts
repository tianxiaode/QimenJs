/**
 * XXH64哈希算法实现
 * 提供字符串的XXH64哈希功能
 */

/**
 * 计算字符串的XXH64哈希值
 * @param str - 需要计算哈希值的字符串
 * @param seed - 可选的种子值，默认为0
 * @returns XXH64哈希值（16位十六进制字符串）
 */
export default function xxhash64(str: string, seed: number = 0): string {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }

    return calculateXXH64(str, seed);
}

/**
 * 纯JavaScript实现XXH64算法
 * @param str - 需要计算哈希值的字符串
 * @param seed - 种子值
 * @returns XXH64哈希值
 */
function calculateXXH64(str: string, seed: number): string {
    // 将字符串转换为UTF-8字节数组
    function str2rstrUTF8(input: string): Uint8Array {
        const utf8Str = unescape(encodeURIComponent(input));
        const result = new Uint8Array(utf8Str.length);
        for (let i = 0; i < utf8Str.length; i++) {
            result[i] = utf8Str.charCodeAt(i);
        }
        return result;
    }

    // 32位无符号整数运算辅助类
    class Uint64 {
        public hi: number;
        public lo: number;

        constructor(hi: number, lo: number) {
            this.hi = hi >>> 0;
            this.lo = lo >>> 0;
        }

        // 加法
        static add(a: Uint64, b: Uint64): Uint64 {
            const lo = (a.lo + b.lo) >>> 0;
            const carry = lo < a.lo ? 1 : 0;
            const hi = (a.hi + b.hi + carry) >>> 0;
            return new Uint64(hi, lo);
        }

        // 乘法
        static mul(a: Uint64, b: Uint64): Uint64 {
            // 64位乘法实现
            const a00 = a.lo & 0xFFFF;
            const a16 = a.lo >>> 16;
            const a32 = a.hi & 0xFFFF;
            const a48 = a.hi >>> 16;
            
            const b00 = b.lo & 0xFFFF;
            const b16 = b.lo >>> 16;
            const b32 = b.hi & 0xFFFF;
            const b48 = b.hi >>> 16;

            let c00 = 0;
            let c16 = 0;
            let c32 = 0;
            let c48 = 0;

            // 计算所有部分的乘积
            c00 = a00 * b00;
            c16 = (c00 >>> 16) + (a16 * b00);
            c00 &= 0xFFFF;
            c16 = (c16 >>> 0) + (a00 * b16);
            c32 = (c16 >>> 16) + (a32 * b00) + (a16 * b16) + (a00 * b32);
            c16 &= 0xFFFF;
            c32 = (c32 >>> 0) + (a00 * b48) + (a16 * b32) + (a32 * b16) + (a48 * b00);
            c48 = (c32 >>> 16) + (a48 * b16) + (a32 * b32) + (a16 * b48);
            c32 &= 0xFFFF;
            c48 = (c48 >>> 0) + (a48 * b32) + (a32 * b48);
            c48 = (c48 >>> 0) + (a48 * b48);

            return new Uint64(
                ((c48 << 16) | (c32 & 0xFFFF)) >>> 0,
                ((c16 << 16) | (c00 & 0xFFFF)) >>> 0
            );
        }

        // XOR
        static xor(a: Uint64, b: Uint64): Uint64 {
            return new Uint64(a.hi ^ b.hi, a.lo ^ b.lo);
        }

        // AND
        static and(a: Uint64, b: Uint64): Uint64 {
            return new Uint64(a.hi & b.hi, a.lo & b.lo);
        }

        // Left rotate
        static rotl(a: Uint64, b: number): Uint64 {
            b &= 63; // 只考虑低6位
            if (b === 0) return new Uint64(a.hi, a.lo);
            if (b === 32) return new Uint64(a.lo, a.hi);

            if (b < 32) {
                const hi = (a.hi << b) | (a.lo >>> (32 - b));
                const lo = (a.lo << b) | (a.hi >>> (32 - b));
                return new Uint64(hi >>> 0, lo >>> 0);
            } else {
                const hi = (a.lo << (b - 32)) | (a.hi >>> (64 - b));
                const lo = (a.hi << (b - 32)) | (a.lo >>> (64 - b));
                return new Uint64(hi >>> 0, lo >>> 0);
            }
        }

        // 转换为十六进制字符串
        static toString(x: Uint64): string {
            const hiHex = x.hi.toString(16).padStart(8, '0');
            const loHex = x.lo.toString(16).padStart(8, '0');
            return hiHex + loHex;
        }

        // 从数字创建Uint64
        static fromNumber(num: number): Uint64 {
            return new Uint64(0, num >>> 0);
        }
    }

    // 常量
    const PRIME64_1 = new Uint64(0x9E3779B1, 0x85EBCA77);
    const PRIME64_2 = new Uint64(0xC2B2AE3D, 0x27D4EB4F);
    const PRIME64_3 = new Uint64(0x165667B1, 0x9E3779F9);
    const PRIME64_4 = new Uint64(0x85EBCA77, 0xC2B2AE63);
    const PRIME64_5 = new Uint64(0x27D4EB2F, 0x165667C5);

    // 从种子创建Uint64
    const seed64 = new Uint64(0, seed >>> 0);

    // 将字符串转换为字节数组
    const input = str2rstrUTF8(str);
    const len = input.length;
    let offset = 0;

    // 初始化哈希值
    let hash: Uint64;
    if (len >= 32) {
        let v1 = Uint64.add(Uint64.add(Uint64.fromNumber(seed), PRIME64_1), PRIME64_2);
        let v2 = Uint64.add(Uint64.fromNumber(seed), PRIME64_2);
        let v3 = Uint64.fromNumber(seed);
        let v4 = Uint64.add(Uint64.fromNumber(seed), PRIME64_1);

        let offset = 0;
        for (; offset <= len - 32; offset += 32) {
            let data1 = new Uint64(
                (input[offset + 4] << 24) | (input[offset + 5] << 16) | (input[offset + 6] << 8) | input[offset + 7],
                (input[offset + 0] << 24) | (input[offset + 1] << 16) | (input[offset + 2] << 8) | input[offset + 3]
            );
            let data2 = new Uint64(
                (input[offset + 12] << 24) | (input[offset + 13] << 16) | (input[offset + 14] << 8) | input[offset + 15],
                (input[offset + 8] << 24) | (input[offset + 9] << 16) | (input[offset + 10] << 8) | input[offset + 11]
            );
            let data3 = new Uint64(
                (input[offset + 20] << 24) | (input[offset + 21] << 16) | (input[offset + 22] << 8) | input[offset + 23],
                (input[offset + 16] << 24) | (input[offset + 17] << 16) | (input[offset + 18] << 8) | input[offset + 19]
            );
            let data4 = new Uint64(
                (input[offset + 28] << 24) | (input[offset + 29] << 16) | (input[offset + 30] << 8) | input[offset + 31],
                (input[offset + 24] << 24) | (input[offset + 25] << 16) | (input[offset + 26] << 8) | input[offset + 27]
            );

            v1 = Uint64.add(Uint64.rotl(Uint64.add(Uint64.mul(v1, PRIME64_2), data1), 31), PRIME64_1);
            v2 = Uint64.add(Uint64.rotl(Uint64.add(Uint64.mul(v2, PRIME64_2), data2), 31), PRIME64_1);
            v3 = Uint64.add(Uint64.rotl(Uint64.add(Uint64.mul(v3, PRIME64_2), data3), 31), PRIME64_1);
            v4 = Uint64.add(Uint64.rotl(Uint64.add(Uint64.mul(v4, PRIME64_2), data4), 31), PRIME64_1);
        }

        hash = Uint64.rotl(v1, 1);
        hash = Uint64.add(hash, Uint64.mul(Uint64.rotl(v2, 7), PRIME64_1));
        hash = Uint64.add(hash, Uint64.mul(Uint64.rotl(v3, 12), PRIME64_2));
        hash = Uint64.add(hash, Uint64.mul(Uint64.rotl(v4, 18), PRIME64_3));

        v1 = Uint64.mul(v1, PRIME64_2);
        v1 = Uint64.rotl(v1, 31);
        v1 = Uint64.mul(v1, PRIME64_1);

        v2 = Uint64.mul(v2, PRIME64_2);
        v2 = Uint64.rotl(v2, 31);
        v2 = Uint64.mul(v2, PRIME64_1);

        v3 = Uint64.mul(v3, PRIME64_2);
        v3 = Uint64.rotl(v3, 31);
        v3 = Uint64.mul(v3, PRIME64_1);

        v4 = Uint64.mul(v4, PRIME64_2);
        v4 = Uint64.rotl(v4, 31);
        v4 = Uint64.mul(v4, PRIME64_1);

        hash = Uint64.xor(hash, v1);
        hash = Uint64.mul(hash, PRIME64_1);
        hash = Uint64.xor(hash, v2);
        hash = Uint64.mul(hash, PRIME64_1);
        hash = Uint64.xor(hash, v3);
        hash = Uint64.mul(hash, PRIME64_1);
        hash = Uint64.xor(hash, v4);
        hash = Uint64.mul(hash, PRIME64_1);
    } else {
        hash = Uint64.add(seed64, PRIME64_5);
    }

    // 处理剩余的字节
    let remainingOffset = (len >= 32) ? Math.floor((len - 1) / 32) * 32 : 0;
    while (remainingOffset < len) {
        const octet = input[remainingOffset];
        const bit = new Uint64(0, octet);
        hash = Uint64.xor(hash, Uint64.mul(bit, PRIME64_5));
        hash = Uint64.rotl(hash, 11);
        hash = Uint64.mul(hash, PRIME64_1);
        remainingOffset++;
    }

    // 最终混合
    hash = Uint64.xor(hash, new Uint64(0, len));
    hash = Uint64.xor(hash, Uint64.and(hash, new Uint64(0xFFFFFFFF, 0x00000000)));
    hash = Uint64.mul(hash, PRIME64_2);
    hash = Uint64.xor(hash, Uint64.and(hash, new Uint64(0xFFFFFFFF, 0x00000000)));
    hash = Uint64.mul(hash, PRIME64_3);
    hash = Uint64.xor(hash, Uint64.and(hash, new Uint64(0xFFFFFFFF, 0x00000000)));

    return Uint64.toString(hash);
}