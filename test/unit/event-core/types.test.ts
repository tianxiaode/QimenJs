import { EventMap, EventHandler } from "@/event-core/types";

// 这个测试文件主要是为了确保类型定义正确应用
// 因为类型定义主要在编译时检查，所以测试主要是验证使用方式

describe("types", () => {
  it("EventMap 应该允许定义字符串键和任意值的映射", () => {
    // 这些是类型验证，运行时会通过编译检查来验证
    const map: EventMap = {
      'event1': 'string value',
      'event2': 123,
      'event3': { complex: 'object' },
      'event4': null,
      'event5': undefined,
    };

    expect(typeof map).toBe('object');
    expect(map).toHaveProperty('event1');
    expect(map).toHaveProperty('event2');
    expect(map).toHaveProperty('event3');
  });

  it("EventHandler 应该能够处理任意类型的载荷", () => {
    // 测试不同类型的事件处理器
    const stringHandler: EventHandler<string> = (payload) => {
      return payload.toUpperCase();
    };

    const numberHandler: EventHandler<number> = (payload) => {
      return payload * 2;
    };

    const objectHandler: EventHandler<{ name: string }> = (payload) => {
      return payload.name;
    };

    // 测试处理器的调用
    expect(stringHandler('hello')).toBe('HELLO');
    expect(numberHandler(5)).toBe(10);
    expect(objectHandler({ name: 'test' })).toBe('test');
  });

  it("EventHandler 默认类型参数应该是 any", () => {
    const defaultHandler: EventHandler = (payload) => {
      // 应该能够处理任意类型的载荷
      return payload;
    };

    expect(defaultHandler('string')).toBe('string');
    expect(defaultHandler(123)).toBe(123);
    expect(defaultHandler({ obj: 'ect' })).toEqual({ obj: 'ect' });
  });
});