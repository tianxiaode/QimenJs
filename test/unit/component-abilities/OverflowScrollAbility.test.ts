/**
 * OverflowScrollAbility 单元测试
 *
 * 覆盖：initOverflowScroll、scrollOverflowByStep、updateOverflowState、
 *       scrollOverflowTo、scrollOverflowToChild、getOverflowState、cleanup
 *
 * 由于 precompileTemplate 在多顶级元素模板中无法正确解析 data-content，
 * 测试通过手动创建 DOM 结构 + 直接调用能力方法来验证逻辑。
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

import { TemplateComponent, TOOLBAR_TEMPLATE } from '@/component-core';
import { OverflowScrollAbility } from '@/component-abilities/render/OverflowScrollAbility';
import type { OverflowState } from '@/component-abilities/render/OverflowScrollAbility';

/**
 * 创建测试用宿主类
 */
const TestHost = TemplateComponent
    .withTemplate(TOOLBAR_TEMPLATE)
    .with([OverflowScrollAbility]);

/**
 * 手动构建 nodeMap（因为 precompileTemplate 无法解析多顶级元素模板）
 */
function buildManualNodeMap(host: any): void {
    const el = host.el;
    host.nodeMap = host.nodeMap || {};
    host.nodeMap['toolbar'] = {};

    const contentArea = el.querySelector('[data-content="toolbar:contentArea"]');
    const prevBtn = el.querySelector('[data-content="toolbar:prevBtn"]');
    const nextBtn = el.querySelector('[data-content="toolbar:nextBtn"]');
    const triggerBtn = el.querySelector('[data-content="toolbar:triggerBtn"]');
    const menuPanel = el.querySelector('[data-content="toolbar:menuPanel"]');

    if (contentArea) host.nodeMap['toolbar']['contentArea'] = { el: contentArea };
    if (prevBtn) host.nodeMap['toolbar']['prevBtn'] = { el: prevBtn };
    if (nextBtn) host.nodeMap['toolbar']['nextBtn'] = { el: nextBtn };
    if (triggerBtn) host.nodeMap['toolbar']['triggerBtn'] = { el: triggerBtn };
    if (menuPanel) host.nodeMap['toolbar']['menuPanel'] = { el: menuPanel };
}

