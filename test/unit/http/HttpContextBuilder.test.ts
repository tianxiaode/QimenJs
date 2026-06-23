/**
 * HttpContextBuilder 单元测试
 */

import { HttpContextBuilder } from '@/http';
import type { HttpContext } from '@/http';

describe('HttpContextBuilder', () => {
    describe('create', () => {
        it('should create new builder instance', () => {
            const builder = HttpContextBuilder.create();
            expect(builder).toBeInstanceOf(HttpContextBuilder);
        });
    });

    describe('fromOptions', () => {
        it('should create builder from minimal options', () => {
            const builder = HttpContextBuilder.fromOptions({
                url: '/api/test',
                method: 'GET',
            });
            
            const context = builder.build();
            expect(context.request.url).toBe('/api/test');
            expect(context.request.method).toBe('GET');
            expect(context.request.headers).toEqual({});
            expect(context.request.timeout).toBe(30000);
            expect(context.request.responseType).toBe('json');
        });

        it('should create builder from full options', () => {
            const builder = HttpContextBuilder.fromOptions({
                url: '/api/users',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: { name: 'test' },
                queryParams: { page: 1 },
                pathParams: [123],
                timeout: 5000,
                responseType: 'json',
                withCredentials: true,
            });
            
            const context = builder.build();
            expect(context.request.url).toBe('/api/users');
            expect(context.request.method).toBe('POST');
            expect(context.request.headers).toEqual({ 'Content-Type': 'application/json' });
            expect(context.request.body).toEqual({ name: 'test' });
            expect(context.request.queryParams).toEqual({ page: 1 });
            expect(context.request.pathParams).toEqual([123]);
            expect(context.request.timeout).toBe(5000);
            expect(context.request.withCredentials).toBe(true);
        });

        it('should initialize response with default values', () => {
            const builder = HttpContextBuilder.fromOptions({
                url: '/api/test',
                method: 'GET',
            });
            
            const context = builder.build();
            expect(context.response.status).toBe(0);
            expect(context.response.isSuccess).toBe(false);
            expect(context.response.headers).toEqual({});
            expect(context.response.data).toBeNull();
        });

        it('should create AbortController', () => {
            const builder = HttpContextBuilder.fromOptions({
                url: '/api/test',
                method: 'GET',
            });
            
            const context = builder.build();
            expect(context.request.controller).toBeInstanceOf(AbortController);
        });
    });

    describe('withRequest', () => {
        it('should set request properties', () => {
            const context = HttpContextBuilder
                .create()
                .withRequest({
                    url: '/api/test',
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer token' },
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'text',
                    controller: new AbortController(),
                })
                .withResponse({
                    status: 0,
                    isSuccess: false,
                    headers: {},
                    data: null,
                })
                .build();
            
            expect(context.request.url).toBe('/api/test');
            expect(context.request.method).toBe('POST');
            expect(context.request.headers).toEqual({ 'Authorization': 'Bearer token' });
        });
    });

    describe('withResponse', () => {
        it('should set response properties', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .withResponse({
                    status: 200,
                    isSuccess: true,
                    headers: { 'Content-Type': 'application/json' },
                    data: { id: 1 },
                })
                .build();
            
            expect(context.response.status).toBe(200);
            expect(context.response.isSuccess).toBe(true);
            expect(context.response.data).toEqual({ id: 1 });
        });
    });

    describe('withError', () => {
        it('should set error', () => {
            const error = new Error('Request failed');
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .withError(error)
                .build();
            
            expect(context.error).toBe(error);
        });
    });

    describe('withMetadata', () => {
        it('should set single metadata', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .withMetadata('domain', 'user')
                .withMetadata('action', 'list')
                .build();
            
            expect(context.metadata.domain).toBe('user');
            expect(context.metadata.action).toBe('list');
        });
    });

    describe('withMetadataMap', () => {
        it('should set multiple metadata', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .withMetadataMap({
                    domain: 'user',
                    action: 'list',
                    userId: 123,
                })
                .build();
            
            expect(context.metadata.domain).toBe('user');
            expect(context.metadata.action).toBe('list');
            expect(context.metadata.userId).toBe(123);
        });
    });

    describe('abort', () => {
        it('should mark context as aborted', () => {
            const builder = HttpContextBuilder.fromOptions({
                url: '/api/test',
                method: 'GET',
            });
            
            builder.abort();
            const context = builder.build();
            
            expect(context.isAborted).toBe(true);
        });

        it('should abort the controller', () => {
            const builder = HttpContextBuilder.fromOptions({
                url: '/api/test',
                method: 'GET',
            });
            
            const contextBefore = builder.build();
            const controller = contextBefore.request.controller;
            
            builder.abort();
            
            expect(controller.signal.aborted).toBe(true);
        });
    });

    describe('addStep', () => {
        it('should add execution step', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .addStep({
                    processor: 'TestProcessor',
                    action: 'executed',
                    duration: 100,
                })
                .build();
            
            expect(context.steps).toHaveLength(1);
            expect(context.steps[0].processor).toBe('TestProcessor');
            expect(context.steps[0].duration).toBe(100);
            expect(context.steps[0].action).toBe('executed');
        });

        it('should add multiple steps', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .addStep({ processor: 'P1', action: 'executed', duration: 100 })
                .addStep({ processor: 'P2', action: 'executed', duration: 200 })
                .addStep({ processor: 'P3', action: 'skipped', duration: 300 })
                .build();
            
            expect(context.steps).toHaveLength(3);
            expect(context.steps[0].processor).toBe('P1');
            expect(context.steps[1].processor).toBe('P2');
            expect(context.steps[2].processor).toBe('P3');
        });
    });

    describe('addSteps', () => {
        it('should add multiple steps at once', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .addSteps([
                    { processor: 'P1', action: 'executed', duration: 100 },
                    { processor: 'P2', action: 'executed', duration: 200 },
                ])
                .build();
            
            expect(context.steps).toHaveLength(2);
        });
    }); context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .addStep({
                    processor: 'TestProcessor',
                    duration: 100,
                    status: 'success',
                })
                .build();
            
            expect(context.steps).toHaveLength(1);
            expect(context.steps[0].processor).toBe('TestProcessor');
            expect(context.steps[0].duration).toBe(100);
            expect(context.steps[0].status).toBe('success');
        });

        it('should add multiple steps', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .addStep({ processor: 'P1', duration: 100, status: 'success' })
                .addStep({ processor: 'P2', duration: 200, status: 'success' })
                .addStep({ processor: 'P3', duration: 300, status: 'error' })
                .build();
            
            expect(context.steps).toHaveLength(3);
            expect(context.steps[0].processor).toBe('P1');
            expect(context.steps[1].processor).toBe('P2');
            expect(context.steps[2].processor).toBe('P3');
        });
    });

    describe('addSteps', () => {
        it('should add multiple steps at once', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .addSteps([
                    { processor: 'P1', duration: 100, status: 'success' },
                    { processor: 'P2', duration: 200, status: 'success' },
                ])
                .build();
            
            expect(context.steps).toHaveLength(2);
        });
    });

    describe('build', () => {
        it('should throw error if request is missing', () => {
            const builder = HttpContextBuilder.create();
            expect(() => builder.build()).toThrow('HttpContext is missing request information');
        });

        it('should throw error if response is missing', () => {
            const builder = HttpContextBuilder
                .create()
                .withRequest({
                    url: '/api/test',
                    method: 'GET',
                    headers: {},
                    pathParams: [],
                    timeout: 30000,
                    responseType: 'json',
                    controller: new AbortController(),
                });
            
            expect(() => builder.build()).toThrow('HttpContext is missing response information');
        });
    });

    describe('clone', () => {
        it('should clone the builder', () => {
            const original = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .withMetadata('domain', 'user')
                .withResponse({
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    data: { id: 1 },
                });
            
            const cloned = original.clone();
            const clonedContext = cloned.build();
            
            expect(clonedContext.request.url).toBe('/api/test');
            expect(clonedContext.metadata.domain).toBe('user');
            expect(clonedContext.response.status).toBe(200);
        });

        it('should create new AbortController in clone', () => {
            const original = HttpContextBuilder.fromOptions({
                url: '/api/test',
                method: 'GET',
            });
            
            const originalContext = original.build();
            const cloned = original.clone();
            const clonedContext = cloned.build();
            
            expect(clonedContext.request.controller).not.toBe(originalContext.request.controller);
        });
    });

    describe('chaining', () => {
        it('should support method chaining', () => {
            const context = HttpContextBuilder
                .fromOptions({ url: '/api/test', method: 'GET' })
                .withMetadata('domain', 'user')
                .withMetadata('action', 'list')
                .withResponse({
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    data: [],
                })
                .addStep({ processor: 'P1', action: 'executed', duration: 100 })
                .addStep({ processor: 'P2', action: 'executed', duration: 200 })
                .build();
            
            expect(context.request.url).toBe('/api/test');
            expect(context.metadata.domain).toBe('user');
            expect(context.metadata.action).toBe('list');
            expect(context.response.status).toBe(200);
            expect(context.steps).toHaveLength(2);
        });
    });toBe('user');
            expect(context.metadata.action).toBe('list');
            expect(context.response.status).toBe(200);
            expect(context.steps).toHaveLength(2);
        });
    });
});
