import { DomEventAdapter } from '../../../../../src/event/adapters/dom/DomEventAdapter';
import { EventScope } from '../../../../../src/event/core/EventScope';
import { EventBus } from '../../../../../src/event/core/EventBus';
import { 
  InputSignal, 
  InputEventMap, 
  GestureSemantic, 
  GestureEventMap,
  GestureEventDescriptor,
  GestureProcessorId 
} from '../../../../../src/event/adapters/semantic-map';
import { GestureProcessor } from '../../../../../src/event/adapters/processors';

// Mock 依赖
jest.mock('@orbitjs/runtime-env', () => ({
  detectInputCapabilities: jest.fn(() => ({ pointer: true, touch: true, mouse: true }))
}));

jest.mock('@orbitjs/logger', () => ({
  Logger: {
    for: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }))
  }
}));

jest.mock('../../../../../src/event/adapters/processors', () => ({
  createGestureProcessor: jest.fn((descriptor, callback) => {
    return {
      handle: jest.fn(),
      destroy: jest.fn(),
    };
  })
}));

// 导入 mock 函数
const { detectInputCapabilities } = require('@orbitjs/runtime-env');
const { createGestureProcessor } = require('../../../../../src/event/adapters/processors');

// 为浏览器API添加模拟
Object.assign(global, {
  PointerEvent: class PointerEvent extends Event {
    clientX: number;
    clientY: number;
    pointerType: string;
    buttons: number;

    constructor(type: string, eventInitDict?: PointerEventInit) {
      super(type, eventInitDict);
      this.clientX = eventInitDict?.clientX || 0;
      this.clientY = eventInitDict?.clientY || 0;
      this.pointerType = eventInitDict?.pointerType || 'mouse';
      this.buttons = eventInitDict?.buttons || 0;
    }
  },
  TouchEvent: class TouchEvent extends Event {
    touches: TouchList;
    changedTouches: TouchList;

    constructor(type: string, eventInitDict?: TouchEventInit) {
      super(type, eventInitDict);
      // 创建一个简单的TouchList模拟
      const emptyTouchList: any = [];
      emptyTouchList.item = (index: number) => emptyTouchList[index] || null;
      this.touches = eventInitDict?.touches ? 
        eventInitDict.touches as unknown as TouchList : 
        emptyTouchList;
      this.changedTouches = eventInitDict?.changedTouches ? 
        eventInitDict.changedTouches as unknown as TouchList : 
        emptyTouchList;
    }
  },
  Touch: class Touch {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;

    constructor(touchInit: TouchInit) {
      this.identifier = touchInit.identifier;
      this.target = touchInit.target;
      this.clientX = touchInit.clientX || 0;
      this.clientY = touchInit.clientY || 0;
    }
  }
});

