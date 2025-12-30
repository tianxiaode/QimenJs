import base64 from '@/utils/crypto/base64';

describe('Base64编码解码功能测试', () => {
  it('应该正确编码普通字符串', () => {
    expect(base64.encode('hello')).toBe('aGVsbG8=');
    expect(base64.encode('world')).toBe('d29ybGQ=');
  });

  it('应该正确解码Base64字符串', () => {
    expect(base64.decode('aGVsbG8=')).toBe('hello');
    expect(base64.decode('d29ybGQ=')).toBe('world');
  });

  it('应该正确处理空字符串', () => {
    expect(base64.encode('')).toBe('');
    expect(base64.decode('')).toBe('');
  });

  it('应该正确编码和解码包含特殊字符的字符串', () => {
    const specialStr = 'hello@world!';
    const encoded = base64.encode(specialStr);
    const decoded = base64.decode(encoded);
    expect(decoded).toBe(specialStr);
  });

  it('应该正确处理中文字符串', () => {
    const chineseStr = '你好世界';
    const encoded = base64.encode(chineseStr);
    const decoded = base64.decode(encoded);
    expect(decoded).toBe(chineseStr);
  });

  it('应该正确处理数字字符串', () => {
    const numStr = '123456';
    const encoded = base64.encode(numStr);
    const decoded = base64.decode(encoded);
    expect(decoded).toBe(numStr);
  });

  it('应该编码后能够正确解码回原始字符串', () => {
    const testCases = [
      'test string',
      'Hello World!',
      '12345!@#$%',
      '多字节字符: 中文',
      'Emoji: 👋🚀',
      'Line\nbreaks\r\nand\ttabs'
    ];

    testCases.forEach(testCase => {
      const encoded = base64.encode(testCase);
      const decoded = base64.decode(encoded);
      expect(decoded).toBe(testCase);
    });
  });

  it('应该抛出错误当输入不是字符串时', () => {
    expect(() => {
      // @ts-ignore - 测试错误情况
      base64.encode(123);
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - 测试错误情况
      base64.decode(123);
    }).toThrow(TypeError);
  });

  it('应该处理错误的Base64字符串', () => {
    // 即使是无效的Base64字符串也应该能处理，只是结果可能不是预期
    expect(() => base64.decode('invalid_base64')).not.toThrow();
    // 解码无效字符串应返回空字符串
    expect(base64.decode('invalid_base64')).toBe('');
  });
});