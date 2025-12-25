import { EventScope, EventBus } from "@orbitjs/event-core";
import { bindResize } from "../../../../src/event-dom/helpers/resize";

// Mock DOM APIs
let eventListeners: { [key: string]: Array<(event: Event) => void> } = {};

Object.defineProperty(window, 'addEventListener', {
    writable: true,
    value: jest.fn((event, handler) => {
        if (!eventListeners[event]) {
            eventListeners[event] = [];
        }
        eventListeners[event].push(handler);
    })
});

Object.defineProperty(window, 'removeEventListener', {
    writable: true,
    value: jest.fn((event, handler) => {
        if (eventListeners[event]) {
            eventListeners[event] = eventListeners[event].filter(h => h !== handler);
        }
    })
});

Object.defineProperty(window, 'dispatchEvent', {
    writable: true,
    value: jest.fn((event: Event) => {
        if (eventListeners[event.type]) {
            eventListeners[event.type].forEach(handler => handler(event));
        }
        return true;
    })
});

describe('resize', () => {
  let bus: EventBus<any>;

  beforeEach(() => {
    jest.useFakeTimers();
    bus = new EventBus();
    eventListeners = {}; // 重置事件监听器
  });

  afterEach(() => {
    jest.useRealTimers();
    (window.addEventListener as jest.MockedFunction<any>).mockClear();
    (window.removeEventListener as jest.MockedFunction<any>).mockClear();
    (window.dispatchEvent as jest.MockedFunction<any>).mockClear();
  });

  it('应该在窗口调整大小时调用处理函数', () => {
    const scope = bus.createScope();
    const handler = jest.fn();
    bindResize(scope, handler);

    // 触发 resize 事件
    const resizeEvent = document.createEvent('Event');
    resizeEvent.initEvent('resize', true, true);
    window.dispatchEvent(resizeEvent);

    // 节流函数会在第一次调用时立即执行，所以处理函数应该被调用
    expect(handler).toHaveBeenCalledWith(resizeEvent);
  });

  it('应该使用默认的节流时间 100ms', () => {
    const scope = bus.createScope();
    const handler = jest.fn();
    bindResize(scope, handler);

    // 触发 resize 事件
    const resizeEvent = document.createEvent('Event');
    resizeEvent.initEvent('resize', true, true);
    window.dispatchEvent(resizeEvent);

    // 节流函数第一次调用会立即执行
    expect(handler).toHaveBeenCalledTimes(1);

    // 再次触发 resize 事件
    window.dispatchEvent(resizeEvent);

    // 在 99ms 时，由于节流，处理函数调用次数不应该增加
    jest.advanceTimersByTime(99);
    expect(handler).toHaveBeenCalledTimes(1);

    // 在 100ms 时，节流时间已过，处理函数应再次被调用
    jest.advanceTimersByTime(1);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('应该使用指定的节流时间', () => {
    const scope = bus.createScope();
    const handler = jest.fn();
    const wait = 200;
    bindResize(scope, handler, wait);

    // 触发 resize 事件
    const resizeEvent = document.createEvent('Event');
    resizeEvent.initEvent('resize', true, true);
    window.dispatchEvent(resizeEvent);

    // 节流函数第一次调用会立即执行
    expect(handler).toHaveBeenCalledTimes(1);

    // 再次触发 resize 事件
    window.dispatchEvent(resizeEvent);

    // 在 wait-1 ms 时，由于节流，处理函数调用次数不应该增加
    jest.advanceTimersByTime(wait - 1);
    expect(handler).toHaveBeenCalledTimes(1);

    // 在 wait ms 时，节流时间已过，处理函数应再次被调用
    jest.advanceTimersByTime(1);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('应该在 scope 销毁时移除事件监听器', () => {
    const scope = bus.createScope();
    const handler = jest.fn();
    bindResize(scope, handler);

    scope.dispose();

    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});