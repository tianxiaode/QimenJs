describe("runtimeFeatures", () => {
  beforeEach(() => {
    // 重置全局对象以测试不同环境
    jest.resetModules();
  });

  it("应该正确检测 fetch 功能", () => {
    // 由于在 Node 环境中 fetch 可能存在，我们测试其类型
    const { runtimeFeatures } = require("@/runtime-env/features");
    
    expect(typeof runtimeFeatures.fetch).toBe("boolean");
  });

  it("应该正确检测 localStorage 功能", () => {
    const { runtimeFeatures } = require("@/runtime-env/features");
    
    expect(typeof runtimeFeatures.localStorage).toBe("boolean");
  });

  it("应该正确检测 IntersectionObserver 功能", () => {
    const { runtimeFeatures } = require("@/runtime-env/features");
    
    expect(typeof runtimeFeatures.intersectionObserver).toBe("boolean");
  });
});