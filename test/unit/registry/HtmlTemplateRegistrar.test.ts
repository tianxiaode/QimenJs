import { TemplateRegistrar } from '@qimenjs/template';

describe('TemplateRegistrar', () => {
    let templateRegistrar: TemplateRegistrar;

    beforeEach(() => {
        templateRegistrar = new TemplateRegistrar();
    });

    describe('register', () => {
        it('应该能够注册HTML模板', () => {
            templateRegistrar.register('header', '<header>Header Content</header>');

            const result = templateRegistrar.get('header');
            expect(result).toBe('<header>Header Content</header>');
        });

        it('在锁定状态下应该抛出错误', () => {
            templateRegistrar.lock();

            expect(() => {
                templateRegistrar.register('footer', '<footer>Footer Content</footer>');
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('unregister', () => {
        it('应该能够注销HTML模板', () => {
            templateRegistrar.register('sidebar', '<aside>Sidebar Content</aside>');
            expect(templateRegistrar.get('sidebar')).toBe('<aside>Sidebar Content</aside>');

            templateRegistrar.unregister('sidebar');
            expect(templateRegistrar.has('sidebar')).toBe(false);
        });

        it('在锁定状态下应该抛出错误', () => {
            templateRegistrar.lock();

            expect(() => {
                templateRegistrar.unregister('sidebar');
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('get', () => {
        it('应该能够获取已注册的HTML模板', () => {
            templateRegistrar.register('nav', '<nav>Navigation</nav>');

            const result = templateRegistrar.get('nav');
            expect(result).toBe('<nav>Navigation</nav>');
        });

        it('对于未注册的模板应该抛出NotFoundError', () => {
            expect(() => {
                templateRegistrar.get('nonexistent');
            }).toThrow('Not found');
        });

        it('对JSON类型应该抛出类型错误', () => {
            templateRegistrar.registerJson('json-tpl', { type: 'div' } as any);

            expect(() => {
                templateRegistrar.get('json-tpl');
            }).toThrow('is a JSON definition, not an HTML template');
        });
    });

    describe('getFragment', () => {
        it('应该返回DocumentFragment', () => {
            templateRegistrar.register('frag', '<div>Fragment</div>');

            const fragment = templateRegistrar.getFragment('frag');
            expect(fragment).toBeInstanceOf(DocumentFragment);
            expect(fragment.firstChild?.textContent).toBe('Fragment');
        });

        it('第二次调用应使用缓存', () => {
            templateRegistrar.register('cached', '<span>Cached</span>');

            const frag1 = templateRegistrar.getFragment('cached');
            const frag2 = templateRegistrar.getFragment('cached');

            expect(frag1).not.toBe(frag2);
            expect(frag1.firstChild?.textContent).toBe('Cached');
            expect(frag2.firstChild?.textContent).toBe('Cached');
        });

        it('对于未注册的模板应该抛出NotFoundError', () => {
            expect(() => {
                templateRegistrar.getFragment('nonexistent');
            }).toThrow('Not found');
        });

        it('对JSON类型应该抛出类型错误', () => {
            templateRegistrar.registerJson('json-frag', { type: 'div' } as any);

            expect(() => {
                templateRegistrar.getFragment('json-frag');
            }).toThrow('is a JSON definition, not an HTML template');
        });
    });

    describe('registerJson / getJson', () => {
        it('应该能够注册和获取JSON定义', () => {
            const layout = { type: 'div', id: 'test' } as any;
            templateRegistrar.registerJson('my-json', layout);

            const result = templateRegistrar.getJson('my-json');
            expect(result).toBe(layout);
        });

        it('对于未注册的定义应该抛出NotFoundError', () => {
            expect(() => {
                templateRegistrar.getJson('nonexistent');
            }).toThrow('Not found');
        });

        it('对HTML类型应该抛出类型错误', () => {
            templateRegistrar.register('html-tpl', '<div>HTML</div>');

            expect(() => {
                templateRegistrar.getJson('html-tpl');
            }).toThrow('is an HTML template, not a JSON definition');
        });

        it('在锁定状态下应该抛出错误', () => {
            templateRegistrar.lock();

            expect(() => {
                templateRegistrar.registerJson('locked-json', { type: 'div' } as any);
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('has / isHtml / isJson', () => {
        it('has应该正确判断模板是否存在', () => {
            expect(templateRegistrar.has('test')).toBe(false);
            templateRegistrar.register('test', '<div>Test</div>');
            expect(templateRegistrar.has('test')).toBe(true);
        });

        it('isHtml应该正确判断是否为HTML模板', () => {
            templateRegistrar.register('html', '<div>HTML</div>');
            templateRegistrar.registerJson('json', { type: 'div' } as any);

            expect(templateRegistrar.isHtml('html')).toBe(true);
            expect(templateRegistrar.isHtml('json')).toBe(false);
            expect(templateRegistrar.isHtml('nonexistent')).toBe(false);
        });

        it('isJson应该正确判断是否为JSON定义', () => {
            templateRegistrar.register('html', '<div>HTML</div>');
            templateRegistrar.registerJson('json', { type: 'div' } as any);

            expect(templateRegistrar.isJson('json')).toBe(true);
            expect(templateRegistrar.isJson('html')).toBe(false);
            expect(templateRegistrar.isJson('nonexistent')).toBe(false);
        });
    });

    describe('clear', () => {
        it('应该清空所有注册的模板', () => {
            templateRegistrar.register('header', '<header>Header</header>');
            templateRegistrar.register('footer', '<footer>Footer</footer>');

            expect(templateRegistrar.has('header')).toBe(true);
            expect(templateRegistrar.has('footer')).toBe(true);

            templateRegistrar.clear();

            expect(templateRegistrar.has('header')).toBe(false);
            expect(templateRegistrar.has('footer')).toBe(false);
        });

        it('在锁定状态下应该抛出错误', () => {
            templateRegistrar.lock();

            expect(() => {
                templateRegistrar.clear();
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('lock', () => {
        it('应该锁定注册器', () => {
            templateRegistrar.lock();
            expect((templateRegistrar as any).isLocked).toBe(true);
        });
    });

    describe('inspect', () => {
        it('应该输出注册器状态', () => {
            templateRegistrar.register('template', '<div>Test Template</div>');

            const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            templateRegistrar.inspect();

            expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: template [🔓]');
            expect(consoleTableSpy).toHaveBeenCalled();
            expect(consoleGroupEndSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
            consoleTableSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });
    });
});
