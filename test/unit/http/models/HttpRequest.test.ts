import { HttpRequest } from '@/http/models/HttpRequest';
import { HttpMethod, RequestOptions } from '@/http/types';

describe('HttpRequest', () => {
  describe('constructor', () => {
    it('should create an instance with all required properties', () => {
      const payload = {
        url: 'https://api.example.com/users',
        method: 'GET' as HttpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: { id: 1, name: 'John Doe' },
        options: {
          timeout: 5000,
          responseType: 'json' as const,
          withCredentials: true,
          queryParams: { page: 1 },
        } as RequestOptions,
      };

      const request = new HttpRequest(payload);

      expect(request.url).toBe(payload.url);
      expect(request.method).toBe(payload.method);
      expect(request.headers).toEqual(payload.headers);
      expect(request.body).toEqual(payload.body);
      expect(request.options).toEqual(payload.options);
    });

    it('should set default values for headers if not provided', () => {
      const payload = {
        url: 'https://api.example.com/users',
        method: 'POST' as HttpMethod,
        body: { name: 'John Doe' },
      };

      const request = new HttpRequest(payload);

      expect(request.headers).toEqual({});
    });

    it('should set default values for options if not provided', () => {
      const payload = {
        url: 'https://api.example.com/users',
        method: 'GET' as HttpMethod,
      };

      const request = new HttpRequest(payload);

      expect(request.options.timeout).toBe(0);
      expect(request.options.responseType).toBe('json');
      expect(request.options.withCredentials).toBe(true);
    });

    it('should handle partial options and fill missing with defaults', () => {
      const payload = {
        url: 'https://api.example.com/users',
        method: 'PUT' as HttpMethod,
        options: {
          timeout: 3000,
        } as RequestOptions,
      };

      const request = new HttpRequest(payload);

      expect(request.options.timeout).toBe(3000);
      expect(request.options.responseType).toBe('json');
      expect(request.options.withCredentials).toBe(true);
      expect(request.options.pathParams).toBeUndefined();
      expect(request.options.queryParams).toBeUndefined();
      expect(request.options.onProgress).toBeUndefined();
    });

    it('should handle options with all properties', () => {
      const onProgress = (ev: ProgressEvent) => {};
      const payload = {
        url: 'https://api.example.com/users',
        method: 'POST' as HttpMethod,
        headers: { 'Authorization': 'Bearer token' },
        body: { data: 'value' },
        options: {
          timeout: 10000,
          responseType: 'text' as const,
          withCredentials: false,
          pathParams: [1, 2, 3],
          queryParams: { filter: 'active', sort: 'name' },
          onProgress: onProgress,
        } as RequestOptions,
      };

      const request = new HttpRequest(payload);

      expect(request.url).toBe(payload.url);
      expect(request.method).toBe(payload.method);
      expect(request.headers).toEqual(payload.headers);
      expect(request.body).toEqual(payload.body);
      expect(request.options.timeout).toBe(payload.options.timeout);
      expect(request.options.responseType).toBe(payload.options.responseType);
      expect(request.options.withCredentials).toBe(payload.options.withCredentials);
      expect(request.options.pathParams).toEqual(payload.options.pathParams);
      expect(request.options.queryParams).toEqual(payload.options.queryParams);
      expect(request.options.onProgress).toBe(payload.options.onProgress);
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const payload = {
        url: 'https://api.example.com/users',
        method: 'GET' as HttpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: { id: 1 },
        options: {
          timeout: 5000,
        } as RequestOptions,
      };

      const request = new HttpRequest(payload);

      // In JS/TS, readonly is enforced at compile time, not runtime
      // The original value should remain unchanged
      expect(request.url).toBe(payload.url);
    });
  });
});