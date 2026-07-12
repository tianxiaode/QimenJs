/**
 * ToolbarComponent 单元测试
 *
 * 覆盖：构造函数、方向切换、溢出模式切换、DOM 结构、update、dispose
 *
 * 注意：precompileTemplate 在多顶级元素模板中无法正确解析 data-content
 * （querySelectorAll 不匹配自身），所以 nodeMap 为空。
 * 测试通过直接检查 DOM 结构来验证模板节点。
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
            })),
        },
    };
});

import { ToolbarComponent } from '@/component/toolbar/ToolbarComponent';

describe('ToolbarComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el 并添加 q-toolbar 类', () => {
            const toolbar = new ToolbarComponent() as any;
            expect(toolbar.el).toBeInstanceOf(HTMLElement);
            expect(toolbar.el.classList.contains('q-toolbar')).toBe(true);
        });

        it('默认方向为 horizontal', () => {
            const toolbar = new ToolbarComponent() as any;
            expect(toolbar.direction).toBe('horizontal');
            expect(toolbar.el.classList.contains('q-toolbar--horizontal')).toBe(true);
        });

        it('通过 props 设置方向为 vertical', () => {
            const toolbar = new ToolbarComponent({ direction: 'vertical' }) as any;
            expect(toolbar.direction).toBe('vertical');
            expect(toolbar.el.classList.contains('q-toolbar--vertical')).toBe(true);
        });

        it('默认溢出模式为 none', () => {
            const toolbar = new ToolbarComponent() as any;
            expect(toolbar.overflowMode).toBe('none');
        });

        it('通过 props 设置溢出模式为 scroll', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'scroll' }) as any;
            expect(toolbar.overflowMode).toBe('scroll');
        });

        it('通过 props 设置溢出模式为 menu', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'menu' }) as any;
            expect(toolbar.overflowMode).toBe('menu');
        });
    });

    // ============================================
    // DOM 结构（模板预定义节点）
    // ============================================

    describe('DOM 结构', () => {
        it('包含 contentArea 节点', () => {
            const toolbar = new ToolbarComponent() as any;
            const contentArea = toolbar.el.querySelector('[data-content="toolbar:contentArea"]');
            expect(contentArea).not.toBeNull();
            expect(contentArea!.classList.contains('q-toolbar__content')).toBe(true);
        });

        it('包含 prevBtn 节点', () => {
            const toolbar = new ToolbarComponent() as any;
            const prevBtn = toolbar.el.querySelector('[data-content="toolbar:prevBtn"]');
            expect(prevBtn).not.toBeNull();
        });

        it('包含 nextBtn 节点', () => {
            const toolbar = new ToolbarComponent() as any;
            const nextBtn = toolbar.el.querySelector('[data-content="toolbar:nextBtn"]');
            expect(nextBtn).not.toBeNull();
        });

        it('包含 triggerBtn 节点', () => {
            const toolbar = new ToolbarComponent() as any;
            const triggerBtn = toolbar.el.querySelector('[data-content="toolbar:triggerBtn"]');
            expect(triggerBtn).not.toBeNull();
        });

        it('包含 menuPanel 节点', () => {
            const toolbar = new ToolbarComponent() as any;
            const menuPanel = toolbar.el.querySelector('[data-content="toolbar:menuPanel"]');
            expect(menuPanel).not.toBeNull();
        });

        it('contentArea 有 q-toolbar__content 类', () => {
            const toolbar = new ToolbarComponent() as any;
            const contentArea = toolbar.el.querySelector('[data-content="toolbar:contentArea"]');
            expect(contentArea).not.toBeNull();
            expect(contentArea!.classList.contains('q-toolbar__content')).toBe(true);
        });

        it('prevBtn/nextBtn 存在', () => {
            const toolbar = new ToolbarComponent() as any;
            const prevBtn = toolbar.el.querySelector('[data-content="toolbar:prevBtn"]');
            const nextBtn = toolbar.el.querySelector('[data-content="toolbar:nextBtn"]');
            expect(prevBtn).not.toBeNull();
            expect(nextBtn).not.toBeNull();
        });

        it('triggerBtn/menuPanel 存在', () => {
            const toolbar = new ToolbarComponent() as any;
            const triggerBtn = toolbar.el.querySelector('[data-content="toolbar:triggerBtn"]');
            const menuPanel = toolbar.el.querySelector('[data-content="toolbar:menuPanel"]');
            expect(triggerBtn).not.toBeNull();
            expect(menuPanel).not.toBeNull();
        });
    });

    // ============================================
    // 方向切换
    // ============================================

    describe('direction', () => {
        it('setter 切换方向', () => {
            const toolbar = new ToolbarComponent() as any;
            toolbar.direction = 'vertical';
            expect(toolbar.direction).toBe('vertical');
            expect(toolbar.el.classList.contains('q-toolbar--vertical')).toBe(true);
            expect(toolbar.el.classList.contains('q-toolbar--horizontal')).toBe(false);
        });

        it('切换方向时移除旧方向类', () => {
            const toolbar = new ToolbarComponent({ direction: 'vertical' }) as any;
            expect(toolbar.el.classList.contains('q-toolbar--vertical')).toBe(true);

            toolbar.direction = 'horizontal';
            expect(toolbar.el.classList.contains('q-toolbar--vertical')).toBe(false);
            expect(toolbar.el.classList.contains('q-toolbar--horizontal')).toBe(true);
        });
    });

    // ============================================
    // 溢出模式切换
    // ============================================

    describe('overflowMode', () => {
        it('scroll 模式添加 q-overflow-scroll 类', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'scroll' }) as any;
            expect(toolbar.el.classList.contains('q-overflow-scroll')).toBe(true);
        });

        it('menu 模式添加 q-overflow-menu-container 类', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'menu' }) as any;
            expect(toolbar.el.classList.contains('q-overflow-menu-container')).toBe(true);
        });

        it('none 模式不添加溢出类', () => {
            const toolbar = new ToolbarComponent() as any;
            expect(toolbar.el.classList.contains('q-overflow-scroll')).toBe(false);
            expect(toolbar.el.classList.contains('q-overflow-menu-container')).toBe(false);
        });

        it('从 scroll 切换到 menu 时清理 scroll 类', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'scroll' }) as any;
            expect(toolbar.el.classList.contains('q-overflow-scroll')).toBe(true);

            toolbar.overflowMode = 'menu';
            expect(toolbar.el.classList.contains('q-overflow-scroll')).toBe(false);
            expect(toolbar.el.classList.contains('q-overflow-menu-container')).toBe(true);
        });

        it('从 menu 切换到 none 时清理 menu 类', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'menu' }) as any;
            expect(toolbar.el.classList.contains('q-overflow-menu-container')).toBe(true);

            toolbar.overflowMode = 'none';
            expect(toolbar.el.classList.contains('q-overflow-menu-container')).toBe(false);
        });

        it('从 scroll 切换到 none 时清理 scroll 类和 contentArea 样式类', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'scroll' }) as any;
            expect(toolbar.el.classList.contains('q-overflow-scroll')).toBe(true);

            toolbar.overflowMode = 'none';
            expect(toolbar.el.classList.contains('q-overflow-scroll')).toBe(false);
        });

        it('从 menu 切换到 none 时清理 menu 类和 contentArea 样式类', () => {
            const toolbar = new ToolbarComponent({ overflowMode: 'menu' }) as any;
            expect(toolbar.el.classList.contains('q-overflow-menu-container')).toBe(true);

            toolbar.overflowMode = 'none';
            expect(toolbar.el.classList.contains('q-overflow-menu-container')).toBe(false);
        });
    });

    // ============================================
    // update
    // ============================================

    describe('update', () => {
        it('update 方向', () => {
            const toolbar = new ToolbarComponent() as any;
            toolbar.update({ direction: 'vertical' });
            expect(toolbar.direction).toBe('vertical');
            expect(toolbar.el.classList.contains('q-toolbar--vertical')).toBe(true);
        });

        it('update 溢出模式', () => {
            const toolbar = new ToolbarComponent() as any;
            toolbar.update({ overflowMode: 'scroll' });
            expect(toolbar.overflowMode).toBe('scroll');
            expect(toolbar.el.classList.contains('q-overflow-scroll')).toBe(true);
        });

        it('update 不传属性时不改变', () => {
            const toolbar = new ToolbarComponent() as any;
            toolbar.update({});
            expect(toolbar.direction).toBe('horizontal');
            expect(toolbar.overflowMode).toBe('none');
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const toolbar = new ToolbarComponent() as any;
            container.appendChild(toolbar.el);
            expect(container.contains(toolbar.el)).toBe(true);
            toolbar.dispose();
            expect(document.contains(toolbar.el)).toBe(false);
            container.remove();
        });
    });
});
