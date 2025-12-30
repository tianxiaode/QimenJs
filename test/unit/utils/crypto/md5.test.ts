import md5 from '@/utils/crypto/md5';

describe('MD5加密功能测试', () => {
  it('应该正确计算空字符串的MD5值', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('应该正确计算普通字符串的MD5值', () => {
    expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
    expect(md5('world')).toBe('7d793037a0760186574b0282f2f435e7');
  });

  it('应该正确计算包含特殊字符的字符串的MD5值', () => {
    expect(md5('hello world!')).toBe('fc3ff98e8c6a0d3087d515c0473f8677');
    expect(md5('123456')).toBe('e10adc3949ba59abbe56e057f20f883e');
  });

  it('应该正确处理中文字符串', () => {
    expect(md5('你好')).toBe('f0a43d264ac22f74469d14bd09031cad');
    expect(md5('测试')).toBe('281909f51694a091a615e578f68cbab4');
  });

  it('应该抛出错误当输入不是字符串时', () => {
    expect(() => {
      // @ts-ignore - 测试错误情况
      md5(123);
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - 测试错误情况
      md5(null);
    }).toThrow(TypeError);
  });

  it('应该对相同输入返回相同MD5值', () => {
    const input = 'consistent test string';
    const result1 = md5(input);
    const result2 = md5(input);
    expect(result1).toBe(result2);
  });

  it('应该对不同输入返回不同MD5值', () => {
    const result1 = md5('string1');
    const result2 = md5('string2');
    expect(result1).not.toBe(result2);
  });
});