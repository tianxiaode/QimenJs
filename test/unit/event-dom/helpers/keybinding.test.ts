import { EventScope, EventBus } from '../../../../src/event';

// 模拟 throttle 函数
jest.mock('../../../../src/async', () => ({
  throttle: jest.fn((fn) => fn), // 简化 throttle 实现，直接返回原函数
}));

describe('bindKey', () => {
  let scope: EventScope<any>;
  let bus: EventBus<any>;
  let handler: jest.Mock;
  let originalAddEventListener: jest.Mock;
  let originalRemoveEventListener: jest.Mock;
  let eventHandlers: { [key: string]: Array<EventListenerOrEventListenerObject> } = {};

  beforeEach(() => {
    bus = new EventBus();
    scope = new EventScope(bus);
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

    // 模拟 window.addEventListener 和 removeEventListener
    Object.defineProperty(window, 'addEventListener', {
      value: originalAddEventListener,
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: originalRemoveEventListener,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};
  });

  it('应该在 window 上添加 keydown 事件监听器', () => {
    const { bindKey } = require('../../../../src/event-dom/helpers/keybinding');
    bindKey(scope, 'Enter', handler);

    expect(originalAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('应该在按下匹配的键时调用处理函数', () => {
    const { bindKey } = require('../../../../src/event-dom/helpers/keybinding');
    bindKey(scope, 'Enter', handler);

    // 获取添加的监听器函数
    const listener = eventHandlers['keydown'][0] as EventListener;

    // 模拟 Enter 键事件
    const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    listener(mockEvent);

    expect(handler).toHaveBeenCalledWith(mockEvent);
  });

  it('不应该在按下不匹配的键时调用处理函数', () => {
    const { bindKey } = require('../../../../src/event-dom/helpers/keybinding');
    bindKey(scope, 'Enter', handler);

    // 获取添加的监听器函数
    const listener = eventHandlers['keydown'][0] as EventListener;

    // 模拟其他键事件
    const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    listener(mockEvent);

    expect(handler).not.toHaveBeenCalled();
  });

  it('应该根据 ctrl 选项匹配按键', () => {
    const { bindKey } = require('../../../../src/event-dom/helpers/keybinding');
    bindKey(scope, 's', handler, { ctrl: true });

    const listener = eventHandlers['keydown'][0] as EventListener;

    // 模拟 Ctrl+S 事件
    const mockEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    listener(mockEvent);
    expect(handler).toHaveBeenCalledTimes(1);

    // 模拟非 Ctrl+S 事件
    const mockEvent2 = new KeyboardEvent('keydown', { key: 's', ctrlKey: false });
    listener(mockEvent2);
    expect(handler).toHaveBeenCalledTimes(1); // 次数不应该增加
  });

  it('应该根据 shift 选项匹配按键', () => {
    const { bindKey } = require('../../../../src/event-dom/helpers/keybinding');
    bindKey(scope, 't', handler, { shift: true });

    const listener = eventHandlers['keydown'][0] as EventListener;

    // 模拟 Shift+T 事件
    const mockEvent = new KeyboardEvent('keydown', { key: 't', shiftKey: true });
    listener(mockEvent);
    expect(handler).toHaveBeenCalledTimes(1);

    // 模拟非 Shift+T 事件
    const mockEvent2 = new KeyboardEvent('keydown', { key: 't', shiftKey: false });
    listener(mockEvent2);
    expect(handler).toHaveBeenCalledTimes(1); // 次数不应该增加
  });

  it('应该根据多个修饰键选项匹配按键', () => {
    const { bindKey } = require('../../../../src/event-dom/helpers/keybinding');
    bindKey(scope, 'k', handler, { ctrl: true, shift: true });

    const listener = eventHandlers['keydown'][0] as EventListener;

    // 模拟 Ctrl+Shift+K 事件
    const mockEvent = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true });
    listener(mockEvent);
    expect(handler).toHaveBeenCalledTimes(1);

    // 模拟缺少修饰键的事件
    const mockEvent2 = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: false });
    listener(mockEvent2);
    expect(handler).toHaveBeenCalledTimes(1); // 次数不应该增加
  });

  it('应该在 scope 销毁时移除事件监听器', () => {
    const { bindKey } = require('../../../../src/event-dom/helpers/keybinding');
    bindKey(scope, 'Enter', handler);

    expect(eventHandlers['keydown'].length).toBe(1);

    // 触发销毁事件
    scope.dispose();

    expect(originalRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(eventHandlers['keydown'].length).toBe(0);
  });
});