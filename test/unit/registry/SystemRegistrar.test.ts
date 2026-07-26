import { SystemRegistrar } from '@/registry/registrars';
import { SystemConfig } from '@/registry/types';

/**
 * 系统配置注册器单元测试
 * 验证SystemRegistrar类的各项功能是否正常工作
 */
describe('SystemRegistrar', () => {
    let systemRegistrar: SystemRegistrar;

    /**
     * 在每个测试用例执行前初始化SystemRegistrar实例
     */
    beforeEach(() => {
        systemRegistrar = new SystemRegistrar();
        systemRegistrar.register({
            locale: 'zh-CN',
            dateFormat: 'YYYY-MM-DD',
            timezone: 'UTC+8',
            password: {
                minLength: 8,
                maxLength: 16,
                upperCase: true,
                lowerCase: true,
                digit: true,
                specialChar: true,
            },
        });
    });

    describe('initial state', () => {
        /**
         * 测试默认系统配置是否正确初始化
         */
        it('应该有默认的系统配置', () => {
            expect(systemRegistrar.get('locale')).toBe('zh-CN');
            expect(systemRegistrar.get('dateFormat')).toBe('YYYY-MM-DD');
            expect(systemRegistrar.get('timezone')).toBe('UTC+8');
            expect(systemRegistrar.get('password')).toEqual({
                minLength: 8,
                maxLength: 16,
                upperCase: true,
                lowerCase: true,
                digit: true,
                specialChar: true,
            });
        });
    });

    describe('register', () => {
        /**
         * 测试注册单个配置项功能
         */
        it('应该能够注册单个配置项', () => {
            systemRegistrar.register('locale', 'en-US');

            expect(systemRegistrar.get('locale')).toBe('en-US');
        });

        /**
         * 测试批量注册配置对象功能
         */
        it('应该能够批量注册配置对象', () => {
            const newConfig = {
                locale: 'ja-JP',
                timezone: 'UTC+9',
            };

            systemRegistrar.register(newConfig);

            expect(systemRegistrar.get('locale')).toBe('ja-JP');
            expect(systemRegistrar.get('timezone')).toBe('UTC+9');
        });

        /**
         * 测试在锁定状态下是否正确抛出错误
         */
        it('在锁定状态下应该抛出错误', () => {
            systemRegistrar.lock();

            expect(() => {
                systemRegistrar.register('locale', 'fr-FR');
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('registerAll', () => {
        /**
         * 测试批量合并配置功能
         */
        it('应该能够批量合并配置', () => {
            const newConfig: Partial<SystemConfig> = {
                locale: 'de-DE',
                timezone: 'UTC+1',
            };

            systemRegistrar.registerAll(newConfig);

            expect(systemRegistrar.get('locale')).toBe('de-DE');
            expect(systemRegistrar.get('timezone')).toBe('UTC+1');
        });

        /**
         * 测试在锁定状态下是否正确抛出错误
         */
        it('在锁定状态下应该抛出错误', () => {
            systemRegistrar.lock();

            expect(() => {
                systemRegistrar.registerAll({ locale: 'ko-KR' });
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('unregister', () => {
        /**
         * 测试注销配置项功能
         */
        it('应该能够注销配置项', () => {
            systemRegistrar.register('customKey', 'customValue');
            expect(systemRegistrar.get('customKey')).toBe('customValue');

            systemRegistrar.unregister('customKey');
            expect(systemRegistrar.get('customKey')).toBeUndefined();
        });

        /**
         * 测试在锁定状态下是否正确抛出错误
         */
        it('在锁定状态下应该抛出错误', () => {
            systemRegistrar.lock();

            expect(() => {
                systemRegistrar.unregister('locale');
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('get', () => {
        /**
         * 测试获取配置项功能
         */
        it('应该能够获取配置项', () => {
            const locale = systemRegistrar.get('locale');
            expect(locale).toBe('zh-CN');
        });

        /**
         * 测试获取不存在的配置项时返回undefined
         */
        it('对于不存在的配置项应该返回undefined', () => {
            const result = systemRegistrar.get('nonexistent' as any);
            expect(result).toBeUndefined();
        });
    });

    describe('getAll', () => {
        /**
         * 测试获取全部配置功能
         */
        it('应该能够获取全部配置', () => {
            const allConfig = systemRegistrar.getAll();
            expect(allConfig.locale).toBe('zh-CN');
            expect(allConfig.timezone).toBe('UTC+8');
            expect(allConfig.password).toEqual({
                minLength: 8,
                maxLength: 16,
                upperCase: true,
                lowerCase: true,
                digit: true,
                specialChar: true,
            });
        });
    });

    describe('clear', () => {
        /**
         * 测试清空所有配置项功能
         */
        it('应该清空所有配置项', () => {
            const initialConfig = systemRegistrar.getAll();
            expect(initialConfig.locale).toBe('zh-CN');

            systemRegistrar.clear();

            // 检查是否清空了配置（注意：由于是对象类型，clear会删除所有键）
            const clearedConfig = systemRegistrar.getAll();
            expect(clearedConfig.locale).toBeUndefined();
            expect(clearedConfig.timezone).toBeUndefined();
        });

        /**
         * 测试在锁定状态下是否正确抛出错误
         */
        it('在锁定状态下应该抛出错误', () => {
            systemRegistrar.lock();

            expect(() => {
                systemRegistrar.clear();
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('lock', () => {
        /**
         * 测试锁定注册器功能
         */
        it('应该锁定注册器', () => {
            systemRegistrar.lock();
            expect((systemRegistrar as any).isLocked).toBe(true);
        });
    });

    describe('inspect', () => {
        /**
         * 测试输出注册器状态功能
         */
        it('应该输出注册器状态', () => {
            const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            systemRegistrar.inspect();

            expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: system [🔓]');
            expect(consoleTableSpy).toHaveBeenCalled();
            expect(consoleGroupEndSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
            consoleTableSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });
    });
});
