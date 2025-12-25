import { EventScope, EventBus } from '../../../src/event-core';

// 为测试创建一个简单的 EventTarget 模拟
class MockElement implements EventTarget {
  eventListeners: { [key: string]: Array<EventListenerOrEventListenerObject> } = {};

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (this.eventListeners[type]) {
      this.eventListeners[type] = this.eventListeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event: Event): boolean {
    return true;
  }
}

describe('bindDomEvent', () => {
  let scope: EventScope<any>;
  let bus: EventBus<any>;
  let element: MockElement;
  let handler: jest.Mock;

  beforeEach(() => {
    bus = new EventBus();
    scope = new EventScope(bus);
    element = new MockElement();
    handler = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该在目标元素上添加事件监听器', () => {
    const { bindDomEvent } = require('../../../src/event-dom/bind');
    bindDomEvent(scope, element, 'click', handler);

    expect(element.eventListeners['click']).toBeDefined();
    expect(element.eventListeners['click'].length).toBe(1);
  });

  it('应该在 scope 销毁时移除事件监听器', () => {
    const { bindDomEvent } = require('../../../src/event-dom/bind');
    bindDomEvent(scope, element, 'click', handler);

    const initialListenerCount = element.eventListeners['click'].length;
    expect(initialListenerCount).toBe(1);

    // 触发销毁事件
    scope.dispose();

    // 检查监听器是否被移除
    expect(element.eventListeners['click'].length).toBe(initialListenerCount - 1);
  });

  it('应该在事件触发时调用处理函数', () => {
    const { bindDomEvent } = require('../../../src/event-dom/bind');
    bindDomEvent(scope, element, 'click', handler);

    // 获取添加的监听器函数
    const listener = element.eventListeners['click'][0] as EventListener;

    // 模拟事件触发
    const mockEvent = new Event('click');
    listener(mockEvent);

    expect(handler).toHaveBeenCalledWith(mockEvent);
  });

  it('应该支持事件监听器选项', () => {
    const options: AddEventListenerOptions = { once: true, passive: true };

    const { bindDomEvent } = require('../../../src/event-dom/bind');
    bindDomEvent(scope, element, 'click', handler, options);

    expect(element.eventListeners['click']).toBeDefined();
    expect(element.eventListeners['click'].length).toBe(1);
  });
});