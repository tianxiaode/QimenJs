import { runPipeline } from '@/kernel/core/runner';
import { ActionEntry } from '@/kernel/types/registrars/entries';
import { FlowContext } from '@/kernel/types/actions';
import { DomainConfig } from '@orbitjs/registry';
import { Logger } from '@orbitjs/logger';

// Mock the Logger to prevent errors during tests
jest.mock('@orbitjs/logger');

describe('runner', () => {
  describe('runPipeline', () => {
    let mockContext: FlowContext;
    let mockDomainConfig: DomainConfig;
    let mockDebugLogger: jest.Mock;
    let mockErrorLogger: jest.Mock;

    beforeEach(() => {
      mockDomainConfig = {
        baseUrl: 'https://api.example.com',
        preset: 'abp',
        pageSize: 10,
        pagesizes: [10, 20, 50],
        timeout: 5000,
        custom: {}
      };

      // 创建一个基本的上下文对象用于测试
      mockContext = {
        domain: 'test',
        config: mockDomainConfig,
        isAborted: false,
        error: null,
        params: {},
        metadata: {
          isTransportFailure: false,
          hasError: false,
          isUpload: false,
          isDownload: false,
          silent: false,
          contentType: '',
          isJson: false,
          isText: false,
          isBlob: false,
          action: '',
          isProcessed: false,
          fileName: '',
          isDownloadHandled: false,
          isErrorHandled: false,
          onProgress: undefined
        },
        http: {
          url: '/test',
          status: 0,
          isSuccess: false,
          rawResponse: null,
          timeout: 0,
          responseType: 'json',
          withCredentials: false,
          controller: new AbortController(),
          responseHeaders: {},
          method: 'GET',
          pathParams: [],
          queryParams: {},
          body: null,
          headers: {}
        },
        data: {
          parsed: null,
          source: null,
          raw: null,
          list: [],
          item: null,
          total: 0
        },
        steps: [],
        alignToFrontend: (target: any) => target
      };
      
      // 设置 Logger 模拟
      mockDebugLogger = jest.fn();
      mockErrorLogger = jest.fn();
      (Logger.for as jest.MockedFunction<typeof Logger.for>).mockReturnValue({
        debug: mockDebugLogger,
        error: mockErrorLogger
      } as any);

      mockDomainConfig = {
        baseUrl: 'https://api.example.com',
        preset: 'abp',
        pageSize: 10,
        pagesizes: [10, 20, 50],
        timeout: 5000,
        custom: {}
      };

      // 创建一个基本的上下文对象用于测试
      mockContext = {
        domain: 'test',
        config: mockDomainConfig,
        isAborted: false,
        error: null,
        params: {},
        metadata: {
          isTransportFailure: false,
          hasError: false,
          isUpload: false,
          isDownload: false,
          silent: false,
          contentType: '',
          isJson: false,
          isText: false,
          isBlob: false,
          action: '',
          isProcessed: false,
          fileName: '',
          isDownloadHandled: false,
          isErrorHandled: false,
          onProgress: undefined
        },
        http: {
          url: '/test',
          status: 0,
          isSuccess: false,
          rawResponse: null,
          timeout: 0,
          responseType: 'json',
          withCredentials: false,
          controller: new AbortController(),
          responseHeaders: {},
          method: 'GET',
          pathParams: [],
          queryParams: {},
          body: null,
          headers: {}
        },
        data: {
          parsed: null,
          source: null,
          raw: null,
          list: [],
          item: null,
          total: 0
        },
        steps: [],
        alignToFrontend: (target: any) => target
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should execute all actions in the correct order and log pipeline start/finish', async () => {
      const executedOrder: string[] = [];
      
      const actions: ActionEntry[] = [
        { name: 'action3', category: 2000, offset: 300, description: 'Test action 3', handler: async () => { executedOrder.push('action3'); } },
        { name: 'action1', category: 3000, offset: 100, description: 'Test action 1', handler: async () => { executedOrder.push('action1'); } },
        { name: 'action4', category: 2000, offset: 100, description: 'Test action 4', handler: async () => { executedOrder.push('action4'); } },
        { name: 'action2', category: 3000, offset: 200, description: 'Test action 2', handler: async () => { executedOrder.push('action2'); } }
      ];

      await runPipeline(mockContext, actions);

      // 验证执行顺序：先按 category 降序 (3000 -> 2000)，然后按 offset 升序 (100 -> 200 -> 100 -> 300)
      expect(executedOrder).toEqual(['action1', 'action2', 'action4', 'action3']);
      
      // 验证日志记录
      expect(mockDebugLogger).toHaveBeenCalledWith('start pipeline');
      expect(mockDebugLogger).toHaveBeenCalledWith('pipeline finished');
    });

    it('should record execution steps and log pipeline start/finish', async () => {
      const actions: ActionEntry[] = [
        { name: 'testAction', category: 1000, offset: 100, description: 'Test action', handler: async () => { /* do nothing */ } }
      ];

      const result = await runPipeline(mockContext, actions);

      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].name).toBe('testAction');
      expect(result.steps[0].status).toBe('success');
      expect(typeof result.steps[0].duration).toBe('number');
      
      // 验证日志记录
      expect(mockDebugLogger).toHaveBeenCalledWith('start pipeline');
      expect(mockDebugLogger).toHaveBeenCalledWith('pipeline finished');
    });

    it('should stop execution when an action throws an error and log the error', async () => {
      const executedOrder: string[] = [];

      const actions: ActionEntry[] = [
        { name: 'action1', category: 1000, offset: 100, description: 'Test action 1', handler: async () => { executedOrder.push('action1'); } },
        { name: 'action2', category: 1000, offset: 200, description: 'Test action 2', handler: async () => { throw new Error('Test error'); } },
        { name: 'action3', category: 1000, offset: 300, description: 'Test action 3', handler: async () => { executedOrder.push('action3'); } }
      ];

      const result = await runPipeline(mockContext, actions);

      // 验证只有第一个 action 被执行，第二个抛出错误后停止
      expect(executedOrder).toEqual(['action1']);
      expect(result.steps).toHaveLength(2); // action1 成功，action2 失败
      
      expect(result.steps[0].name).toBe('action1');
      expect(result.steps[0].status).toBe('success');
      
      expect(result.steps[1].name).toBe('action2');
      expect(result.steps[1].status).toBe('failed');

      // 验证错误状态被设置
      expect(result.metadata.hasError).toBe(true);
      expect(result.error).toBeDefined();
      expect(result.metadata.isTransportFailure).toBe(true);
      
      // 验证日志记录
      expect(mockDebugLogger).toHaveBeenCalledWith('start pipeline');
      expect(mockDebugLogger).toHaveBeenCalledWith('pipeline finished');
      expect(mockErrorLogger).toHaveBeenCalledWith('Action action2 crashed:', expect.any(Error));
    });

    it('should return the modified context after execution and log pipeline start/finish', async () => {
      const testValue = 'modified';
      const actions: ActionEntry[] = [
        {
          name: 'modifyContextAction',
          category: 1000,
          offset: 100,
          description: 'Modify context action',
          handler: async (ctx: FlowContext) => {
            ctx.data.parsed = testValue;
          }
        }
      ];

      const result = await runPipeline(mockContext, actions);

      expect(result).toBe(mockContext);
      expect(result.data.parsed).toBe(testValue);
      
      // 验证日志记录
      expect(mockDebugLogger).toHaveBeenCalledWith('start pipeline');
      expect(mockDebugLogger).toHaveBeenCalledWith('pipeline finished');
    });
  });
});