import { EventScope, EventBus } from '../../../../src/event-core';

describe('bindClickOutside', () => {
  let scope: EventScope<any>;
  let bus: EventBus<any>;
  let target: HTMLElement;
  let handler: jest.Mock;
  let originalAddEventListener: jest.Mock;
  let originalRemoveEventListener: jest.Mock;
  let eventHandlers: { [key: string]: Array<EventListenerOrEventListenerObject> } = {};

  beforeEach(() => {
    bus = new EventBus();
    scope = new EventScope(bus);
    target = document.createElement('div');
    handler = jest.fn();

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
  });

  it('应该在 document 上添加 mousedown 事件监听器', () => {
    const { bindClickOutside } = require('../../../../src/event-dom/helpers/clickOutside');
    bindClickOutside(scope, target, handler);

    expect(originalAddEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('应该在点击目标元素外部时调用处理函数', () => {
    const { bindClickOutside } = require('../../../../src/event-dom/helpers/clickOutside');
    bindClickOutside(scope, target, handler);

    // 获取添加的监听器函数
    const listener = eventHandlers['mousedown'][0] as EventListener;

    // 模拟点击外部的事件
    const mockEvent = new MouseEvent('mousedown');
    Object.defineProperty(mockEvent, 'target', { value: document.body });

    // 设置 target.contains 返回 false（点击在外部）
    jest.spyOn(target, 'contains').mockReturnValue(false);

    listener(mockEvent);

    expect(handler).toHaveBeenCalledWith(mockEvent);
  });

  it('不应该在点击目标元素内部时调用处理函数', () => {
    const { bindClickOutside } = require('../../../../src/event-dom/helpers/clickOutside');
    bindClickOutside(scope, target, handler);

    // 获取添加的监听器函数
    const listener = eventHandlers['mousedown'][0] as EventListener;

    // 模拟点击内部的事件
    const mockEvent = new MouseEvent('mousedown');
    const mockTargetElement = document.createElement('div');
    Object.defineProperty(mockEvent, 'target', { value: mockTargetElement });

    // 设置 target.contains 返回 true（点击在内部）
    jest.spyOn(target, 'contains').mockReturnValue(true);

    listener(mockEvent);

    expect(handler).not.toHaveBeenCalled();
  });

  it('应该在 scope 销毁时移除事件监听器', () => {
    const { bindClickOutside } = require('../../../../src/event-dom/helpers/clickOutside');
    bindClickOutside(scope, target, handler);

    expect(eventHandlers['mousedown'].length).toBe(1);

    // 触发销毁事件
    scope.dispose();

    expect(originalRemoveEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(eventHandlers['mousedown'].length).toBe(0);
  });
});