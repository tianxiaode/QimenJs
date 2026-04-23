/**
 * SHA-1哈希算法实现
 * 提供字符串的SHA-1哈希功能
 */

/**
 * 计算字符串的SHA-1哈希值
 * @param str - 需要计算哈希值的字符串
 * @returns SHA-1哈希值（40位十六进制字符串）
 */
export default function sha1(str: string): string {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }

    return calculateSHA1(str);
}

/**
 * 纯JavaScript实现SHA-1算法
 * @param str - 需要计算哈希值的字符串
 * @returns SHA-1哈希值
 */
function calculateSHA1(str: string): string {
    // 将字符串转换为UTF-8字节数组
    function str2rstrUTF8(input: string): Uint8Array {
        const utf8Str = unescape(encodeURIComponent(input));
        const result = new Uint8Array(utf8Str.length);
        for (let i = 0; i < utf8Str.length; i++) {
            result[i] = utf8Str.charCodeAt(i);
        }
        return result;
    }

    // 填充消息
    function padMessage(msg: Uint8Array): Uint32Array {
        const bitLen = msg.length * 8;
        msg[bitLen >> 3] |= 0x80; // 添加1位到末尾

        const n = ((msg.length + 8) >> 6) + 1;
        const expanded = new Uint32Array(n * 16); // 16个32位字（即64个字节）
        
        for (let i = 0; i < msg.length; i++) {
            expanded[i >> 2] |= msg[i] << (24 - (i % 4) * 8);
        }

        // 最后64位存放原始消息长度
        expanded[n * 16 - 1] = bitLen;
        return expanded;
    }

    // 将32位整数转换为十六进制字符串，保持小端序
    function binToHex(bin: Uint32Array): string {
        const hex = [];
        for (let i = 0; i < bin.length; i++) {
            const block = bin[i];
            const slice = block.toString(16).padStart(8, '0');
            hex.push(slice);
        }
        return hex.join('');
    }

    // 右旋转函数
    function rotr(x: number, n: number): number {
        return (x >>> n) | (x << (32 - n));
    }

    // SHA-1主算法
    const msgBytes = str2rstrUTF8(str);
    const expanded = padMessage(msgBytes);

    // 初始化哈希值
    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;
    let h4 = 0xC3D2E1F0;

    // 主循环
    for (let i = 0; i < expanded.length; i += 16) {
        const w = new Uint32Array(80);
        
        // 复制前16个字
        for (let j = 0; j < 16; j++) {
            w[j] = expanded[i + j];
        }

        // 扩展到80个字
        for (let j = 16; j < 80; j++) {
            w[j] = rotr(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;

        // 主压缩函数
        for (let j = 0; j < 80; j++) {
            let f, k;
            if (j < 20) {
                f = (b & c) | (~b & d);
                k = 0x5A827999;
            } else if (j < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            } else if (j < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8F1BBCDC;
            } else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }

            const temp = (rotr(a, 5) + f + e + k + w[j]) | 0;
            e = d;
            d = c;
            c = rotr(b, 30);
            b = a;
            a = temp;
        }

        // 添加到当前哈希值
        h0 = (h0 + a) | 0;
        h1 = (h1 + b) | 0;
        h2 = (h2 + c) | 0;
        h3 = (h3 + d) | 0;
        h4 = (h4 + e) | 0;
    }

    // 组合哈希值
    const hashArray = new Uint32Array(5);
    hashArray[0] = h0;
    hashArray[1] = h1;
    hashArray[2] = h2;
    hashArray[3] = h3;
    hashArray[4] = h4;

    return binToHex(hashArray);
}