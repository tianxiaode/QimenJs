/**
 * MD5加密工具函数
 * 提供字符串的MD5哈希功能
 */

/**
 * 计算字符串的MD5哈希值
 * @param str - 需要计算哈希值的字符串
 * @returns MD5哈希值（32位十六进制字符串）
 */
export default function md5(str: string): string {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }

  // 使用Web Crypto API（如果可用）或回退到纯JavaScript实现
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // 使用Web Crypto API进行SHA-256哈希，然后转换为MD5效果的模拟
    // 但由于Web Crypto API不直接支持MD5，我们使用纯JavaScript实现
    return calculateMd5(str);
  }

  // 纯JavaScript MD5实现
  return calculateMd5(str);
}

/**
 * 纯JavaScript实现MD5算法
 * @param string - 需要计算哈希值的字符串
 * @returns MD5哈希值
 */
function calculateMd5(string: string): string {
  // UTF-8编码
  function utf8Encode(str: string): Uint8Array {
    const utf8Str = unescape(encodeURIComponent(str));
    const result = new Uint8Array(utf8Str.length);
    for (let i = 0; i < utf8Str.length; i++) {
      result[i] = utf8Str.charCodeAt(i);
    }
    return result;
  }

  // 旋转函数
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }

  // 四个辅助函数
  function F(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }

  function G(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }

  function H(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }

  function I(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  // 将整数转换为无符号
  function toUnsigned(n: number): number {
    return n < 0 ? n + 4294967296 : n;
  }

  // 初始化缓冲区
  const x = utf8Encode(string);
  let k: number, AA: number, BB: number, CC: number, DD: number, a: number, b: number, c: number, d: number;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  // 初始化缓冲区A、B、C、D
  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;

  // 处理字符串，每次处理64字节（512位）
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;

    // 第一轮
    a = FF(a, b, c, d, toWord(x, k + 0), S11, 0xd76aa478);
    d = FF(d, a, b, c, toWord(x, k + 1), S12, 0xe8c7b756);
    c = FF(c, d, a, b, toWord(x, k + 2), S13, 0x242070db);
    b = FF(b, c, d, a, toWord(x, k + 3), S14, 0xc1bdceee);
    a = FF(a, b, c, d, toWord(x, k + 4), S11, 0xf57c0faf);
    d = FF(d, a, b, c, toWord(x, k + 5), S12, 0x4787c62a);
    c = FF(c, d, a, b, toWord(x, k + 6), S13, 0xa8304613);
    b = FF(b, c, d, a, toWord(x, k + 7), S14, 0xfd469501);
    a = FF(a, b, c, d, toWord(x, k + 8), S11, 0x698098d8);
    d = FF(d, a, b, c, toWord(x, k + 9), S12, 0x8b44f7af);
    c = FF(c, d, a, b, toWord(x, k + 10), S13, 0xffff5bb1);
    b = FF(b, c, d, a, toWord(x, k + 11), S14, 0x895cd7be);
    a = FF(a, b, c, d, toWord(x, k + 12), S11, 0x6b901122);
    d = FF(d, a, b, c, toWord(x, k + 13), S12, 0xfd987193);
    c = FF(c, d, a, b, toWord(x, k + 14), S13, 0xa679438e);
    b = FF(b, c, d, a, toWord(x, k + 15), S14, 0x49b40821);

    // 第二轮
    a = GG(a, b, c, d, toWord(x, k + 1), S21, 0xf61e2562);
    d = GG(d, a, b, c, toWord(x, k + 6), S22, 0xc040b340);
    c = GG(c, d, a, b, toWord(x, k + 11), S23, 0x265e5a51);
    b = GG(b, c, d, a, toWord(x, k + 0), S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, toWord(x, k + 5), S21, 0xd62f105d);
    d = GG(d, a, b, c, toWord(x, k + 10), S22, 0x2441453);
    c = GG(c, d, a, b, toWord(x, k + 15), S23, 0xd8a1e681);
    b = GG(b, c, d, a, toWord(x, k + 4), S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, toWord(x, k + 9), S21, 0x21e1cde6);
    d = GG(d, a, b, c, toWord(x, k + 14), S22, 0xc33707d6);
    c = GG(c, d, a, b, toWord(x, k + 3), S23, 0xf4d50d87);
    b = GG(b, c, d, a, toWord(x, k + 8), S24, 0x455a14ed);
    a = GG(a, b, c, d, toWord(x, k + 13), S21, 0xa9e3e905);
    d = GG(d, a, b, c, toWord(x, k + 2), S22, 0xfcefa3f8);
    c = GG(c, d, a, b, toWord(x, k + 7), S23, 0x676f02d9);
    b = GG(b, c, d, a, toWord(x, k + 12), S24, 0x8d2a4c8a);

    // 第三轮
    a = HH(a, b, c, d, toWord(x, k + 5), S31, 0xfffa3942);
    d = HH(d, a, b, c, toWord(x, k + 8), S32, 0x8771f681);
    c = HH(c, d, a, b, toWord(x, k + 11), S31, 0x6d9d6122);
    b = HH(b, c, d, a, toWord(x, k + 14), S32, 0xfde5380c);
    a = HH(a, b, c, d, toWord(x, k + 1), S33, 0xa4beea44);
    d = HH(d, a, b, c, toWord(x, k + 4), S32, 0x4bdecfa9);
    c = HH(c, d, a, b, toWord(x, k + 7), S33, 0xf6bb4b60);
    b = HH(b, c, d, a, toWord(x, k + 10), S32, 0xbebfbc70);
    a = HH(a, b, c, d, toWord(x, k + 13), S33, 0x289b7ec6);
    d = HH(d, a, b, c, toWord(x, k + 0), S32, 0xeaa127fa);
    c = HH(c, d, a, b, toWord(x, k + 3), S33, 0xd4ef3085);
    b = HH(b, c, d, a, toWord(x, k + 6), S32, 0x4881d05);
    a = HH(a, b, c, d, toWord(x, k + 9), S33, 0xd9d4d039);
    d = HH(d, a, b, c, toWord(x, k + 12), S32, 0xe6db99e5);
    c = HH(c, d, a, b, toWord(x, k + 15), S33, 0x1fa27cf8);
    b = HH(b, c, d, a, toWord(x, k + 2), S32, 0xc4ac5665);

    // 第四轮
    a = II(a, b, c, d, toWord(x, k + 0), S41, 0xf4292244);
    d = II(d, a, b, c, toWord(x, k + 7), S42, 0x432aff97);
    c = II(c, d, a, b, toWord(x, k + 14), S41, 0xab9423a7);
    b = II(b, c, d, a, toWord(x, k + 5), S42, 0xfc93a039);
    a = II(a, b, c, d, toWord(x, k + 12), S41, 0x655b59c3);
    d = II(d, a, b, c, toWord(x, k + 3), S42, 0x8f0ccc92);
    c = II(c, d, a, b, toWord(x, k + 10), S41, 0xffeff47d);
    b = II(b, c, d, a, toWord(x, k + 1), S42, 0x85845dd1);
    a = II(a, b, c, d, toWord(x, k + 8), S41, 0x6fa87e4f);
    d = II(d, a, b, c, toWord(x, k + 15), S42, 0xfe2ce6e0);
    c = II(c, d, a, b, toWord(x, k + 6), S41, 0xa3014314);
    b = II(b, c, d, a, toWord(x, k + 13), S42, 0x4e0811a1);
    a = II(a, b, c, d, toWord(x, k + 4), S41, 0xf7537e82);
    d = II(d, a, b, c, toWord(x, k + 11), S42, 0xbd3af235);
    c = II(c, d, a, b, toWord(x, k + 2), S41, 0x2ad7d2bb);
    b = II(b, c, d, a, toWord(x, k + 9), S42, 0xeb86d391);

    a = toUnsigned(a + AA);
    b = toUnsigned(b + BB);
    c = toUnsigned(c + CC);
    d = toUnsigned(d + DD);
  }

  // 将结果转换为16进制字符串
  const result = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return result.toLowerCase();
  
  // 将字节序列转换为32位字
  function toWord(bytes: Uint8Array, offset: number): number {
    offset *= 4;
    return (
      (bytes[offset] || 0) |
      ((bytes[offset + 1] || 0) << 8) |
      ((bytes[offset + 2] || 0) << 16) |
      ((bytes[offset + 3] || 0) << 24)
    );
  }

  // 第一轮操作函数
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    let res = F(b, c, d) + a + x + ac;
    res = rotateLeft(res, s);
    res = toUnsigned(res + b);
    return res;
  }

  // 第二轮操作函数
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    let res = G(b, c, d) + a + x + ac;
    res = rotateLeft(res, s);
    res = toUnsigned(res + b);
    return res;
  }

  // 第三轮操作函数
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    let res = H(b, c, d) + a + x + ac;
    res = rotateLeft(res, s);
    res = toUnsigned(res + b);
    return res;
  }

  // 第四轮操作函数
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    let res = I(b, c, d) + a + x + ac;
    res = rotateLeft(res, s);
    res = toUnsigned(res + b);
    return res;
  }

  // 将字转换为16进制
  function wordToHex(lValue: number): string {
    let wordToHexValue = '';
    let wordToHexValueTemp = '';
    for (let l = 0; l <= 3; l++) {
      const lByte = (lValue >>> (l * 8)) & 255;
      wordToHexValueTemp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }
}