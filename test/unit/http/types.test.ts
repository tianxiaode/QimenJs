/**
 * HTTP 包单元测试
 */

import { HttpMethod, HttpResponseType, HttpRequestOptions, HttpContext } from '@/http';

describe('HTTP Types', () => {
    describe('HttpMethod', () => {
        it('should support all HTTP methods', () => {
            const methods: HttpMethod[] = [
                'GET',
                'POST',
                'PUT',
                'DELETE',
                'PATCH',
                'HEAD',
                'OPTIONS',
            ];

            methods.forEach(method => {
                expect(method).toBeDefined();
            });
        });
    });

    describe('HttpResponseType', () => {
        it('should support all response types', () => {
            const types: HttpResponseType[] = ['json', 'text', 'blob', 'arraybuffer', 'stream'];

            types.forEach(type => {
                expect(type).toBeDefined();
            });
        });
    });

    describe('HttpRequestOptions', () => {
        it('should create minimal options', () => {
            const options: HttpRequestOptions = {
                url: '/api/test',
                method: 'GET',
            };

            expect(options.url).toBe('/api/test');
            expect(options.method).toBe('GET');
        });

        it('should create full options', () => {
            const options: HttpRequestOptions = {
                url: '/api/users',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token',
                },
                body: { name: 'test' },
                queryParams: { page: 1 },
                pathParams: [123],
                timeout: 5000,
                responseType: 'json',
                withCredentials: true,
            };

            expect(options.url).toBe('/api/users');
            expect(options.method).toBe('POST');
            expect(options.headers).toBeDefined();
            expect(options.body).toEqual({ name: 'test' });
            expect(options.timeout).toBe(5000);
        });
    });

    describe('HttpContext', () => {
        it('should extend BaseContext', () => {
            const context: HttpContext = {
                // BaseContext fields
                steps: [],
                metadata: {},
                // HttpContext fields
                request: {
                    url: '/api/test',
                    method: 'GET',
                    headers: {},
                    pathParams: [],
                    timeout: 30000,
                    responseType: 'json',
                    controller: new AbortController(),
                },
                response: {
                    status: 0,
                    isSuccess: false,
                    headers: {},
                    data: null,
                },
                error: null,
            };

            expect(context.steps).toEqual([]);
            expect(context.metadata).toEqual({});
            expect(context.request.url).toBe('/api/test');
        });

        it('should support all HTTP methods', () => {
            const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

            methods.forEach(method => {
                const context: HttpContext = {
                    steps: [],
                    metadata: {},
                    request: {
                        url: '/api/test',
                        method,
                        headers: {},
                        pathParams: [],
                        timeout: 30000,
                        responseType: 'json',
                        controller: new AbortController(),
                    },
                    response: {
                        status: 0,
                        isSuccess: false,
                        headers: {},
                        data: null,
                    },
                    error: null,
                };

                expect(context.request.method).toBe(method);
            });
        });

        it('should support response data', () => {
            const context: HttpContext = {
                steps: [],
                metadata: {},
                request: {
                    url: '/api/users',
                    method: 'GET',
                    headers: {},
                    pathParams: [],
                    timeout: 30000,
                    responseType: 'json',
                    controller: new AbortController(),
                },
                response: {
                    status: 200,
                    isSuccess: true,
                    headers: { 'Content-Type': 'application/json' },
                    data: { users: [] },
                },
                error: null,
            };

            expect(context.response.status).toBe(200);
            expect(context.response.isSuccess).toBe(true);
            expect(context.response.data).toEqual({ users: [] });
        });

        it('should support error state', () => {
            const context: HttpContext = {
                steps: [],
                metadata: {},
                error: new Error('Request failed'),
                request: {
                    url: '/api/test',
                    method: 'GET',
                    headers: {},
                    pathParams: [],
                    timeout: 30000,
                    responseType: 'json',
                    controller: new AbortController(),
                },
                response: {
                    status: 500,
                    isSuccess: false,
                    headers: {},
                    data: null,
                },
            };

            expect(context.error).toBeInstanceOf(Error);
            expect(context.response.status).toBe(500);
            expect(context.response.isSuccess).toBe(false);
        });

        it('should support abort controller', () => {
            const controller = new AbortController();
            const context: HttpContext = {
                steps: [],
                metadata: {},
                request: {
                    url: '/api/test',
                    method: 'GET',
                    headers: {},
                    pathParams: [],
                    timeout: 30000,
                    responseType: 'json',
                    controller,
                    signal: controller.signal,
                },
                response: {
                    status: 0,
                    isSuccess: false,
                    headers: {},
                    data: null,
                },
                error: null,
            };

            expect(context.request.controller).toBe(controller);
            expect(context.request.signal).toBe(controller.signal);
        });
    });
});
