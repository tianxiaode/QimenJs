/**
 * RequestContextBuilder 单元测试
 */

import { RequestContextBuilder } from '@/context';

describe('RequestContextBuilder', () => {
    describe('create', () => {
        it('should create new builder instance', () => {
            const builder = RequestContextBuilder.create();
            expect(builder).toBeInstanceOf(RequestContextBuilder);
        });
    });

    describe('build', () => {
        it('should throw error without domain', () => {
            expect(() => {
                RequestContextBuilder.create().build();
            }).toThrow('RequestContext is missing domain');
        });

        it('should throw error without URL', () => {
            expect(() => {
                RequestContextBuilder
                    .create()
                    .withDomain('test')
                    .build();
            }).toThrow('RequestContext is missing URL');
        });

        it('should build with minimal requirements', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('test')
                .withUrl('/api/test')
                .build();
            
            expect(context.identity.domain).toBe('test');
            expect(context.request.url).toBe('/api/test');
        });
    });

    describe('chaining', () => {
        it('should support full workflow', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withEntityName('User')
                .withAction('list')
                .withUrl('/api/users')
                .withMethod('GET')
                .withHeaders({ 'Authorization': 'Bearer token' })
                .withQueryParams({ page: 1, size: 10 })
                .withParams({ filter: 'active' })
                .withMetadata('custom', 'value')
                .build();
            
            expect(context.identity.domain).toBe('user');
            expect(context.identity.entityName).toBe('User');
            expect(context.identity.action).toBe('list');
            expect(context.request.url).toBe('/api/users');
            expect(context.request.method).toBe('GET');
            expect(context.request.headers['Authorization']).toBe('Bearer token');
            expect(context.request.queryParams).toEqual({ page: 1, size: 10 });
            expect(context.data.params).toEqual({ filter: 'active' });
            expect(context.metadata.custom).toBe('value');
        });

        it('should support POST request', () => {
            const body = { name: 'John', email: 'john@example.com' };
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withMethod('POST')
                .withBody(body)
                .build();
            
            expect(context.request.method).toBe('POST');
            expect(context.request.body).toEqual(body);
        });

        it('should support response data', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withResponse({
                    status: 200,
                    isSuccess: true,
                    data: { users: [] },
                })
                .build();
            
            expect(context.response.status).toBe(200);
            expect(context.response.isSuccess).toBe(true);
            expect(context.response.data).toEqual({ users: [] });
        });

        it('should support error handling', () => {
            const error = new Error('Request failed');
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withError(error)
                .build();
            
            expect(context.error).toBe(error);
        });

        it('should support abort', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .abort()
                .build();
            
            expect(context.isAborted).toBe(true);
        });

        it('should support execution steps', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .addStep({ processor: 'P1', action: 'executed' })
                .addStep({ processor: 'P2', action: 'skipped' })
                .build();
            
            expect(context.steps).toHaveLength(2);
            expect(context.steps[0].processor).toBe('P1');
            expect(context.steps[1].processor).toBe('P2');
        });
    });

    describe('clone', () => {
        it('should clone builder', () => {
            const builder1 = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users');
            
            const builder2 = builder1.clone();
            const context1 = builder1.build();
            const context2 = builder2.build();
            
            expect(context1.identity.domain).toBe(context2.identity.domain);
            expect(context1.request.url).toBe(context2.request.url);
        });

        it('should create independent clone', () => {
            const builder1 = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users');
            
            const builder2 = builder1.clone();
            builder2.withDomain('post');
            
            const context1 = builder1.build();
            const context2 = builder2.build();
            
            expect(context1.identity.domain).toBe('user');
            expect(context2.identity.domain).toBe('post');
        });
    });

    describe('defaults', () => {
        it('should have correct default values', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('test')
                .withUrl('/api/test')
                .build();
            
            expect(context.request.method).toBe('GET');
            expect(context.request.timeout).toBe(30000);
            expect(context.request.responseType).toBe('json');
            expect(context.response.status).toBe(0);
            expect(context.response.isSuccess).toBe(false);
            expect(context.data.list).toEqual([]);
            expect(context.data.total).toBe(0);
            expect(context.isAborted).toBe(false);
            expect(context.steps).toEqual([]);
        });
    });
});
