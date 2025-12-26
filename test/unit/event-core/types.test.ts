import { 
  BusAction, 
  EventHandler, 
  EventLogAction, 
  EventMap, 
  ScopeLogAction
} from '@/event-core/types';

// Mock logger to prevent LoggerChild errors in tests
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('Event Core Types', () => {
  it('应该定义正确的AppEvents类型', () => {
    type AppEvents = {
      login: { userId: string };
      logout: void;
      error: Error;
    };

    const events: AppEvents = {
      login: { userId: '123' },
      logout: undefined as void,
      error: new Error('test error')
    };

    expect(events).toBeDefined();
  });

  it('应该支持EventMap类型', () => {
    type TestEventMap = {
      'test:event': string;
      'another:event': number;
    };

    const eventMap: EventMap = {
      'test:event': 'test data',
      'another:event': 123
    };

    expect(eventMap).toBeDefined();
  });

  it('应该定义正确的事件处理函数类型', () => {
    const handler: EventHandler<string> = (data: string) => {
      return;
    };

    expect(typeof handler).toBe('function');
  });

  it('应该定义正确的日志动作类型', () => {
    const busActions: BusAction[] = [
      'created' as BusAction,
      'emit_no_listeners' as BusAction,
      'clear' as BusAction,
      'off' as BusAction
    ];

    const eventLogActions: EventLogAction[] = [
      'emit' as EventLogAction,
      'handler_error' as EventLogAction
    ];

    const scopeLogActions: ScopeLogAction[] = [
      'created' as ScopeLogAction,
      'disposed' as ScopeLogAction,
      'dispose_twice' as ScopeLogAction,
      'subscribe_after_dispose' as ScopeLogAction,
      'cleanup_error' as ScopeLogAction
    ];

    expect(busActions).toBeDefined();
    expect(eventLogActions).toBeDefined();
    expect(scopeLogActions).toBeDefined();
  });
});