describe('DomEventAdapter', () => {
  let domEventAdapter: DomEventAdapter;
  let mockEventBus: EventBus;
  let mockEventScope: EventScope;
  let mockTarget: EventTarget;
  let inputEventMap: InputEventMap;
  let gestureMap: GestureEventMap;

  beforeEach(() => {
    // 创建模拟的事件总线
    mockEventBus = new EventBus();
    mockEventScope = new EventScope(mockEventBus);
    
    // 创建模拟的事件目标
    mockTarget = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as unknown as EventTarget;
    
    // 设置输入事件映射
    inputEventMap = {
      press: {
        pointer: ['pointerdown'],
        touch: ['touchstart'],
        mouse: ['mousedown']
      },
      move: {
        pointer: ['pointermove'],
        touch: ['touchmove'],
        mouse: ['mousemove']
      },
      release: {
        pointer: ['pointerup'],
        touch: ['touchend'],
        mouse: ['mouseup']
      }
    };
    
    // 设置手势映射 - 使用完整的GestureEventMap类型
    gestureMap = {
      tap: {
        requires: ['press', 'release'],
        processor: 'tapProcessor' as GestureProcessorId,
        semantic: 'tap'
      } as GestureEventDescriptor<'tap'>,
      swipe: {
        requires: ['press', 'move', 'release'],
        processor: 'swipeProcessor' as GestureProcessorId,
        semantic: 'swipe'
      } as GestureEventDescriptor<'swipe'>,
      click: {
        requires: ['press', 'release'],
        processor: 'tapProcessor' as GestureProcessorId,
        semantic: 'click'
      } as GestureEventDescriptor<'click'>,
      dblclick: {
        requires: ['press', 'release', 'press', 'release'],
        processor: 'doubleTapProcessor' as GestureProcessorId,
        semantic: 'dblclick'
      } as GestureEventDescriptor<'dblclick'>,
      longpress: {
        requires: ['press'],
        processor: 'longPressProcessor' as GestureProcessorId,
        semantic: 'longpress'
      } as GestureEventDescriptor<'longpress'>,
      drag: {
        requires: ['press', 'move', 'release'],
        processor: 'panProcessor' as GestureProcessorId,
        semantic: 'drag'
      } as GestureEventDescriptor<'drag'>,
      hover: {
        requires: ['press', 'release'],
        processor: 'hoverProcessor' as GestureProcessorId,
        semantic: 'hover'
      } as GestureEventDescriptor<'hover'>,
      contextmenu: {
        requires: ['press'],
        processor: 'contextMenuProcessor' as GestureProcessorId,
        semantic: 'contextmenu'
      } as GestureEventDescriptor<'contextmenu'>,
      submit: {
        requires: ['press'],
        processor: 'enterKeyProcessor' as GestureProcessorId,
        semantic: 'submit'
      } as GestureEventDescriptor<'submit'>
    };
    
    domEventAdapter = new DomEventAdapter(inputEventMap, gestureMap);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with inputEventMap and gestureMap', () => {
      expect(domEventAdapter).toBeDefined();
    });
  });

  describe('bind method', () => {
    it('should return empty function when semantic is not found in gestureMap', () => {
      const unbind = domEventAdapter.bind(mockTarget, 'unknown' as GestureSemantic, mockEventScope);
      
      expect(unbind).toBeDefined();
      expect(typeof unbind).toBe('function');
    });

    it('should bind all required input signals for a gesture', () => {
      const mockProcessor = {
        handle: jest.fn(),
        destroy: jest.fn()
      };
      
      (createGestureProcessor as jest.MockedFunction<any>).mockImplementation((descriptor: GestureEventDescriptor, callback: (event: any) => void) => mockProcessor);
      
      const unbind = domEventAdapter.bind(mockTarget, 'tap', mockEventScope);
      
      // 验证为 tap 手势的每个必需信号都添加了事件监听器
      expect(mockTarget.addEventListener).toHaveBeenCalledTimes(2); // press 和 release
      expect(createGestureProcessor).toHaveBeenCalled();
      
      // 验证返回的解绑函数可用
      expect(unbind).toBeDefined();
      expect(typeof unbind).toBe('function');
    });

    it('should emit gesture events through the scope', () => {
      const mockProcessor = {
        handle: jest.fn(),
        destroy: jest.fn()
      };
      
      (createGestureProcessor as jest.MockedFunction<any>).mockImplementation((descriptor: GestureEventDescriptor, callback: (event: any) => void) => {
        // 立即调用回调来模拟手势处理
        setTimeout(() => callback({ semantic: 'tap', x: 100, y: 100 }), 0);
        return mockProcessor;
      });
      
      const emitSpy = jest.spyOn(mockEventScope, 'emit');
      
      domEventAdapter.bind(mockTarget, 'tap', mockEventScope);
      
      // 由于使用了setTimeout，需要等待异步操作完成
      return new Promise(resolve => {
        setTimeout(() => {
          expect(emitSpy).toHaveBeenCalledWith('tap', { semantic: 'tap', x: 100, y: 100 });
          resolve(undefined);
        }, 10);
      });
    });
    
    it('should execute unbind functions when returned function is called', () => {
      const mockProcessor = {
        handle: jest.fn(),
        destroy: jest.fn()
      };
      
      (createGestureProcessor as jest.MockedFunction<any>).mockImplementation((descriptor: GestureEventDescriptor, callback: (event: any) => void) => mockProcessor);
      
      const unbind = domEventAdapter.bind(mockTarget, 'tap', mockEventScope);
      
      // 验证初始监听器数量
      expect(mockTarget.addEventListener).toHaveBeenCalledTimes(2);
      
      // 执行解绑函数
      unbind();
      
      // 验证移除监听器被调用
      expect(mockTarget.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('bindInputSignals method', () => {
    it('should bind to the correct DOM events based on capabilities', () => {
      (detectInputCapabilities as jest.MockedFunction<any>).mockReturnValue({ pointer: true });
      
      const mockProcessor = { handle: jest.fn() };
      (createGestureProcessor as jest.MockedFunction<any>).mockReturnValue(mockProcessor);
      
      // 重新创建适配器实例以确保使用更新后的模拟
      const adapter = new DomEventAdapter(inputEventMap, gestureMap);
      adapter.bind(mockTarget, 'tap', mockEventScope);
      
      // 验证使用 pointer 事件（因为检测到支持 pointer）
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function), undefined);
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function), undefined);
    });

    it('should log warning when binding is missing', () => {
      // 创建一个没有press信号的输入映射
      const inputMapWithoutPress: InputEventMap = {
        move: {
          pointer: ['pointermove'],
          touch: ['touchmove'],
          mouse: ['mousemove']
        },
        release: {
          pointer: ['pointerup'],
          touch: ['touchend'],
          mouse: ['mouseup']
        }
      };
      
      const adapter = new DomEventAdapter(inputMapWithoutPress, gestureMap);
      const loggerSpy = jest.spyOn((adapter as any), 'logAdapter');
      
      const mockProcessor = { handle: jest.fn() };
      (createGestureProcessor as jest.MockedFunction<any>).mockReturnValue(mockProcessor);
      
      // 尝试绑定一个需要 'press' 信号的手势，但输入映射中没有 'press'
      adapter.bind(mockTarget, 'tap', mockEventScope);
      
      // 验证警告日志被记录（至少有一次missing_binding警告）
      expect(loggerSpy).toHaveBeenCalledWith('warn', 'missing_binding', { signal: 'press' });
    });
  });

  describe('normalizeInput method', () => {
    it('should normalize PointerEvent correctly', () => {
      const pointerEvent = new (global as any).PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 200,
        pointerType: 'mouse',
        buttons: 1
      });
      
      // 由于 normalizeInput 是私有方法，我们需要通过类型转换来访问
      const normalizeInput = (domEventAdapter as any).normalizeInput as Function;
      const result = normalizeInput('press', pointerEvent);
      
      expect(result.signal).toBe('press');
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
      expect(result.pointerType).toBe('mouse');
      expect(result.buttons).toBe(1);
      expect(result.originalEvent).toBe(pointerEvent);
    });

    it('should normalize TouchEvent correctly', () => {
      const touch = new (global as any).Touch({ identifier: 0, target: document.body, clientX: 150, clientY: 250 });
      const touchEvent = new (global as any).TouchEvent('touchstart', {
        touches: [touch]
      } as TouchEventInit);
      
      const normalizeInput = (domEventAdapter as any).normalizeInput as Function;
      const result = normalizeInput('press', touchEvent);
      
      expect(result.signal).toBe('press');
      expect(result.x).toBe(150);
      expect(result.y).toBe(250);
      expect(result.pointerType).toBe('touch');
      expect(result.originalEvent).toBe(touchEvent);
    });

    it('should normalize MouseEvent correctly', () => {
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 300,
        clientY: 400,
        buttons: 1
      });
      
      const normalizeInput = (domEventAdapter as any).normalizeInput as Function;
      const result = normalizeInput('press', mouseEvent);
      
      expect(result.signal).toBe('press');
      expect(result.x).toBe(300);
      expect(result.y).toBe(400);
      expect(result.pointerType).toBe('mouse');
      expect(result.buttons).toBe(1);
      expect(result.originalEvent).toBe(mouseEvent);
    });
    
    it('should handle keyboard and other events correctly', () => {
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter'
      });
      
      const normalizeInput = (domEventAdapter as any).normalizeInput as Function;
      const result = normalizeInput('keydown', keyboardEvent);
      
      expect(result.signal).toBe('keydown');
      expect(result.x).toBeUndefined();
      expect(result.y).toBeUndefined();
      expect(result.pointerType).toBeUndefined();
      expect(result.buttons).toBeUndefined();
      expect(result.originalEvent).toBe(keyboardEvent);
    });
  });

  describe('selectDomEvents method', () => {
    // 由于selectDomEvents是私有方法，我们通过测试bindInputSignals的行为来间接测试它
    it('should select pointer events when pointer capability is available', () => {
      (detectInputCapabilities as jest.MockedFunction<any>).mockReturnValue({ pointer: true });
      
      const mockProcessor = { handle: jest.fn() };
      (createGestureProcessor as jest.MockedFunction<any>).mockReturnValue(mockProcessor);
      
      // 重新创建适配器实例以确保使用更新后的模拟
      const adapter = new DomEventAdapter(inputEventMap, gestureMap);
      adapter.bind(mockTarget, 'tap', mockEventScope);
      
      // 验证使用 pointer 事件（因为检测到支持 pointer）
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function), undefined);
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function), undefined);
    });
  });
  
});