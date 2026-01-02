import { HttpResponse } from '@/http/models/HttpResponse';
import { RawBody } from '@/http/types';

describe('HttpResponse', () => {
  describe('constructor', () => {
    it('should create an instance with all required properties', () => {
      const payload = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        rawBody: JSON.stringify({ id: 1, name: 'John Doe' }) as RawBody,
      };

      const response = new HttpResponse(payload);

      expect(response.status).toBe(payload.status);
      expect(response.headers).toEqual(payload.headers);
      expect(response.rawBody).toBe(payload.rawBody);
    });

    it('should have isTransportFailure set to false by default', () => {
      const payload = {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
        rawBody: 'Not Found' as RawBody,
      };

      const response = new HttpResponse(payload);

      expect(response.isTransportFailure).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should accept different types of rawBody', () => {
      // Test with string rawBody
      let payload = {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
        rawBody: 'Hello World' as RawBody,
      };

      let response = new HttpResponse(payload);
      expect(response.rawBody).toBe('Hello World');

      // Test with null rawBody
      payload = {
        status: 204,
        headers: { 'Content-Type': 'application/json' },
        rawBody: null as RawBody,
      };
      response = new HttpResponse(payload);
      expect(response.rawBody).toBeNull();

      // Test with object rawBody
      const bodyObject = { message: 'success', data: [1, 2, 3] };
      payload = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        rawBody: bodyObject as RawBody,
      };
      response = new HttpResponse(payload);
      expect(response.rawBody).toEqual(bodyObject);

      // Test with ArrayBuffer rawBody (mocking)
      const mockArrayBuffer = new ArrayBuffer(8);
      payload = {
        status: 200,
        headers: { 'Content-Type': 'application/octet-stream' },
        rawBody: mockArrayBuffer as RawBody,
      };
      response = new HttpResponse(payload);
      expect(response.rawBody).toEqual(mockArrayBuffer);
    });

    it('should handle headers with multiple values', () => {
      const payload = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Custom-Header': 'custom-value',
        },
        rawBody: JSON.stringify({ success: true }) as RawBody,
      };

      const response = new HttpResponse(payload);

      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Cache-Control']).toBe('no-cache');
      expect(response.headers['X-Custom-Header']).toBe('custom-value');
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const payload = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        rawBody: JSON.stringify({ id: 1 }) as RawBody,
      };

      const response = new HttpResponse(payload);

      // Properties should maintain their initial values
      expect(response.status).toBe(payload.status);
      expect(response.headers).toEqual(payload.headers);
      expect(response.rawBody).toEqual(payload.rawBody);
    });

    it('should have readonly isTransportFailure property', () => {
      const payload = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        rawBody: JSON.stringify({ id: 1 }) as RawBody,
      };

      const response = new HttpResponse(payload);

      // The value should remain false as defined in the class
      expect(response.isTransportFailure).toBe(false);
    });
  });

  describe('property access', () => {
    it('should allow access to all properties', () => {
      const payload = {
        status: 201,
        headers: { Location: '/api/users/123' },
        rawBody: JSON.stringify({ id: 123, name: 'New User' }) as RawBody,
      };

      const response = new HttpResponse(payload);

      expect(response.status).toBe(201);
      expect(response.headers).toEqual({ Location: '/api/users/123' });
      expect(response.rawBody).toBe(JSON.stringify({ id: 123, name: 'New User' }));
      expect(response.isTransportFailure).toBe(false);
    });
  });
});