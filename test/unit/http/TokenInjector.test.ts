/**
 * TokenInjector 处理器测试
 */

import { TokenInjectorHandler } from '@/http/actions/prepare/TokenInjector';
import { RequestContextBuilder } from '@qimenjs/context';

describe('TokenInjector', () => {
    describe('bearer token', () => {
        it('should inject bearer token', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('api')
                .withUrl('/test')
                .withMethod('GET')
                .build();
            
            context.metadata.domainConfig = {
                token: 'test-token',
                authInjector: 'bearer',
            };
            
            await TokenInjectorHandler(context);
            
            expect(context.request.headers['Authorization']).toBe('Bearer test-token');
        });
        
        it('should use bearer by default', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('api')
                .withUrl('/test')
                .withMethod('GET')
                .build();
            
            context.metadata.domainConfig = {
                token: 'test-token',
            };
            
            await TokenInjectorHandler(context);
            
            expect(context.request.headers['Authorization']).toBe('Bearer test-token');
        });
    });
    
    describe('basic auth', () => {
        it('should inject basic auth', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('api')
                .withUrl('/test')
                .withMethod('GET')
                .build();
            
            context.metadata.domainConfig = {
                token: 'test-token',
                authInjector: 'basic',
            };
            
            await TokenInjectorHandler(context);
            
            expect(context.request.headers['Authorization']).toBe('Basic test-token');
        });
    });
    
    describe('custom injector', () => {
        it('should call custom injector function', async () => {
            const customInjector = jest.fn();
            
            const context = RequestContextBuilder
                .create()
                .withDomain('api')
                .withUrl('/test')
                .withMethod('GET')
                .build();
            
            context.metadata.domainConfig = {
                token: 'test-token',
                authInjector: customInjector,
            };
            
            await TokenInjectorHandler(context);
            
            expect(customInjector).toHaveBeenCalledWith(context);
        });
        
        it('should support async custom injector', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('api')
                .withUrl('/test')
                .withMethod('GET')
                .build();
            
            context.metadata.domainConfig = {
                token: 'test-token',
                authInjector: async (ctx: any) => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    ctx.request.headers['X-Custom-Token'] = ctx.metadata.domainConfig.token;
                },
            };
            
            await TokenInjectorHandler(context);
            
            expect(context.request.headers['X-Custom-Token']).toBe('test-token');
        });
        
        it('should allow custom injector to modify queryParams', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('api')
                .withUrl('/test')
                .withMethod('GET')
                .build();
            
            context.metadata.domainConfig = {
                token: 'test-token',
                authInjector: (ctx: any) => {
                    ctx.request.queryParams = { access_token: ctx.metadata.domainConfig.token };
                },
            };
            
            await TokenInjectorHandler(context);
            
            expect(context.request.queryParams?.access_token).toBe('test-token');
        });
    });
    
    describe('no token', () => {
        it('should not inject if no token', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('api')
                .withUrl('/test')
                .withMethod('GET')
                .build();
            
            context.metadata.domainConfig = {};
            
            await TokenInjectorHandler(context);
            
            expect(context.request.headers['Authorization']).toBeUndefined();
        });
    });
});
