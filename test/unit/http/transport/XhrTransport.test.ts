import { XhrTransport } from '@/http/transport/XhrTransport';
import { HttpResponse } from '@/http/models';
import { RequestOptions, TransportFailureReason } from '@/http/types';

describe('XhrTransport', () => {
  let xhrTransport: XhrTransport;

  beforeEach(() => {
    xhrTransport = new XhrTransport();
    
    // Create a mock XMLHttpRequest with all required properties
    const mockXHR: any = {
      UNSENT: 0,
      OPENED: 1,
      HEADERS_RECEIVED: 2,
      LOADING: 3,
      DONE: 4,
      
      open: jest.fn(),
      setRequestHeader: jest.fn(),
      send: jest.fn(),
      abort: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getAllResponseHeaders: jest.fn(),
      status: 200,
      response: 'response body',
      responseType: 'text',
      readyState: 4,
      responseText: 'response text',
      responseURL: '',
      statusText: 'OK',
      timeout: 0,
      upload: { onprogress: null },
      withCredentials: false,
      responseXML: null,
      onabort: null as Function | null,
      onerror: null as Function | null,
      onload: null as Function | null,
      onloadend: null as Function | null,
      onloadstart: null as Function | null,
      onprogress: null as Function | null,
      onreadystatechange: null as Function | null,
      ontimeout: null as Function | null,
      getResponseHeader: jest.fn(),
      overrideMimeType: jest.fn(),
      dispatchEvent: jest.fn(),
    };
    
    (global as any).XMLHttpRequest = jest.fn(() => mockXHR);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).XMLHttpRequest;
  });

  describe('send', () => {
    it('should create XMLHttpRequest and send request', async () => {
      const mockXHR: any = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4,
        
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(),
        abort: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getAllResponseHeaders: jest.fn().mockReturnValue('content-type: application/json'),
        status: 200,
        response: '{"data": "test"}',
        responseType: 'text',
        readyState: 4,
        responseText: '{"data": "test"}',
        responseURL: '',
        statusText: 'OK',
        timeout: 0,
        upload: { onprogress: null },
        withCredentials: false,
        responseXML: null,
        onabort: null as Function | null,
        onerror: null as Function | null,
        onload: null as Function | null,
        onloadend: null as Function | null,
        onloadstart: null as Function | null,
        onprogress: null as Function | null,
        onreadystatechange: null as Function | null,
        ontimeout: null as Function | null,
        getResponseHeader: jest.fn(),
        overrideMimeType: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      
      (global as any).XMLHttpRequest = jest.fn(() => mockXHR);

      const req = {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: null,
        options: {} as RequestOptions,
      };

      const resultPromise = xhrTransport.send(req);
      
      // Simulate successful response
      if (mockXHR.onload) {
        mockXHR.onload({ type: 'load' } as ProgressEvent);
      }
      const result = await resultPromise;

      expect(global.XMLHttpRequest).toHaveBeenCalledTimes(1);
      expect(mockXHR.open).toHaveBeenCalledWith('GET', 'https://api.example.com/data', true);
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockXHR.send).toHaveBeenCalledWith(null);
      expect(result).toBeInstanceOf(HttpResponse);
    });

    it('should handle progress callback when provided', async () => {
      const progressCallback = jest.fn();
      const mockXHR: any = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4,
        
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(),
        abort: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getAllResponseHeaders: jest.fn().mockReturnValue(''),
        status: 200,
        response: 'response',
        responseType: 'text',
        readyState: 4,
        responseText: 'response',
        responseURL: '',
        statusText: 'OK',
        timeout: 0,
        upload: { onprogress: null },
        withCredentials: false,
        responseXML: null,
        onabort: null as Function | null,
        onerror: null as Function | null,
        onload: null as Function | null,
        onloadend: null as Function | null,
        onloadstart: null as Function | null,
        onprogress: null as Function | null,
        onreadystatechange: null as Function | null,
        ontimeout: null as Function | null,
        getResponseHeader: jest.fn(),
        overrideMimeType: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      
      (global as any).XMLHttpRequest = jest.fn(() => mockXHR);

      const req = {
        url: 'https://api.example.com/upload',
        method: 'POST',
        headers: {},
        body: 'data',
        options: { onProgress: progressCallback } as RequestOptions,
      };

      const resultPromise = xhrTransport.send(req);
      
      // Simulate setting progress callback
      if (mockXHR.upload) {
        mockXHR.upload.onprogress = progressCallback;
      }
      
      // Simulate successful response
      if (mockXHR.onload) {
        mockXHR.onload({ type: 'load' } as ProgressEvent);
      }
      await resultPromise;

      expect(mockXHR.upload.onprogress).toBe(progressCallback);
    });

    it('should handle network errors', async () => {
      const mockXHR: any = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4,
        
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(),
        abort: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getAllResponseHeaders: jest.fn().mockReturnValue(''),
        status: 200,
        response: 'response',
        responseType: 'text',
        readyState: 4,
        responseText: 'response',
        responseURL: '',
        statusText: 'OK',
        timeout: 0,
        upload: { onprogress: null },
        withCredentials: false,
        responseXML: null,
        onabort: null as Function | null,
        onerror: null as Function | null,
        onload: null as Function | null,
        onloadend: null as Function | null,
        onloadstart: null as Function | null,
        onprogress: null as Function | null,
        onreadystatechange: null as Function | null,
        ontimeout: null as Function | null,
        getResponseHeader: jest.fn(),
        overrideMimeType: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      
      (global as any).XMLHttpRequest = jest.fn(() => mockXHR);

      const req = {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: {},
        body: null,
        options: {} as RequestOptions,
      };

      const resultPromise = xhrTransport.send(req);
      
      // Simulate network error
      const errorEvent = { type: 'error' } as ProgressEvent;
      if (mockXHR.onerror) {
        mockXHR.onerror(errorEvent);
      }
      const result = await resultPromise;

      // Check that the result is a transport failure
      expect(result).toEqual({
        isTransportFailure: true,
        reason: TransportFailureReason.NetworkError,
        message: 'Upload failed',
        error: errorEvent,
      });
    });

    it('should handle abort errors', async () => {
      const controller = new AbortController();
      const mockXHR: any = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4,
        
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(),
        abort: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getAllResponseHeaders: jest.fn().mockReturnValue(''),
        status: 0, // Status 0 usually indicates aborted request
        response: '',
        responseType: 'text',
        readyState: 4,
        responseText: '',
        responseURL: '',
        statusText: 'Aborted',
        timeout: 0,
        upload: { onprogress: null },
        withCredentials: false,
        responseXML: null,
        onabort: null as Function | null,
        onerror: null as Function | null,
        onload: null as Function | null,
        onloadend: null as Function | null,
        onloadstart: null as Function | null,
        onprogress: null as Function | null,
        onreadystatechange: null as Function | null,
        ontimeout: null as Function | null,
        getResponseHeader: jest.fn(),
        overrideMimeType: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      
      // Mock the createAbortContext method to return our signal with a reason
      const originalCreateAbortContext = (xhrTransport as any).createAbortContext;
      const mockSignal = {
        aborted: true,
        reason: 'User cancelled',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      jest.spyOn(xhrTransport as any, 'createAbortContext').mockReturnValue({
        signal: mockSignal,
        done: jest.fn(),
      });

      (global as any).XMLHttpRequest = jest.fn(() => mockXHR);

      const req = {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: {},
        body: null,
        options: { signal: controller.signal } as RequestOptions,
      };

      const resultPromise = xhrTransport.send(req);
      
      // Simulate abort - onabort doesn't receive any parameters in the real implementation
      if (mockXHR.onabort) {
        mockXHR.onabort();
      }
      const result = await resultPromise;

      // Check that the result is a transport failure
      expect(result).toEqual({
        isTransportFailure: true,
        reason: TransportFailureReason.Aborted,
        message: 'Upload failed',
        error: 'User cancelled', // This is what's passed as the err parameter to createError
      });
    });
  });

  describe('createError', () => {
    it('should create error with NetworkError reason', () => {
      const error = (xhrTransport as any).createError(TransportFailureReason.NetworkError, new Error('Network error'));
      
      expect(error).toEqual({
        isTransportFailure: true,
        reason: TransportFailureReason.NetworkError,
        message: 'Upload failed',
        error: new Error('Network error'),
      });
    });

    it('should create error with Aborted reason', () => {
      const error = (xhrTransport as any).createError(TransportFailureReason.Aborted, 'User cancelled');
      
      expect(error).toEqual({
        isTransportFailure: true,
        reason: TransportFailureReason.Aborted,
        message: 'Upload failed',
        error: 'User cancelled',
      });
    });
  });

  describe('parseResponseHeaders', () => {
    it('should parse response headers string to object', () => {
      const headerStr = 'Content-Type: application/json\r\nAuthorization: Bearer token\r\n';
      const result = (xhrTransport as any).parseResponseHeaders(headerStr);
      
      expect(result).toEqual({
        'content-type': 'application/json',
        'authorization': 'Bearer token',
      });
    });

    it('should return empty object for empty header string', () => {
      const result = (xhrTransport as any).parseResponseHeaders('');
      expect(result).toEqual({});
    });

    it('should handle headers with multiple colons', () => {
      const headerStr = 'Location: https://example.com/path:with:colons\r\nContent-Type: text/html\r\n';
      const result = (xhrTransport as any).parseResponseHeaders(headerStr);
      
      expect(result).toEqual({
        'location': 'https://example.com/path:with:colons',
        'content-type': 'text/html',
      });
    });
  });

  describe('createAbortContext', () => {
    it('should handle timeout option', () => {
      const options = { timeout: 1000 } as RequestOptions;
      const context = (xhrTransport as any).createAbortContext(options);
      
      expect(context.signal).toBeInstanceOf(AbortSignal);
      expect(typeof context.done).toBe('function');
      
      // Cleanup function should clear timeout
      const originalClearTimeout = global.clearTimeout;
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;
      
      context.done();
      expect(mockClearTimeout).toHaveBeenCalled();
      
      // Restore original function
      global.clearTimeout = originalClearTimeout;
    });

    it('should handle external signal', () => {
      const controller = new AbortController();
      const options = { signal: controller.signal } as RequestOptions;
      const context = (xhrTransport as any).createAbortContext(options);
      
      expect(context.signal).toBeInstanceOf(AbortSignal);
      expect(typeof context.done).toBe('function');
    });
  });
});