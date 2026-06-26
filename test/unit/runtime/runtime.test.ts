describe("getRuntimeEnv", () => {
  let originalWindow: any;
  let originalNavigator: any;
  let originalIntl: any;

  beforeEach(() => {
    // 保存原始对象
    originalWindow = (global as any).window;
    originalNavigator = (global as any).navigator;
    originalIntl = (global as any).Intl;
    
    // 删除可能存在的全局对象
    delete (global as any).window;
    delete (global as any).navigator;
    delete (global as any).Intl;
    
    jest.resetModules();
  });

  afterEach(() => {
    // 恢复原始对象
    if (originalWindow) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }
    
    if (originalNavigator) {
      (global as any).navigator = originalNavigator;
    } else {
      delete (global as any).navigator;
    }
    
    if (originalIntl) {
      (global as any).Intl = originalIntl;
    } else {
      delete (global as any).Intl;
    }
  });

  it("应该返回包含 locale、timezone 和 platform 的对象", () => {
    // 模拟浏览器环境
    (global as any).window = { document: { URL: '', title: '', createElement: () => {} } };
    
    (global as any).navigator = {
      language: 'en-US',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      appCodeName: 'Mozilla',
      appName: 'Netscape',
      appVersion: '5.0 (Windows)',
      cookieEnabled: true,
      onLine: true,
      platform: 'Win32',
      product: 'Gecko',
      vendor: 'Google Inc.',
    };
    
    // 模拟 Intl.DateTimeFormat
    const mockResolvedOptions = jest.fn().mockReturnValue({ timeZone: 'Asia/Shanghai' });
    (global as any).Intl = {
      DateTimeFormat: jest.fn().mockImplementation(() => ({
        resolvedOptions: mockResolvedOptions
      }))
    };

    const { getRuntimeEnv } = require("@/runtime/runtime");
    const runtimeEnv = getRuntimeEnv();
    
    expect(runtimeEnv).toHaveProperty('locale');
    expect(runtimeEnv).toHaveProperty('timezone');
    expect(runtimeEnv).toHaveProperty('platform');
    
    expect(typeof runtimeEnv.locale).toBe('string');
    expect(typeof runtimeEnv.timezone).toBe('string');
    expect(typeof runtimeEnv.platform).toBe('string');
  });

  it("应该正确整合各个环境信息", () => {
    // 模拟浏览器环境
    (global as any).window = { document: { URL: '', title: '', createElement: () => {} } };
    
    (global as any).navigator = {
      language: 'fr-FR',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      appCodeName: 'Mozilla',
      appName: 'Netscape',
      appVersion: '5.0 (Macintosh)',
      cookieEnabled: true,
      onLine: true,
      platform: 'MacIntel',
      product: 'Gecko',
      vendor: 'Apple Computer, Inc.',
    };
    
    // 模拟 Intl.DateTimeFormat
    const mockResolvedOptions = jest.fn().mockReturnValue({ timeZone: 'Europe/Paris' });
    (global as any).Intl = {
      DateTimeFormat: jest.fn().mockImplementation(() => ({
        resolvedOptions: mockResolvedOptions
      }))
    };

    const { getRuntimeEnv } = require("@/runtime/runtime");
    const runtimeEnv = getRuntimeEnv();
    
    expect(runtimeEnv.locale).toBe('fr-FR');
    expect(runtimeEnv.timezone).toBe('Europe/Paris');
    expect(runtimeEnv.platform).toBe('browser');
  });
});