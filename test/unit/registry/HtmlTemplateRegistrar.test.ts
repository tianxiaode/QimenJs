import { HtmlTemplateRegistrar } from '@/registry/registrars';

/**
 * HTML模板注册器单元测试
 * 验证HtmlTemplateRegistrar类的各项功能是否正常工作
 */
describe('HtmlTemplateRegistrar', () => {
    let htmlTemplateRegistrar: HtmlTemplateRegistrar;

    /**
     * 在每个测试用例执行前初始化HtmlTemplateRegistrar实例
     */
    beforeEach(() => {
        htmlTemplateRegistrar = new HtmlTemplateRegistrar();
    });

    describe('register', () => {
        /**
         * 测试注册HTML模板功能
         */
        it('应该能够注册HTML模板', () => {
            htmlTemplateRegistrar.register('header', '<header>Header Content</header>');

            const result = htmlTemplateRegistrar.get('header');
            expect(result).toBe('<header>Header Content</header>');
        });

        /**
         * 测试在锁定状态下是否正确抛出错误
         */
        it('在锁定状态下应该抛出错误', () => {
            htmlTemplateRegistrar.lock();

            expect(() => {
                htmlTemplateRegistrar.register('footer', '<footer>Footer Content</footer>');
            }).toThrow('[Registrar: html] modification denied: Locked.');
        });
    });

    describe('unregister', () => {
        /**
         * 测试注销HTML模板功能
         */
        it('应该能够注销HTML模板', () => {
            htmlTemplateRegistrar.register('sidebar', '<aside>Sidebar Content</aside>');
            expect(htmlTemplateRegistrar.get('sidebar')).toBe('<aside>Sidebar Content</aside>');

            htmlTemplateRegistrar.unregister('sidebar');
            expect(htmlTemplateRegistrar.get('sidebar')).toBeUndefined();
        });

        /**
         * 测试在锁定状态下是否正确抛出错误
         */
        it('在锁定状态下应该抛出错误', () => {
            htmlTemplateRegistrar.lock();

            expect(() => {
                htmlTemplateRegistrar.unregister('sidebar');
            }).toThrow('[Registrar: html] modification denied: Locked.');
        });
    });

    describe('get', () => {
        /**
         * 测试获取已注册的HTML模板
         */
        it('应该能够获取已注册的HTML模板', () => {
            htmlTemplateRegistrar.register('nav', '<nav>Navigation</nav>');

            const result = htmlTemplateRegistrar.get('nav');
            expect(result).toBe('<nav>Navigation</nav>');
        });

        /**
         * 测试获取不存在的模板时返回undefined
         */
        it('对于未注册的模板应该返回undefined', () => {
            const result = htmlTemplateRegistrar.get('nonexistent');
            expect(result).toBeUndefined();
        });
    });

    describe('clear', () => {
        /**
         * 测试清空所有注册的模板
         */
        it('应该清空所有注册的模板', () => {
            htmlTemplateRegistrar.register('header', '<header>Header</header>');
            htmlTemplateRegistrar.register('footer', '<footer>Footer</footer>');

            expect(htmlTemplateRegistrar.get('header')).toBe('<header>Header</header>');
            expect(htmlTemplateRegistrar.get('footer')).toBe('<footer>Footer</footer>');

            htmlTemplateRegistrar.clear();

            expect(htmlTemplateRegistrar.get('header')).toBeUndefined();
            expect(htmlTemplateRegistrar.get('footer')).toBeUndefined();
        });

        /**
         * 测试在锁定状态下是否正确抛出错误
         */
        it('在锁定状态下应该抛出错误', () => {
            htmlTemplateRegistrar.lock();

            expect(() => {
                htmlTemplateRegistrar.clear();
            }).toThrow('[Registrar: html] modification denied: Locked.');
        });
    });

    describe('lock', () => {
        /**
         * 测试锁定注册器功能
         */
        it('应该锁定注册器', () => {
            htmlTemplateRegistrar.lock();
            expect((htmlTemplateRegistrar as any).isLocked).toBe(true);
        });
    });

    describe('inspect', () => {
        /**
         * 测试输出注册器状态功能
         */
        it('应该输出注册器状态', () => {
            htmlTemplateRegistrar.register('template', '<div>Test Template</div>');

            const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            htmlTemplateRegistrar.inspect();

            expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: html [🔓]');
            expect(consoleTableSpy).toHaveBeenCalled();
            expect(consoleGroupEndSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
            consoleTableSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });
    });
});
