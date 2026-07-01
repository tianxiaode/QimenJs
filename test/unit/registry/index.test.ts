import { RegistryHub, Registry, RegistryHubError } from '@/registry';
import { PatternRegistrar } from '@/registry/registrars';

describe('Registry Module Integration', () => {
  it('应该导出所有必要的组件', () => {
    expect(RegistryHub).toBeDefined();
    expect(Registry).toBeDefined();
    expect(RegistryHubError).toBeDefined();
  });

  it('应该自动注册默认注册器', () => {
    // 检查PatternRegistrar是否已被自动注册
    const patternRegistrar = RegistryHub.get<PatternRegistrar>('pattern');
    expect(patternRegistrar).toBeDefined();
    expect(patternRegistrar).toBeInstanceOf(PatternRegistrar);
  });

  it('应该可以通过Registry代理访问注册器', () => {
    // 检查是否可以通过Registry代理访问PatternRegistrar
    const patternRegistrar = (Registry as any).pattern;
    expect(patternRegistrar).toBeDefined();
  });
});
