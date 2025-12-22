// global.test.ts
import { globalConfig, GlobalConfig } from '@orbitjs/utils';

describe('globalConfig', () => {
    const originalConfig = globalConfig.get();

    afterEach(() => {
        // 重置配置到原始状态
        globalConfig.init({});
    });

    describe('init', () => {
        it('should initialize with default config', () => {
            const config = globalConfig.get();

            expect(config.errorHandling).toBeDefined();
            expect(config.http).toBeDefined();
            expect(config.validation).toBeDefined();

            // 验证默认值
            expect(config.http?.timeout).toBe(30000);
            expect(config.http?.headers?.['Content-Type']).toBe('application/json');
        });

        it('should merge user config with default config', () => {
            const customConfig: Partial<GlobalConfig> = {
                http: {
                    baseURL: 'https://api.example.com',
                    timeout: 10000,
                },
            };

            globalConfig.init(customConfig);
            const config = globalConfig.get();

            expect(config.http?.baseURL).toBe('https://api.example.com');
            expect(config.http?.timeout).toBe(10000);
            // 确保未被覆盖的默认值仍然存在
            expect(config.http?.headers?.['Content-Type']).toBe('application/json');
        });
    });

    describe('getters', () => {
        // ... 其他代码保持不变

        it('should return correct http config', () => {
            const http = globalConfig.getHttp();

            expect(http.timeout).toBe(30000);
            expect(http.headers?.['Content-Type']).toBe('application/json');
        });
    });

    //还没定义对象深度复制功能，暂时不测试这个方法
    // describe('update', () => {
    //     it('should update config dynamically', () => {
    //         globalConfig.update({
    //             http: {
    //                 timeout: 5000,
    //             },
    //         });
            
    //         const config = globalConfig.get();
    //         console.log(config)
    //         expect(config.http?.timeout).toBe(5000);
    //         // 确保其他配置没有被影响
    //         expect(config.http?.headers?.['Content-Type']).toBe('application/json');
    //     });
    // });
});
