import { EventScope, EventBus } from '../../../../src/event-core';

describe('bindVisibilityChange', () => {
  let scope: EventScope<any>;
  let bus: EventBus<any>;
  let handler: jest.Mock;
  let originalAddEventListener: jest.Mock;
  let originalRemoveEventListener: jest.Mock;
  let eventHandlers: { [key: string]: Array<EventListenerOrEventListenerObject> } = {};
  let originalHidden: boolean;

  beforeEach(() => {
    bus = new EventBus();
    scope = new EventScope(bus);
    handler = jest.fn();

    // 保存原始属性值
    originalHidden = document.hidden;

    // 保存原始方法并创建模拟
    originalAddEventListener = jest.fn((type, listener) => {
      if (!eventHandlers[type]) {
        eventHandlers[type] = [];
      }
      eventHandlers[type].push(listener);
    });
    originalRemoveEventListener = jest.fn((type, listener) => {
      if (eventHandlers[type]) {
        eventHandlers[type] = eventHandlers[type].filter(l => l !== listener);
      }
    });

    // 模拟 document.addEventListener 和 removeEventListener
    Object.defineProperty(document, 'addEventListener', {
      value: originalAddEventListener,
      writable: true,
    });
    Object.defineProperty(document, 'removeEventListener', {
      value: originalRemoveEventListener,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};
    
    // 恢复原始属性值
    Object.defineProperty(document, 'hidden', {
      value: originalHidden,
      writable: true,
    });
  });

  it('应该在 document 上添加 visibilitychange 事件监听器', () => {
    const { bindVisibilityChange } = require('../../../../src/event-dom/helpers/visibility');
    bindVisibilityChange(scope, handler);

    expect(originalAddEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  it('应该在页面可见时调用处理函数并传递 true', () => {
    // 设置 document.hidden 为 false（页面可见）
    Object.defineProperty(document, 'hidden', {
      value: false,
      writable: true,
    });

    const { bindVisibilityChange } = require('../../../../src/event-dom/helpers/visibility');
    bindVisibilityChange(scope, handler);

    // 获取添加的监听器函数
    const listener = eventHandlers['visibilitychange'][0] as EventListener;

    // 模拟 visibilitychange 事件
    const mockEvent = new Event('visibilitychange');
    listener(mockEvent);

    expect(handler).toHaveBeenCalledWith(true); // 页面可见，应该传递 true
  });

  it('应该在页面不可见时调用处理函数并传递 false', () => {
    // 设置 document.hidden 为 true（页面不可见）
    Object.defineProperty(document, 'hidden', {
      value: true,
      writable: true,
    });

    const { bindVisibilityChange } = require('../../../../src/event-dom/helpers/visibility');
    bindVisibilityChange(scope, handler);

    // 获取添加的监听器函数
    const listener = eventHandlers['visibilitychange'][0] as EventListener;

    // 模拟 visibilitychange 事件
    const mockEvent = new Event('visibilitychange');
    listener(mockEvent);

    expect(handler).toHaveBeenCalledWith(false); // 页面不可见，应该传递 false
  });

  it('应该在 scope 销毁时移除事件监听器', () => {
    const { bindVisibilityChange } = require('../../../../src/event-dom/helpers/visibility');
    bindVisibilityChange(scope, handler);

    expect(eventHandlers['visibilitychange'].length).toBe(1);

    // 触发销毁事件
    scope.dispose();

    expect(originalRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(eventHandlers['visibilitychange'].length).toBe(0);
  });
});