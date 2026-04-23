describe("getUserAgent", () => {
  let originalNavigator: any;

  beforeEach(() => {
    // 保存原始 navigator 对象
    originalNavigator = (global as any).navigator;
    
    // 删除可能存在的 navigator 对象
    delete (global as any).navigator;
    
    jest.resetModules();
  });

  afterEach(() => {
    // 恢复原始 navigator 对象
    if (originalNavigator) {
      (global as any).navigator = originalNavigator;
    } else {
      delete (global as any).navigator;
    }
  });

  it("应该返回浏览器的 navigator.userAgent", () => {
    // 模拟浏览器环境
    (global as any).navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    const { getUserAgent } = require("@/runtime/user-agent");
    
    expect(getUserAgent()).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  });

  it("应该在非浏览器环境中返回空字符串", () => {
    // 确保 navigator 不存在
    delete (global as any).navigator;

    const { getUserAgent } = require("@/runtime/user-agent");
    
    expect(getUserAgent()).toBe("");
  });
});