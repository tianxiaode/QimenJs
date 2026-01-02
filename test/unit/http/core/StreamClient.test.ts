import { StreamClient } from '@/http/core/StreamClient';
import { IHeaderProcessor, IUrlProcessor, RequestOptions } from '@/http/types';
import { prepareRequest } from '@/http/core/request-helper';

// Mock prepareRequest function
jest.mock('@/http/core/request-helper', () => ({
  prepareRequest: jest.fn(),
}));

describe('StreamClient', () => {
  let client: StreamClient;
  let mockPrepareRequest: jest.MockedFunction<typeof prepareRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置 prepareRequest 的默认返回值
    mockPrepareRequest = prepareRequest as jest.MockedFunction<typeof prepareRequest>;
    mockPrepareRequest.mockReturnValue({
      finalUrl: 'https://api.example.com/stream',
      finalHeaders: { 'Content-Type': 'application/json' },
      signal: new AbortController().signal,
    });

    client = new StreamClient({
      baseUrl: 'https://api.example.com',
    });
  });

  describe('constructor', () => {
    it('should initialize with default values when no config provided', () => {
      const defaultClient = new StreamClient({});
      expect(defaultClient).toBeInstanceOf(StreamClient);
      // 验证 baseUrl 默认为空字符串
      // @ts-ignore - accessing private property for testing
      expect(defaultClient.baseUrl).toBe('');
    });

    it('should use provided configuration', () => {
      const urlProcessor: IUrlProcessor = (url) => url;
      const headerProcessor: IHeaderProcessor = (headers) => headers;
      
      const configuredClient = new StreamClient({
        baseUrl: 'https://test.example.com',
        urlProcessors: [urlProcessor],
        headerProcessors: [headerProcessor],
      });

      expect(configuredClient).toBeInstanceOf(StreamClient);
      // @ts-ignore - accessing private property for testing
      expect(configuredClient.baseUrl).toBe('https://test.example.com');
      // @ts-ignore - accessing private property for testing
      expect(configuredClient.urlProcessors).toContain(urlProcessor);
      // @ts-ignore - accessing private property for testing
      expect(configuredClient.headerProcessors).toContain(headerProcessor);
    });
  });

  describe('chatStream', () => {
    // 由于 fetch 是全局函数，需要模拟它
    const originalFetch = global.fetch;
    const originalTextDecoder = global.TextDecoder;

    beforeEach(() => {
      // Mock fetch
      global.fetch = jest.fn((...args: [RequestInfo, RequestInit?]): Promise<Response> =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: {
            forEach: jest.fn(),
          },
          body: {
            getReader: () => ({
              read: () => Promise.resolve({ done: true, value: undefined }),
              releaseLock: jest.fn(),
            }),
          },
        } as unknown as Response)
      ) as jest.MockedFunction<typeof fetch>;

      // Mock TextDecoder
      global.TextDecoder = jest.fn().mockImplementation(() => ({
        decode: jest.fn().mockReturnValue(''),
      }));
    });

    afterEach(() => {
      global.fetch = originalFetch;
      global.TextDecoder = originalTextDecoder;
    });

    it('should call prepareRequest with correct parameters', async () => {
      const url = '/chat/stream';
      const body = { message: 'hello' };
      const options: RequestOptions = { headers: { Authorization: 'Bearer token' } };

      const stream = client.chatStream(url, body, options);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(mockPrepareRequest).toHaveBeenCalledWith(
        'https://api.example.com',
        url,
        'POST',
        options,
        // @ts-ignore - accessing private property for testing
        client.urlProcessors,
        // @ts-ignore - accessing private property for testing
        client.headerProcessors
      );
    });

    it('should make fetch request with correct parameters', async () => {
      const url = '/chat/stream';
      const body = { message: 'hello' };
      const options: RequestOptions = { headers: { Authorization: 'Bearer token' } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        Promise.resolve({
          ok: true,
          status: 200,
          headers: {
            forEach: jest.fn(),
          },
          body: {
            getReader: () => ({
              read: () => Promise.resolve({ done: true, value: undefined }),
              releaseLock: jest.fn(),
            }),
          },
        } as unknown as Response)
      );

      const stream = client.chatStream(url, body, options);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/stream',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should throw error for non-ok responses', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        Promise.resolve({
          ok: false,
          status: 401,
          headers: {
            forEach: jest.fn(),
          },
          body: null,
        } as unknown as Response)
      );

      const stream = client.chatStream('/chat/stream', { message: 'hello' });
      
      await expect(async () => {
        for await (const chunk of stream) {
          // This will not be reached
        }
      }).rejects.toEqual(
        expect.objectContaining({
          status: 401,
          metadata: expect.objectContaining({
            isTransportFailure: false,
            isHttpSuccess: false,
            error: 'Stream Status Error',
          }),
        })
      );
    });

    it('should throw error when response body is empty', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        Promise.resolve({
          ok: true,
          status: 200,
          headers: {
            forEach: jest.fn(),
          },
          body: null,
        } as unknown as Response)
      );

      const stream = client.chatStream('/chat/stream', { message: 'hello' });
      
      await expect(async () => {
        for await (const chunk of stream) {
          // This will not be reached
        }
      }).rejects.toThrow('Response body is empty');
    });

    it('should handle streaming data correctly', async () => {
      // 创建一个模拟的流读取器
      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: 'data1' })
          .mockResolvedValueOnce({ done: false, value: 'data2' })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: jest.fn(),
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        Promise.resolve({
          ok: true,
          status: 200,
          headers: {
            forEach: jest.fn(),
          },
          body: {
            getReader: () => mockReader,
          },
        } as unknown as Response)
      );

      // Mock TextDecoder to return the raw value
      (global.TextDecoder as jest.MockedFunction<any>).mockImplementation(() => ({
        decode: jest.fn().mockImplementation((value) => value || ''),
      }));

      const stream = client.chatStream('/chat/stream', { message: 'hello' });
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['data1', 'data2']);
      expect(mockReader.releaseLock).toHaveBeenCalled();
    });
  });
});