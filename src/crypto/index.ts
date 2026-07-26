/**
 * 加密哈希包 - 统一导出
 *
 * 提供 MD5、SHA-1、SHA-256、SHA-512、XXH64 哈希算法及 Base64 编解码
 *
 * @module crypto
 */

export { default as md5 } from './md5';
export { default as sha1 } from './sha1';
export { default as sha256 } from './sha256';
export { default as sha512 } from './sha512';
export { default as xxhash64 } from './xxhash64';
export { encode as base64Encode, decode as base64Decode } from './base64';
