/**
 * UrlBuilder 处理器单元测试
 */

import { UrlBuilderHandler } from '@/http/actions/prepare/UrlBuilder';
import { RequestContextBuilder } from '@orbitjs/context';

function createContext(options: {
    url?: string;
    pathParams?: any[];
    queryParams?: Record<string, any>;
    baseUrl?: string;
} = {}) {
    // RequestContextBuilder.build() requires a non-empty URL, so use a placeholder
    const context = RequestContextBuilder
        .create()
        .withDomain('test')
        .withUrl(options.url || '/placeholder')
        .withMethod('GET')
        .build();

    if (options.pathParams) context.request.pathParams = options.pathParams;
    if (options.queryParams) context.request.queryParams = options.queryParams;
    if (options.baseUrl) {
        context.metadata.domainConfig = { baseUrl: options.baseUrl };
    }

    return context;
}

describe('UrlBuilder', () => {
    describe('with original url', () => {
        it('should preserve original url when no baseUrl', async () => {
            const context = createContext({ url: '/api/users' });
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('/api/users');
        });

        it('should prepend baseUrl to original url', async () => {
            const context = createContext({
                url: '/api/users',
                baseUrl: 'https://api.example.com',
            });
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('https://api.example.com/api/users');
        });

        it('should strip leading slash from original url when prepending baseUrl', async () => {
            const context = createContext({
                url: '///api/users',
                baseUrl: 'https://api.example.com',
            });
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('https://api.example.com/api/users');
        });

        it('should append queryParams to original url', async () => {
            const context = createContext({
                url: '/api/users',
                queryParams: { page: 1, size: 10 },
            });
            await UrlBuilderHandler(context);
            expect(context.request.url).toContain('/api/users');
            expect(context.request.url).toContain('page=1');
            expect(context.request.url).toContain('size=10');
        });

        it('should combine baseUrl + original url + queryParams', async () => {
            const context = createContext({
                url: '/api/users',
                baseUrl: 'https://api.example.com',
                queryParams: { page: 1 },
            });
            await UrlBuilderHandler(context);
            expect(context.request.url).toContain('https://api.example.com/api/users');
            expect(context.request.url).toContain('page=1');
        });
    });

    describe('with pathParams only (no original url)', () => {
        it('should set url to baseUrl when no path or query', async () => {
            const context = createContext({ baseUrl: 'https://api.example.com' });
            // Clear the placeholder url to test pathParams-only path
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('https://api.example.com');
        });

        it('should strip trailing slashes from baseUrl', async () => {
            const context = createContext({ baseUrl: 'https://api.example.com///' });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('https://api.example.com');
        });

        it('should join pathParams to baseUrl', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com',
                pathParams: ['users', '123'],
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('https://api.example.com/users/123');
        });

        it('should use path only when no baseUrl', async () => {
            const context = createContext({ pathParams: ['users', 'list'] });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('users/list');
        });

        it('should filter falsy pathParams', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com',
                pathParams: ['users', null, '', 'details'],
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('https://api.example.com/users/details');
        });

        it('should append queryParams as query string', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com',
                queryParams: { page: 1, size: 10 },
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toContain('page=1');
            expect(context.request.url).toContain('size=10');
        });

        it('should skip null/undefined queryParams', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com',
                queryParams: { page: 1, size: null, keyword: undefined },
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toContain('page=1');
            expect(context.request.url).not.toContain('size');
            expect(context.request.url).not.toContain('keyword');
        });

        it('should use & when baseUrl already contains ?', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com?existing=true',
                queryParams: { page: 1 },
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toContain('&page=1');
        });

        it('should use ? when url does not contain ?', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com',
                queryParams: { page: 1 },
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toContain('?page=1');
        });

        it('should handle empty pathParams and queryParams', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com',
                pathParams: [],
                queryParams: {},
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('https://api.example.com');
        });

        it('should handle no domainConfig (no baseUrl)', async () => {
            const context = createContext({ pathParams: ['api', 'test'] });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toBe('api/test');
        });

        it('should handle pathParams with baseUrl and queryParams', async () => {
            const context = createContext({
                baseUrl: 'https://api.example.com',
                pathParams: ['users'],
                queryParams: { page: 1 },
            });
            context.request.url = '';
            await UrlBuilderHandler(context);
            expect(context.request.url).toContain('https://api.example.com/users');
            expect(context.request.url).toContain('page=1');
        });
    });
});
