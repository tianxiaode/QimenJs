import { RegistryHub, Registry, RegistryHubError } from '@/registry';
import { MimeTypeRegistrar } from '@/registry/registrars';

describe('Registry Module Integration', () => {
  it('应该导出所有必要的组件', () => {
    expect(RegistryHub).toBeDefined();
    expect(Registry).toBeDefined();
    expect(RegistryHubError).toBeDefined();
  });

  it('应该自动注册默认注册器', () => {
    // 检查MimeTypeRegistrar是否已被自动注册
    const mimeTypeRegistrar = RegistryHub.get<MimeTypeRegistrar>('mimeType');
    expect(mimeTypeRegistrar).toBeDefined();
    expect(mimeTypeRegistrar).toBeInstanceOf(MimeTypeRegistrar);
  });

  it('应该可以通过Registry代理访问注册器', () => {
    // 检查是否可以通过Registry代理访问MimeTypeRegistrar
    const mimeTypeRegistrar = (Registry as any).mimeType;
    expect(mimeTypeRegistrar).toBeDefined();
  });
});