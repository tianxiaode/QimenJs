import { FetchTransport } from '@/http/transport/FetchTransport';
import { HttpResponse } from '@/http/models/HttpResponse';
import { RequestOptions, TransportFailureReason } from '@/http/types';

describe('FetchTransport', () => {
  let fetchTransport: FetchTransport;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    fetchTransport = new FetchTransport();
    mockFetch = jest.fn();
    (global as any).fetch = mockFetch;
    // 默认每个测试使用真实时间，除非特定测试开启虚假时间
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('send - Core Logic', () => {
    it('should successfully send a GET request and return HttpResponse', async () => {
      const mockResponse = {
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const req = {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: {},
        body: null,
        options: {} as RequestOptions,
      };

      const result = await fetchTransport.send(req);
      expect(result).toBeInstanceOf(HttpResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle FormData body and not stringify it', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Headers(),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      });

      const formData = new FormData();
      const req = {
        url: 'https://api.example.com/upload',
        method: 'POST',
        headers: {},
        body: formData,
        options: {} as RequestOptions,
      };

      await fetchTransport.send(req);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ body: formData })
      );
    });
  });

  describe('send - Abort & Timeout (Coverage for Line 160, 166, 171)', () => {
    // 覆盖 Line 160: 外部信号已提前触发
    it('should abort immediately if external signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort('user-pre-cancel');

      const req = {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: {},
        body: null,
        options: { signal: controller.signal } as RequestOptions,
      };

      const result = await fetchTransport.send(req);

      expect(result).toEqual(expect.objectContaining({
        isTransportFailure: true,
        reason: TransportFailureReason.Aborted,
        message: 'Request cancelled by user',
      }));
    });

    // 覆盖 Line 166, 171: 超时逻辑
    it('should handle request timeout using internal controller', async () => {
      jest.useFakeTimers();
      
      // 模拟一个挂起的 fetch
      mockFetch.mockImplementation((_, init) => {
        return new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            const error = new Error('AbortError');
            error.name = 'AbortError';
            reject(error);
          });
        });
      });

      const req = {
        url: 'https://api.example.com/timeout',
        method: 'GET',
        headers: {},
        body: null,
        options: { timeout: 1000 } as RequestOptions,
      };

      const promise = fetchTransport.send(req);
      
      // 触发超时
      jest.advanceTimersByTime(1001);
      
      const result = await promise;
      expect(result).toEqual(expect.objectContaining({
        isTransportFailure: true,
        reason: TransportFailureReason.Aborted,
        message: 'Request timeout',
      }));

      jest.useRealTimers();
    });
  });

  describe('send - Response Handling (Coverage for handleRawBody)', () => {
    const createMockResponse = (headersObj: any, bodyMethod: string, bodyValue: any) => ({
      status: 200,
      headers: new Headers(headersObj),
      [bodyMethod]: jest.fn().mockResolvedValue(bodyValue),
      arrayBuffer: bodyMethod === 'arrayBuffer' 
        ? jest.fn().mockResolvedValue(bodyValue) 
        : jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      body: bodyMethod === 'stream' ? bodyValue : null
    });

    it('should handle arraybuffer as default/explicit responseType', async () => {
      const buffer = new ArrayBuffer(4);
      mockFetch.mockResolvedValue(createMockResponse({}, 'arrayBuffer', buffer));

      const result = await fetchTransport.send({
        url: 'url', method: 'GET', headers: {}, body: null, 
        options: { responseType: 'arraybuffer' } as RequestOptions 
      });

      expect((result as HttpResponse).rawBody).toBe(buffer);
    });

    it('should handle blob responseType', async () => {
      const blob = new Blob();
      const mockRes = createMockResponse({}, 'blob', blob);
      mockFetch.mockResolvedValue(mockRes);

      const result = await fetchTransport.send({
        url: 'url', method: 'GET', headers: {}, body: null, 
        options: { responseType: 'blob' } as RequestOptions 
      });

      expect(mockRes.blob).toHaveBeenCalled();
      expect((result as HttpResponse).rawBody).toBe(blob);
    });

    it('should handle text responseType', async () => {
      const text = 'hello';
      const mockRes = createMockResponse({}, 'text', text);
      mockFetch.mockResolvedValue(mockRes);

      const result = await fetchTransport.send({
        url: 'url', method: 'GET', headers: {}, body: null, 
        options: { responseType: 'text' } as RequestOptions 
      });

      expect(mockRes.text).toHaveBeenCalled();
      expect((result as HttpResponse).rawBody).toBe(text);
    });

    it('should auto-detect stream via content-type', async () => {
      const stream = {}; // Mock stream
      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/event-stream' }),
        body: stream,
      });

      const result = await fetchTransport.send({
        url: 'url', method: 'GET', headers: {}, body: null, options: {} as RequestOptions 
      });

      expect((result as HttpResponse).rawBody).toBe(stream);
    });
  });

  describe('handleError - (Coverage for Line 200-201)', () => {
    // 覆盖没有任何 message 的异常对象
    it('should handle generic error without message or name', async () => {
      mockFetch.mockRejectedValue({}); // 抛出一个空对象

      const result = await fetchTransport.send({
        url: 'url', method: 'GET', headers: {}, body: null, options: {} as RequestOptions 
      });

      expect(result).toEqual(expect.objectContaining({
        isTransportFailure: true,
        reason: TransportFailureReason.NetworkError,
        message: 'Network communication failure',
      }));
    });

    it('should handle specific network error message', async () => {
      mockFetch.mockRejectedValue(new Error('DNS Failed'));

      const result = await fetchTransport.send({
        url: 'url', method: 'GET', headers: {}, body: null, options: {} as RequestOptions 
      });

      expect(result).toEqual(expect.objectContaining({
        message: 'DNS Failed',
      }));
    });
  });

  describe('Private Methods - Serialization & Headers', () => {
    it('serializeBody should handle null/undefined', () => {
      expect(fetchTransport['serializeBody'](null)).toBeUndefined();
    });

    it('serializeBody should stringify plain objects', () => {
      const data = { a: 1 };
      expect(fetchTransport['serializeBody'](data)).toBe(JSON.stringify(data));
    });

    it('extractHeaders should handle mixed case and conversion', () => {
      const h = new Headers();
      h.append('X-Test', 'Value');
      const result = fetchTransport['extractHeaders'](h);
      expect(result).toEqual({ 'x-test': 'Value' });
    });

    it('hasPayload should correctly identify methods', () => {
      expect(fetchTransport['hasPayload']('GET')).toBe(false);
      expect(fetchTransport['hasPayload']('POST')).toBe(true);
      expect(fetchTransport['hasPayload']('head')).toBe(false);
    });
  });
});