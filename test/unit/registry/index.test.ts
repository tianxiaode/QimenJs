import { RegistryHub, Registry, RegistryHubError } from '@/registry';
import { DomainRegistrar } from '@/registry/registrars';

describe('Registry Module Integration', () => {
  it('应该导出所有必要的组件', () => {
    expect(RegistryHub).toBeDefined();
    expect(Registry).toBeDefined();
    expect(RegistryHubError).toBeDefined();
  });

  it('应该自动注册默认注册器', () => {
    // 检查DomainRegistrar是否已被自动注册
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    expect(domainRegistrar).toBeDefined();
    expect(domainRegistrar).toBeInstanceOf(DomainRegistrar);
  });

  it('应该可以通过Registry代理访问注册器', () => {
    // 检查是否可以通过Registry代理访问DomainRegistrar
    const domainRegistrar = (Registry as any).domain;
    expect(domainRegistrar).toBeDefined();
  });
});
