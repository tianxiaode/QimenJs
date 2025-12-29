describe("getPlatform", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("在 JSDOM 环境中应该返回 'browser'", () => {
    // Jest 使用 JSDOM 作为测试环境，window 对象始终存在
    const { getPlatform } = require("@/runtime-env/platform");
    const result = getPlatform();

    // 在 JSDOM 环境中，由于 window 存在，应该返回 "browser"
    expect(result).toBe("browser");
  });
});