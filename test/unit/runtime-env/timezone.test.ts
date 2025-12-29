describe("getTimezone", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("应该返回有效的时区字符串", () => {
    const { getTimezone } = require("@/runtime-env/timezone");
    const timezone = getTimezone();
    
    // 验证返回的是字符串类型
    expect(typeof timezone).toBe("string");
    
    // 验证有时区标识符的基本格式（通常包含斜杠，如 "Asia/Shanghai"）
    expect(timezone).toMatch(/^[A-Za-z0-9_+-]+\/[A-Za-z0-9_+-]+$/);
  });

  it("应该返回与 Intl.DateTimeFormat 一致的时区", () => {
    const { getTimezone } = require("@/runtime-env/timezone");
    const expectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const actualTimezone = getTimezone();
    
    expect(actualTimezone).toBe(expectedTimezone);
  });
});