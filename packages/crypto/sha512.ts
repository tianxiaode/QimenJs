/**
 * SHA-512哈希算法实现
 * 提供字符串的SHA-512哈希功能
 */

/**
 * 计算字符串的SHA-512哈希值
 * @param str - 需要计算哈希值的字符串
 * @returns SHA-512哈希值（128位十六进制字符串）
 */
export default function sha512(str: string): string {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }

    return calculateSHA512(str);
}

/**
 * 纯JavaScript实现SHA-512算法
 * @param str - 需要计算哈希值的字符串
 * @returns SHA-512哈希值
 */
function calculateSHA512(str: string): string {
    // 将字符串转换为UTF-8字节数组
    function str2rstrUTF8(input: string): Uint8Array {
        const utf8Str = unescape(encodeURIComponent(input));
        const result = new Uint8Array(utf8Str.length);
        for (let i = 0; i < utf8Str.length; i++) {
            result[i] = utf8Str.charCodeAt(i);
        }
        return result;
    }

    // 64位无符号整数运算辅助类
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
            const carry = lo < a.lo ? 1 : 0; // 检查是否有进位
            const hi = (a.hi + b.hi + carry) >>> 0;
            return new Uint64(hi, lo);
        }

        // 右旋转
        static rotr(x: Uint64, n: number): Uint64 {
            n %= 64; // 确保旋转位数在0-63之间
            if (n === 0) return new Uint64(x.hi, x.lo);
            if (n < 32) {
                return new Uint64(
                    (x.hi >>> n) | (x.lo << (32 - n)),
                    (x.lo >>> n) | (x.hi << (32 - n))
                );
            } else {
                // n >= 32: 交换高低32位并旋转剩余位数
                const remaining = n - 32;
                return new Uint64(
                    (x.lo >>> remaining) | (x.hi << (32 - remaining)),
                    (x.hi >>> remaining) | (x.lo << (32 - remaining))
                );
            }
        }

        // 右移
        static shr(x: Uint64, n: number): Uint64 {
            n %= 64; // 确保移动位数在0-63之间
            if (n === 0) return new Uint64(x.hi, x.lo);
            if (n < 32) {
                return new Uint64(
                    (x.hi >>> n) | (x.lo << (32 - n)),
                    x.lo >>> n
                );
            } else {
                return new Uint64(
                    x.lo >>> (n - 32),
                    0
                );
            }
        }

        // 与操作
        static and(x: Uint64, y: Uint64): Uint64 {
            return new Uint64(x.hi & y.hi, x.lo & y.lo);
        }

        // 或操作
        static or(x: Uint64, y: Uint64): Uint64 {
            return new Uint64(x.hi | y.hi, x.lo | y.lo);
        }

        // 异或操作
        static xor(x: Uint64, y: Uint64): Uint64 {
            return new Uint64(x.hi ^ y.hi, x.lo ^ y.lo);
        }

        // 转换为十六进制字符串
        static toString(x: Uint64): string {
            return x.hi.toString(16).padStart(8, '0') + x.lo.toString(16).padStart(8, '0');
        }
    }

    // 填充消息
    function padMessage(msg: Uint8Array): Uint32Array {
        const bitLen = msg.length * 8;
        // 添加1位到末尾
        const msgLen = msg.length;
        const newLen = Math.ceil((msgLen + 1 + 16) / 128) * 128; // 128字节对齐
        const result = new Uint8Array(newLen);
        result.set(msg, 0);
        result[msgLen] |= 0x80; // 添加1位到末尾

        // 最后128位存放原始消息长度
        const lenHi = Math.floor((bitLen) / 0x100000000) >>> 0;
        const lenLo = bitLen >>> 0;
        const lenOffset = newLen - 16;
        result[lenOffset + 0] = (lenHi >>> 24) & 0xFF;
        result[lenOffset + 1] = (lenHi >>> 16) & 0xFF;
        result[lenOffset + 2] = (lenHi >>> 8) & 0xFF;
        result[lenOffset + 3] = lenHi & 0xFF;
        result[lenOffset + 4] = (lenLo >>> 24) & 0xFF;
        result[lenOffset + 5] = (lenLo >>> 16) & 0xFF;
        result[lenOffset + 6] = (lenLo >>> 8) & 0xFF;
        result[lenOffset + 7] = lenLo & 0xFF;

        // 转换为32位数组
        const expanded = new Uint32Array(newLen / 4);
        for (let i = 0; i < newLen; i += 4) {
            expanded[i >> 2] = (result[i] << 24) | (result[i + 1] << 16) | (result[i + 2] << 8) | result[i + 3];
        }
        return expanded;
    }

    // 将32位数组转换为64位数组
    function uint32ArrayToUint64Array(arr: Uint32Array): Uint64[] {
        const result: Uint64[] = [];
        for (let i = 0; i < arr.length; i += 2) {
            result.push(new Uint64(arr[i], arr[i + 1]));
        }
        return result;
    }

    // SHA-512常量
    const K = [
        new Uint64(0x428a2f98, 0xd728ae22), new Uint64(0x71374491, 0x23ef65cd),
        new Uint64(0xb5c0fbcf, 0xec4d3b2f), new Uint64(0xe9b5dba5, 0x8189dbbc),
        new Uint64(0x3956c25b, 0xf348b538), new Uint64(0x59f111f1, 0xb605d019),
        new Uint64(0x923f82a4, 0xaf194f9b), new Uint64(0xab1c5ed5, 0xda6d8118),
        new Uint64(0xd807aa98, 0xa3030242), new Uint64(0x12835b01, 0x45706fbe),
        new Uint64(0x243185be, 0x4ee4b28c), new Uint64(0x550c7dc3, 0xd5ffb4e2),
        new Uint64(0x72be5d74, 0xf27b896f), new Uint64(0x80deb1fe, 0x3b1696b1),
        new Uint64(0x9bdc06a7, 0x25c71235), new Uint64(0xc19bf174, 0xcf692694),
        new Uint64(0xe49b69c1, 0x9ef14ad2), new Uint64(0xefbe4786, 0x384f25e3),
        new Uint64(0x0fc19dc6, 0x8b8cd5b5), new Uint64(0x240ca1cc, 0x77ac9c65),
        new Uint64(0x2de92c6f, 0x592b0275), new Uint64(0x4a7484aa, 0x6ea6e483),
        new Uint64(0x5cb0a9dc, 0xbd41fbd4), new Uint64(0x76f988da, 0x831153b5),
        new Uint64(0x983e5152, 0xee66dfab), new Uint64(0xa831c66d, 0x2db43210),
        new Uint64(0xb00327c8, 0x98fb213f), new Uint64(0xbf597fc7, 0xbeef0ee4),
        new Uint64(0xc6e00bf3, 0x3da88fc2), new Uint64(0xd5a79147, 0x930aa725),
        new Uint64(0x06ca6351, 0xe003826f), new Uint64(0x14292967, 0x0a0e6e70),
        new Uint64(0x27b70a85, 0x46d22ffc), new Uint64(0x2e1b2138, 0x5c26c926),
        new Uint64(0x4d2c6dfc, 0x5ac42aed), new Uint64(0x53380d13, 0x9d95b3df),
        new Uint64(0x650a7354, 0x8baf63de), new Uint64(0x766a0abb, 0x3c77b2a8),
        new Uint64(0x81c2c92e, 0x47edaee6), new Uint64(0x92722c85, 0x1482353b),
        new Uint64(0xa2bfe8a1, 0x4cf10364), new Uint64(0xa81a664b, 0xbc423001),
        new Uint64(0xc24b8b70, 0xd0f89791), new Uint64(0xc76c51a3, 0x0654be30),
        new Uint64(0xd192e819, 0xd6ef5218), new Uint64(0xd6990624, 0x5565a910),
        new Uint64(0xf40e3585, 0x5771202a), new Uint64(0x106aa070, 0x32bbd1b8),
        new Uint64(0x19a4c116, 0xb8d2d0c8), new Uint64(0x1e376c08, 0x5141ab53),
        new Uint64(0x2748774c, 0xdf8eeb99), new Uint64(0x34b0bcb5, 0xe19b48a8),
        new Uint64(0x391c0cb3, 0xc5c95a63), new Uint64(0x4ed8aa4a, 0xe3418acb),
        new Uint64(0x5b9cca4f, 0x7763e373), new Uint64(0x682e6ff3, 0xd6b2b8a3),
        new Uint64(0x748f82ee, 0x5defb2fc), new Uint64(0x78a5636f, 0x43172f60),
        new Uint64(0x84c87814, 0xa1f0ab72), new Uint64(0x8cc70208, 0x1a6439ec),
        new Uint64(0x90befffa, 0x23631e28), new Uint64(0xa4506ceb, 0xde82bde9),
        new Uint64(0xbef9a3f7, 0xb2c67915), new Uint64(0xc67178f2, 0xe372532b),
        new Uint64(0xca273ece, 0xea26619c), new Uint64(0xd186b8c7, 0x21c0c207),
        new Uint64(0xeada7dd6, 0xcde0eb1e), new Uint64(0xf57d4f7f, 0xee6ed178),
        new Uint64(0x06f067aa, 0x72176fba), new Uint64(0x0a637dc5, 0xa2c898a6),
        new Uint64(0x113f9804, 0xbef90dae), new Uint64(0x1b710b35, 0x131c471b),
        new Uint64(0x28db77f5, 0x23047d84), new Uint64(0x32caab7b, 0x40c72493),
        new Uint64(0x3c9ebe0a, 0x15c9bebc), new Uint64(0x431d67c4, 0x9c100d4c),
        new Uint64(0x4cc5d4be, 0xcb3e42b6), new Uint64(0x597f299c, 0xfc657e2a),
        new Uint64(0x5fcb6fab, 0x3ad6faec), new Uint64(0x6c44198c, 0x4a475817)
    ];

    // SHA-512主算法
    const msgBytes = str2rstrUTF8(str);
    const expanded = padMessage(msgBytes);
    const msg64 = uint32ArrayToUint64Array(expanded);

    // 初始化哈希值
    const h = [
        new Uint64(0x6a09e667, 0xf3bcc908), new Uint64(0xbb67ae85, 0x84caa73b),
        new Uint64(0x3c6ef372, 0xfe94f82b), new Uint64(0xa54ff53a, 0x5f1d36f1),
        new Uint64(0x510e527f, 0xade682d1), new Uint64(0x9b05688c, 0x2b3e6c1f),
        new Uint64(0x1f83d9ab, 0xfb41bd6b), new Uint64(0x5be0cd19, 0x137e2179)
    ];

    // 主循环
    for (let i = 0; i < msg64.length; i += 16) {
        const w = new Array<Uint64>(80);
        
        // 复制前16个字
        for (let j = 0; j < 16; j++) {
            w[j] = msg64[i + j];
        }

        // 扩展到80个字
        for (let j = 16; j < 80; j++) {
            const s0 = Uint64.xor(
                Uint64.xor(
                    Uint64.rotr(w[j - 15], 1),
                    Uint64.rotr(w[j - 15], 8)
                ),
                Uint64.shr(w[j - 15], 7)
            );
            const s1 = Uint64.xor(
                Uint64.xor(
                    Uint64.rotr(w[j - 2], 19),
                    Uint64.rotr(w[j - 2], 61)
                ),
                Uint64.shr(w[j - 2], 6)
            );
            w[j] = Uint64.add(
                Uint64.add(
                    Uint64.add(w[j - 16], s0),
                    w[j - 7]
                ),
                s1
            );
        }

        let a = h[0];
        let b = h[1];
        let c = h[2];
        let d = h[3];
        let e = h[4];
        let f = h[5];
        let g = h[6];
        let h_val = h[7];

        // 主压缩函数
        for (let j = 0; j < 80; j++) {
            const S1 = Uint64.xor(
                Uint64.xor(
                    Uint64.rotr(e, 14),
                    Uint64.rotr(e, 18)
                ),
                Uint64.rotr(e, 41)
            );
            const ch = Uint64.xor(
                Uint64.and(e, f),
                Uint64.and(Uint64.xor(e, new Uint64(0xFFFFFFFF, 0xFFFFFFFF)), g)
            );
            const temp1 = Uint64.add(
                Uint64.add(
                    Uint64.add(
                        Uint64.add(h_val, S1),
                        ch
                    ),
                    K[j]
                ),
                w[j]
            );
            const S0 = Uint64.xor(
                Uint64.xor(
                    Uint64.rotr(a, 28),
                    Uint64.rotr(a, 34)
                ),
                Uint64.rotr(a, 39)
            );
            const maj = Uint64.xor(
                Uint64.xor(
                    Uint64.and(a, b),
                    Uint64.and(a, c)
                ),
                Uint64.and(b, c)
            );
            const temp2 = Uint64.add(S0, maj);

            h_val = g;
            g = f;
            f = e;
            e = Uint64.add(d, temp1);
            d = c;
            c = b;
            b = a;
            a = Uint64.add(temp1, temp2);
        }

        // 添加到当前哈希值
        h[0] = Uint64.add(h[0], a);
        h[1] = Uint64.add(h[1], b);
        h[2] = Uint64.add(h[2], c);
        h[3] = Uint64.add(h[3], d);
        h[4] = Uint64.add(h[4], e);
        h[5] = Uint64.add(h[5], f);
        h[6] = Uint64.add(h[6], g);
        h[7] = Uint64.add(h[7], h_val);
    }

    // 组合哈希值
    return Uint64.toString(h[0]) + 
           Uint64.toString(h[1]) + 
           Uint64.toString(h[2]) + 
           Uint64.toString(h[3]) + 
           Uint64.toString(h[4]) + 
           Uint64.toString(h[5]) + 
           Uint64.toString(h[6]) + 
           Uint64.toString(h[7]);
}