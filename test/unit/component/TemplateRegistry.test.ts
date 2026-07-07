/**
 * 单元测试：TemplateRegistry
 */

import { TemplateRegistry } from '@qimenjs/component';

describe('TemplateRegistry', () => {
    let registry: TemplateRegistry;

    beforeEach(() => {
        registry = TemplateRegistry.getInstance();
        // 清理所有已注册模板
        (registry as any).templates.clear();
    });

    describe('getInstance', () => {
        it('should return singleton', () => {
            expect(TemplateRegistry.getInstance()).toBe(registry);
        });
    });

    describe('registerHTML', () => {
        it('should register template from HTML string', () => {
            registry.registerHTML('button', '<button class="q-btn">Click</button>');
            expect(registry.has('button')).toBe(true);
        });

        it('should warn about potential XSS in script tags', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            registry.registerHTML('xss', '<script>alert("xss")</script>');
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it('should warn about javascript: protocol', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            registry.registerHTML('xss2', '<a href="javascript:alert(1)">link</a>');
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('register', () => {
        it('should register HTMLTemplateElement directly', () => {
            const template = document.createElement('template');
            template.innerHTML = '<span>hello</span>';
            registry.register('greeting', template);
            expect(registry.has('greeting')).toBe(true);
        });
    });

    describe('get', () => {
        it('should return cloned DocumentFragment', () => {
            registry.registerHTML('item', '<div>item</div>');
            const frag1 = registry.get('item');
            const frag2 = registry.get('item');
            expect(frag1).not.toBe(frag2); // 每次克隆
            expect(frag1).toBeInstanceOf(DocumentFragment);
        });

        it('should return undefined for unknown template', () => {
            expect(registry.get('unknown')).toBeUndefined();
        });
    });

    describe('replace', () => {
        it('should replace existing template', () => {
            registry.registerHTML('btn', '<button>Old</button>');
            registry.replace('btn', '<button>New</button>');
            const frag = registry.get('btn');
            expect(frag?.textContent).toContain('New');
        });
    });

    describe('extend', () => {
        it('should extend base template with prepend', () => {
            registry.registerHTML('base', '<div class="content">Base</div>');
            registry.extend('base', 'extended', [
                { action: 'prepend', html: '<span>Before</span>' },
            ]);
            const frag = registry.get('extended');
            expect(frag).toBeTruthy();
        });

        it('should extend base template with append', () => {
            registry.registerHTML('base2', '<div>Base</div>');
            registry.extend('base2', 'extended2', [
                { action: 'append', html: '<span>After</span>' },
            ]);
            expect(registry.has('extended2')).toBe(true);
        });

        it('should throw if base template not found', () => {
            expect(() => {
                registry.extend('nonexistent', 'derived', []);
            }).toThrow('not found');
        });
    });

    describe('has', () => {
        it('should return true for registered template', () => {
            registry.registerHTML('exists', '<div>exists</div>');
            expect(registry.has('exists')).toBe(true);
        });

        it('should return false for unregistered template', () => {
            expect(registry.has('nope')).toBe(false);
        });
    });

    describe('remove', () => {
        it('should remove registered template', () => {
            registry.registerHTML('temp', '<div>temp</div>');
            registry.remove('temp');
            expect(registry.has('temp')).toBe(false);
        });
    });
});
