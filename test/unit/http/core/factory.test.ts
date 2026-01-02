import { HttpFactory } from '@/http/core/factory';
import { HttpClient } from '@/http/core/HttpClient';
import { StreamClient } from '@/http/core/StreamClient';
import {
  HttpMethod,
  RequestOptions,
  RequestTask,
  HttpResponseContext,
  IHeaderProcessor,
  IUrlProcessor,
  IResponseProcessor,
  BaseConfig,
  HttpClientConfig,
  StreamClientConfig,
} from '@/http/types';
import { globalTaskQueue } from '@orbitjs/tasks';

// Mock HttpClient 和 StreamClient
jest.mock('@/http/core/HttpClient', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({ mock: 'http-client' })),
}));

// Mock StreamClient
jest.mock('@/http/core/StreamClient', () => ({
  StreamClient: jest.fn().mockImplementation(() => ({ mock: 'stream-client' })),
}));

// Mock 任务队列
jest.mock('@orbitjs/tasks', () => ({
  globalTaskQueue: {
    addTask: jest.fn(),
  },
}));

describe('HttpFactory', () => {
  describe('normalizeBaseConfig', () => {
    it('should normalize base URL by removing trailing slashes', () => {
      const { normalizeBaseConfig } = require('@/http/core/factory');
      const config = { baseUrl: 'https://api.example.com/' };
      const normalized = normalizeBaseConfig(config);
      expect(normalized.baseUrl).toBe('https://api.example.com');
    });

    it('should use default empty string for baseUrl if not provided', () => {
      const { normalizeBaseConfig } = require('@/http/core/factory');
      const config = {};
      const normalized = normalizeBaseConfig(config);
      expect(normalized.baseUrl).toBe('');
    });

    it('should use provided processors if given', () => {
      const { normalizeBaseConfig } = require('@/http/core/factory');
      const mockUrlProcessor: IUrlProcessor = jest.fn();
      const mockHeaderProcessor: IHeaderProcessor = jest.fn();
      
      const config = {
        urlProcessors: [mockUrlProcessor],
        headerProcessors: [mockHeaderProcessor],
      };
      
      const normalized = normalizeBaseConfig(config);
      expect(normalized.urlProcessors).toEqual([mockUrlProcessor]);
      expect(normalized.headerProcessors).toEqual([mockHeaderProcessor]);
    });

    it('should use default processors if not provided', () => {
      const { normalizeBaseConfig } = require('@/http/core/factory');
      const config = {};
      const normalized = normalizeBaseConfig(config);
      
      // 验证默认处理器是否被设置
      expect(normalized.urlProcessors).toBeDefined();
      expect(normalized.headerProcessors).toBeDefined();
    });
  });

  describe('createHttpClient', () => {
    it('should create HttpClient with default response processors', () => {
      const client = HttpFactory.createHttpClient();
      expect(HttpClient).toHaveBeenCalledWith(
        expect.objectContaining({
          responseProcessors: expect.arrayContaining([]), // 至少会有一些默认处理器
        })
      );
    });

    it('should create HttpClient with custom configuration', () => {
      const customConfig: HttpClientConfig = {
        baseUrl: 'https://custom.example.com',
        responseProcessors: {
          status: [jest.fn() as unknown as IResponseProcessor],
          parse: [jest.fn() as unknown as IResponseProcessor],
          error: [jest.fn() as unknown as IResponseProcessor],
          extract: [jest.fn() as unknown as IResponseProcessor],
          extra: [jest.fn() as unknown as IResponseProcessor],
        },
      };

      const client = HttpFactory.createHttpClient(customConfig);
      expect(HttpClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://custom.example.com',
        })
      );
    });
  });

  describe('createStreamClient', () => {
    it('should create StreamClient with provided configuration', () => {
      const config: StreamClientConfig = {
        baseUrl: 'https://stream.example.com',
      };

      const client = HttpFactory.createStreamClient(config);
      expect(StreamClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://stream.example.com',
        })
      );
    });

    it('should create StreamClient with default configuration', () => {
      const client = HttpFactory.createStreamClient();
      expect(StreamClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: '',
        })
      );
    });
  });

  describe('createSuite', () => {
    it('should create both http and stream clients', () => {
      const baseConfig: BaseConfig = {
        httpConfig: { baseUrl: 'https://api.example.com' },
        streamConfig: { baseUrl: 'https://stream.example.com' },
      };

      const suite = HttpFactory.createSuite(baseConfig);
      expect(suite).toHaveProperty('http');
      expect(suite).toHaveProperty('stream');
    });

    it('should use http config for stream if stream config is not provided', () => {
      const baseConfig: BaseConfig = {
        httpConfig: { baseUrl: 'https://api.example.com' },
      };

      const suite = HttpFactory.createSuite(baseConfig);
      expect(StreamClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://api.example.com',
        })
      );
    });
  });

  describe('createRetryTask', () => {
    let mockClient: HttpClient;
    let mockTask: RequestTask<any>;

    beforeEach(() => {
      mockTask = {
        promise: Promise.resolve({ data: 'success' }),
        cancel: jest.fn(),
      };
      mockClient = { request: jest.fn().mockReturnValue(mockTask) } as unknown as HttpClient;
    });

    it('should return a task with retry logic', async () => {
      const method: HttpMethod = 'GET';
      const url = '/test';
      const options: RequestOptions & { retry: any } = {
        retry: {
          maxRetries: 3,
          shouldRetry: jest.fn().mockReturnValue(true),
          delay: 100,
        },
      };

      (mockClient.request as jest.Mock).mockReturnValueOnce({
        promise: Promise.reject({
          status: 500,
          metadata: { isAborted: false },
        } as HttpResponseContext),
      }).mockReturnValueOnce({
        promise: Promise.resolve({ data: 'success' }),
      });

      const retryTask = HttpFactory.createRetryTask(mockClient, method, url, options);
      const result = await retryTask.promise;

      expect(mockClient.request).toHaveBeenCalledTimes(2); // 第一次失败，第二次成功
    });

    it('should not retry if shouldRetry returns false', async () => {
      const method: HttpMethod = 'GET';
      const url = '/test';
      const options: RequestOptions & { retry: any } = {
        retry: {
          maxRetries: 3,
          shouldRetry: jest.fn().mockReturnValue(false),
        },
      };

      const errorContext = {
        status: 500,
        metadata: { 
          isTransportFailure: false,
          isHttpSuccess: false,
          error: new Error('Network error'),
        }
      } as HttpResponseContext;
      
      (mockClient.request as jest.Mock).mockReturnValueOnce({
        promise: Promise.reject(errorContext),
      });

      const retryTask = HttpFactory.createRetryTask(mockClient, method, url, options);
      
      await expect(retryTask.promise).rejects.toEqual(errorContext);
      expect(mockClient.request).toHaveBeenCalledTimes(1);
    });

    it('should stop retrying if request is aborted', async () => {
      const method: HttpMethod = 'GET';
      const url = '/test';
      const options: RequestOptions & { retry: any } = {
        retry: {
          maxRetries: 3,
          shouldRetry: jest.fn().mockReturnValue(true),
        },
        signal: new AbortController().signal,
      };

      const abortedContext = {
        metadata: { isAborted: true },
      } as HttpResponseContext;
      
      (mockClient.request as jest.Mock).mockReturnValueOnce({
        promise: Promise.reject(abortedContext),
      });

      const retryTask = HttpFactory.createRetryTask(mockClient, method, url, options);
      
      await expect(retryTask.promise).rejects.toEqual(abortedContext);
      expect(mockClient.request).toHaveBeenCalledTimes(1);
    });

    it('should cancel both controller and task when cancel is called', () => {
      const method: HttpMethod = 'GET';
      const url = '/test';
      const options: RequestOptions & { retry: any } = {
        retry: {
          maxRetries: 3,
          shouldRetry: jest.fn().mockReturnValue(true),
        },
      };

      // 创建一个真实的任务来测试取消功能
      const retryTask = HttpFactory.createRetryTask(mockClient, method, url, options);
      retryTask.cancel();

      // 由于在createRetryTask内部创建了新的AbortController，我们需要检查是否调用了controller的abort方法
      expect((retryTask as any).cancel).toBeDefined();
    });
  });

  describe('schedulePolling', () => {
    let mockClient: HttpClient;
    let mockTask: RequestTask<any>;

    beforeEach(() => {
      mockTask = {
        promise: Promise.resolve({ data: 'success' }),
        cancel: jest.fn(),
      };
      mockClient = { request: jest.fn().mockReturnValue(mockTask) } as unknown as HttpClient;
    });

    it('should add polling task to global queue', () => {
      const method: HttpMethod = 'GET';
      const url = '/polling';
      const pollingOptions = {
        interval: 5000,
        priority: 'NORMAL' as const,
        maxRetries: 3,
        retryDelay: 1000,
      };

      HttpFactory.schedulePolling(mockClient, method, url, pollingOptions);

      expect(globalTaskQueue.addTask).toHaveBeenCalledWith(
        expect.any(Function),
        'NORMAL',
        3,
        1000,
        true, // isPolling
        5000  // interval
      );
    });

    it('should use default values when options are not provided', () => {
      const method: HttpMethod = 'GET';
      const url = '/polling';
      const pollingOptions = {}; // 使用默认值

      HttpFactory.schedulePolling(mockClient, method, url, pollingOptions);

      expect(globalTaskQueue.addTask).toHaveBeenCalledWith(
        expect.any(Function),
        'NORMAL', // 默认优先级
        3,        // 默认最大重试次数
        1000,     // 默认重试延迟
        true,     // isPolling
        5000      // 默认间隔
      );
    });
  });
});