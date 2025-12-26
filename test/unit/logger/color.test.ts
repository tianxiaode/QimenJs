import { colorLevel } from '@/logger/color';

describe('colorLevel', () => {
  // 测试 1: 颜色禁用时返回原始级别
  test('should return original level when color is disabled', () => {
    expect(colorLevel('DEBUG', false)).toBe('DEBUG');
    expect(colorLevel('WARN', false)).toBe('WARN');
    expect(colorLevel('ERROR', false)).toBe('ERROR');
    expect(colorLevel('INFO', false)).toBe('INFO'); // 未定义的颜色级别
  });

  // 测试 2: 颜色启用时为预定义级别添加颜色
  test('should add color for predefined levels when enabled', () => {
    const reset = '\x1b[0m';
    
    expect(colorLevel('DEBUG', true)).toBe(`\x1b[90mDEBUG${reset}`);
    expect(colorLevel('WARN', true)).toBe(`\x1b[33mWARN${reset}`);
    expect(colorLevel('ERROR', true)).toBe(`\x1b[31mERROR${reset}`);
  });

  // 测试 3: 颜色启用时对未定义级别返回原始字符串
  test('should return original level for undefined color when enabled', () => {
    expect(colorLevel('INFO', true)).toBe('INFO');
    expect(colorLevel('TRACE', true)).toBe('TRACE');
    expect(colorLevel('', true)).toBe('');
  });

  // 测试 4: 边界情况测试
  describe('edge cases', () => {
    test('should handle empty string level', () => {
      expect(colorLevel('', false)).toBe('');
      expect(colorLevel('', true)).toBe('');
    });

    test('should handle case-sensitive levels', () => {
      // 注意：当前实现是大小写敏感的
      expect(colorLevel('debug', true)).toBe('debug'); // 小写
      expect(colorLevel('Warn', true)).toBe('Warn');   // 混合大小写
    });

    test('should handle special characters in level', () => {
      expect(colorLevel('DEBUG-2', true)).toBe('DEBUG-2');
      expect(colorLevel('ERROR!', true)).toBe('ERROR!');
    });
  });

  // 测试 5: 确保颜色代码正确
  test('should use correct ANSI color codes', () => {
    const result = colorLevel('ERROR', true);
    // 检查是否包含正确的颜色代码和重置代码
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('\x1b[0m');
    expect(result).toMatch(/^\x1b\[31mERROR\x1b\[0m$/);
  });

  // 测试 6: 参数类型测试
  test('should handle different parameter types', () => {
    // 这些测试确保函数对类型安全，实际使用时应该由TypeScript编译器检查
    // 但我们可以测试一些边缘情况
    expect(colorLevel('DEBUG', true as boolean)).toBe(`\x1b[90mDEBUG\x1b[0m`);
    expect(colorLevel('WARN', Boolean(1) as boolean)).toBe(`\x1b[33mWARN\x1b[0m`);
  });

  // 测试 7: 验证INFO级别不会被着色
  test('should not colorize INFO level even when enabled', () => {
    expect(colorLevel('INFO', true)).toBe('INFO');
    expect(colorLevel('INFO', false)).toBe('INFO');
  });

  // 测试 8: 验证所有支持的颜色级别
  test('should colorize all supported levels', () => {
    const reset = '\x1b[0m';
    
    expect(colorLevel('DEBUG', true)).toBe(`\x1b[90mDEBUG${reset}`);
    expect(colorLevel('WARN', true)).toBe(`\x1b[33mWARN${reset}`);
    expect(colorLevel('ERROR', true)).toBe(`\x1b[31mERROR${reset}`);
  });

  // 测试 9: 验证颜色禁用时所有级别都不被着色
  test('should not colorize any levels when disabled', () => {
    expect(colorLevel('DEBUG', false)).toBe('DEBUG');
    expect(colorLevel('WARN', false)).toBe('WARN');
    expect(colorLevel('ERROR', false)).toBe('ERROR');
    expect(colorLevel('INFO', false)).toBe('INFO');
  });
});