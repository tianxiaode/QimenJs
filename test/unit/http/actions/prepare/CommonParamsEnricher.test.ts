/**
 * CommonParamsEnricher 处理器单元测试
 */

import { CommonParamsEnricherHandler } from '@/http/actions/prepare/CommonParamsEnricher';
import { RequestContextBuilder } from '@qimenjs/context';

function createContext(domainConfig: any = {}, requestOverrides: any = {}) {
    const context = RequestContextBuilder.create()
        .withDomain('test')
        .withUrl('/api/test')
        .withMethod('GET')
        .build();

    context.metadata.domainConfig = domainConfig;
    Object.assign(context.request, requestOverrides);

    return context;
}

describe('CommonParamsEnricher', () => {
    describe('commonParams', () => {
        it('should merge object commonParams into queryParams', async () => {
            const context = createContext(
                { commonParams: { version: 'v1', lang: 'en' } },
                { queryParams: { page: 1 } }
            );
            await CommonParamsEnricherHandler(context);
            expect(context.request.queryParams).toEqual({
                version: 'v1',
                lang: 'en',
                page: 1,
            });
        });

        it('should call function commonParams and merge result', async () => {
            const context = createContext(
                { commonParams: () => ({ ts: 123 }) },
                { queryParams: { page: 1 } }
            );
            await CommonParamsEnricherHandler(context);
            expect(context.request.queryParams).toEqual({ ts: 123, page: 1 });
        });

        it('should not modify queryParams when no commonParams', async () => {
            const context = createContext({}, { queryParams: { page: 1 } });
            await CommonParamsEnricherHandler(context);
            expect(context.request.queryParams).toEqual({ page: 1 });
        });
    });

    describe('commonBody', () => {
        it('should merge object commonBody into existing body', async () => {
            const context = createContext(
                { commonBody: { appId: 'myapp' } },
                { body: { name: 'test' } }
            );
            await CommonParamsEnricherHandler(context);
            expect(context.request.body).toEqual({ appId: 'myapp', name: 'test' });
        });

        it('should call function commonBody and merge result', async () => {
            const context = createContext(
                { commonBody: () => ({ appId: 'myapp' }) },
                { body: { name: 'test' } }
            );
            await CommonParamsEnricherHandler(context);
            expect(context.request.body).toEqual({ appId: 'myapp', name: 'test' });
        });

        it('should set body from commonBody when no existing body', async () => {
            const context = createContext({ commonBody: { appId: 'myapp' } });
            await CommonParamsEnricherHandler(context);
            expect(context.request.body).toEqual({ appId: 'myapp' });
        });

        it('should not overwrite non-object body with commonBody', async () => {
            const context = createContext(
                { commonBody: { appId: 'myapp' } },
                { body: 'raw-string' }
            );
            await CommonParamsEnricherHandler(context);
            // body is a string, not an object, so commonBody should not merge
            expect(context.request.body).toBe('raw-string');
        });

        it('should not modify body when no commonBody', async () => {
            const context = createContext({}, { body: { name: 'test' } });
            await CommonParamsEnricherHandler(context);
            expect(context.request.body).toEqual({ name: 'test' });
        });
    });

    describe('no domainConfig', () => {
        it('should handle missing domainConfig gracefully', async () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();
            // No domainConfig set
            await CommonParamsEnricherHandler(context);
            expect(context.request.queryParams).toBeUndefined();
        });
    });
});