describe('OverflowScrollAbility', () => {

    // ============================================
    // initOverflowScroll
    // ============================================

    describe('initOverflowScroll', () => {
        it('添加 q-overflow-scroll 容器类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            expect(host.el.classList.contains('q-overflow-scroll')).toBe(true);
            expect(host.el.classList.contains('q-overflow-scroll--horizontal')).toBe(true);
        });

        it('vertical 方向添加 q-overflow-scroll--vertical 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'vertical' });
            expect(host.el.classList.contains('q-overflow-scroll--vertical')).toBe(true);
        });

        it('contentArea 添加 q-overflow-scroll__area 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            expect(contentArea.classList.contains('q-overflow-scroll__area')).toBe(true);
        });

        it('prevBtn 添加方向类和 aria-label', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            const prevBtn = host.nodeMap['toolbar']['prevBtn'].el;
            expect(prevBtn.classList.contains('q-overflow-arrow--horizontal')).toBe(true);
            expect(prevBtn.getAttribute('aria-label')).toBe('向左滚动');
        });

        it('nextBtn 添加方向类和 aria-label', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            const nextBtn = host.nodeMap['toolbar']['nextBtn'].el;
            expect(nextBtn.classList.contains('q-overflow-arrow--horizontal')).toBe(true);
            expect(nextBtn.getAttribute('aria-label')).toBe('向右滚动');
        });

        it('vertical 方向 prevBtn aria-label 为向上滚动', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'vertical' });
            const prevBtn = host.nodeMap['toolbar']['prevBtn'].el;
            expect(prevBtn.getAttribute('aria-label')).toBe('向上滚动');
        });

        it('存储 direction 和 scrollStep 到 abilityState', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'vertical', scrollStep: 100 });
            expect(host.getOverflowScroll('direction')).toBe('vertical');
            expect(host.getOverflowScroll('scrollStep')).toBe(100);
        });

        it('默认 scrollStep 为 200', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({});
            expect(host.getOverflowScroll('scrollStep')).toBe(200);
        });

        it('无 contentArea 时不报错', () => {
            const host = new (TestHost as any)();
            host.nodeMap = {};
            expect(() => host.initOverflowScroll({ direction: 'horizontal' })).not.toThrow();
        });
    });

    // ============================================
    // updateOverflowState
    // ============================================

    describe('updateOverflowState', () => {
        it('无溢出时箭头隐藏', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            const prevBtn = host.nodeMap['toolbar']['prevBtn'].el;
            const nextBtn = host.nodeMap['toolbar']['nextBtn'].el;

            host.updateOverflowState(contentArea, 'horizontal', prevBtn, nextBtn);
            expect(prevBtn.hidden).toBe(true);
            expect(nextBtn.hidden).toBe(true);
        });

        it('无溢出时不添加 can-prev/can-next 类', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            const prevBtn = host.nodeMap['toolbar']['prevBtn'].el;
            const nextBtn = host.nodeMap['toolbar']['nextBtn'].el;

            host.updateOverflowState(contentArea, 'horizontal', prevBtn, nextBtn);
            expect(host.el.classList.contains('q-overflow-scroll--can-prev')).toBe(false);
            expect(host.el.classList.contains('q-overflow-scroll--can-next')).toBe(false);
        });
    });

    // ============================================
    // getOverflowState
    // ============================================

    describe('getOverflowState', () => {
        it('未初始化时返回默认状态', () => {
            const host = new (TestHost as any)();
            const state = host.getOverflowState() as OverflowState;
            expect(state).toEqual({ canScrollPrev: false, canScrollNext: false });
        });

        it('初始化后无溢出时返回 false/false', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            const state = host.getOverflowState() as OverflowState;
            expect(state.canScrollPrev).toBe(false);
            expect(state.canScrollNext).toBe(false);
        });
    });

    // ============================================
    // scrollOverflowByStep
    // ============================================

    describe('scrollOverflowByStep', () => {
        it('未初始化时不报错', () => {
            const host = new (TestHost as any)();
            expect(() => host.scrollOverflowByStep('prev')).not.toThrow();
        });
    });

    // ============================================
    // scrollOverflowTo
    // ============================================

    describe('scrollOverflowTo', () => {
        it('未初始化时不报错', () => {
            const host = new (TestHost as any)();
            expect(() => host.scrollOverflowTo(100)).not.toThrow();
        });
    });

    // ============================================
    // scrollOverflowToChild
    // ============================================

    describe('scrollOverflowToChild', () => {
        it('未初始化时不报错', () => {
            const host = new (TestHost as any)();
            expect(() => host.scrollOverflowToChild(document.createElement('div'))).not.toThrow();
        });

        it('child 为 null 时不报错', () => {
            const host = new (TestHost as any)();
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            expect(() => host.scrollOverflowToChild(null)).not.toThrow();
        });
    });

    // ============================================
    // cleanup (onCleanup)
    // ============================================

    describe('cleanup', () => {
        it('dispose 后 contentArea 移除 q-overflow-scroll__area 类', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const host = new (TestHost as any)();
            container.appendChild(host.el);
            buildManualNodeMap(host);
            host.initOverflowScroll({ direction: 'horizontal' });
            const contentArea = host.nodeMap['toolbar']['contentArea'].el;
            expect(contentArea.classList.contains('q-overflow-scroll__area')).toBe(true);

            host.dispose();
            expect(contentArea.classList.contains('q-overflow-scroll__area')).toBe(false);
            container.remove();
        });
    });
});
