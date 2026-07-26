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
                RequestContextBuilder.create().withDomain('test').build();
            }).toThrow('RequestContext is missing URL');
        });

        it('should build with minimal requirements', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .build();

            expect(context.identity.domain).toBe('test');
            expect(context.request.url).toBe('/api/test');
        });

        it('should not fail when domain is not registered', () => {
            // 使用未注册的 domain
            const context = RequestContextBuilder.create()
                .withDomain('unregistered-domain')
                .withUrl('/api/test')
                .build();

            // 应该不会报错，只是 domainConfig 为 undefined
            expect(context.identity.domain).toBe('unregistered-domain');
            // domainConfig 可能为 undefined（如果 Registry.domain 不存在）
        });
    });

    describe('chaining', () => {
        it('should support full workflow', () => {
            const context = RequestContextBuilder.create()
                .withDomain('user')
                .withEntityName('User')
                .withAction('list')
                .withUrl('/api/users')
                .withMethod('GET')
                .withHeaders({ Authorization: 'Bearer token' })
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
            const context = RequestContextBuilder.create()
                .withDomain('user')
                .withUrl('/api/users')
                .withMethod('POST')
                .withBody(body)
                .build();

            expect(context.request.method).toBe('POST');
            expect(context.request.body).toEqual(body);
        });

        it('should support response data', () => {
            const context = RequestContextBuilder.create()
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
            const context = RequestContextBuilder.create()
                .withDomain('user')
                .withUrl('/api/users')
                .withError(error)
                .build();

            expect(context.error).toBe(error);
        });

        it('should support abort', () => {
            const context = RequestContextBuilder.create()
                .withDomain('user')
                .withUrl('/api/users')
                .abort()
                .build();

            expect(context.isAborted).toBe(true);
        });

        it('should support execution steps', () => {
            const context = RequestContextBuilder.create()
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
            const builder1 = RequestContextBuilder.create()
                .withDomain('user')
                .withUrl('/api/users');

            const builder2 = builder1.clone();
            const context1 = builder1.build();
            const context2 = builder2.build();

            expect(context1.identity.domain).toBe(context2.identity.domain);
            expect(context1.request.url).toBe(context2.request.url);
        });

        it('should create independent clone', () => {
            const builder1 = RequestContextBuilder.create()
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
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .build();

            expect(context.request.method).toBe('GET');
            expect(context.request.timeout).toBe(30000);
            expect(context.request.responseType).toBe('json');
            expect(context.request.headers).toEqual({});
            expect(context.response.status).toBe(0);
            expect(context.response.isSuccess).toBe(false);
            expect(context.data.list).toEqual([]);
            expect(context.data.total).toBe(0);
            expect(context.isAborted).toBe(false);
            expect(context.steps).toEqual([]);
        });
    });

    describe('withRequest undefined handling', () => {
        it('should not overwrite headers with undefined', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withHeaders({ Authorization: 'Bearer token' })
                .withRequest({ headers: undefined } as any)
                .build();

            expect(context.request.headers).toEqual({ Authorization: 'Bearer token' });
        });

        it('should not overwrite queryParams with undefined', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withQueryParams({ page: 1 })
                .withRequest({ queryParams: undefined } as any)
                .build();

            expect(context.request.queryParams).toEqual({ page: 1 });
        });

        it('should merge valid fields while ignoring undefined', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withRequest({ method: 'POST', headers: undefined, timeout: undefined } as any)
                .build();

            expect(context.request.method).toBe('POST');
            expect(context.request.headers).toEqual({});
            expect(context.request.timeout).toBe(30000);
        });
    });

    describe('withResponse undefined handling', () => {
        it('should not overwrite status with undefined', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withResponse({ status: 200, isSuccess: true })
                .withResponse({ data: undefined } as any)
                .build();

            expect(context.response.status).toBe(200);
            expect(context.response.isSuccess).toBe(true);
        });
    });

    describe('withData undefined handling', () => {
        it('should not overwrite list with undefined', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withData({ list: [{ id: 1 }], total: 1 })
                .withData({ list: undefined, total: undefined } as any)
                .build();

            expect(context.data.list).toEqual([{ id: 1 }]);
            expect(context.data.total).toBe(1);
        });
    });

    describe('withIdentity', () => {
        it('should merge identity fields', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withIdentity({ entityName: 'User', action: 'list' })
                .build();

            expect(context.identity.domain).toBe('test');
            expect(context.identity.entityName).toBe('User');
            expect(context.identity.action).toBe('list');
        });
    });

    describe('withMetadataMap', () => {
        it('should batch set metadata', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMetadataMap({
                    isTransportFailure: true,
                    contentType: 'application/json',
                    isJson: true,
                })
                .build();

            expect(context.metadata.isTransportFailure).toBe(true);
            expect(context.metadata.contentType).toBe('application/json');
            expect(context.metadata.isJson).toBe(true);
        });

        it('should merge with existing metadata', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMetadata('custom', 'value')
                .withMetadataMap({ isUpload: true })
                .build();

            expect(context.metadata.custom).toBe('value');
            expect(context.metadata.isUpload).toBe(true);
        });
    });

    describe('addSteps', () => {
        it('should batch add execution steps', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .addSteps([
                    { processor: 'P1', action: 'executed' },
                    { processor: 'P2', action: 'skipped' },
                    { processor: 'P3', action: 'terminated' },
                ])
                .build();

            expect(context.steps).toHaveLength(3);
            expect(context.steps[0].processor).toBe('P1');
            expect(context.steps[1].processor).toBe('P2');
            expect(context.steps[2].processor).toBe('P3');
        });

        it('should work with addStep together', () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .addStep({ processor: 'P0', action: 'executed' })
                .addSteps([
                    { processor: 'P1', action: 'executed' },
                    { processor: 'P2', action: 'skipped' },
                ])
                .build();

            expect(context.steps).toHaveLength(3);
        });
    });

    describe('withAlignToFrontend', () => {
        it('should set alignToFrontend method', () => {
            const alignFn = (target: any) => ({ ...target, aligned: true });
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withAlignToFrontend(alignFn)
                .build();

            const result = context.alignToFrontend({ id: 1 });
            expect(result).toEqual({ id: 1, aligned: true });
        });
    });

    describe('withSchema', () => {
        it('should set schema', () => {
            const schema = { type: 'object', properties: { name: { type: 'string' } } };
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withSchema(schema)
                .build();

            expect(context.schema).toEqual(schema);
        });
    });

    describe('clone with controller', () => {
        it('should recreate AbortController in clone', () => {
            const builder1 = RequestContextBuilder.create()
                .withDomain('user')
                .withUrl('/api/users');

            const builder2 = builder1.clone();
            const context2 = builder2.build();

            expect(context2.request.controller).toBeInstanceOf(AbortController);
        });

        it('should handle clone without controller', () => {
            const builder1 = RequestContextBuilder.create()
                .withDomain('user')
                .withUrl('/api/users');
            (builder1 as any).context.request = { url: '/api/users', method: 'GET', headers: {} };

            const builder2 = builder1.clone();
            const context2 = builder2.build();

            expect(context2.request.url).toBe('/api/users');
        });
    });
});
