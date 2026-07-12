/**
 * LayoutAbility 单元测试
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

import { TemplateComponent } from '@/component-core';
import { LayoutAbility, LAYOUT_FIT, LAYOUT_HBOX, LAYOUT_VBOX, LAYOUT_GRID, LAYOUT_CENTER } from '@/component-core/abilities/LayoutAbility';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';

describe('LayoutAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(LayoutAbility);

    it('layout getter 默认 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.layout).toBeUndefined();
    });

    it('flushLayout — 设置 vbox → 添加 layout-vbox 类', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_VBOX;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-vbox')).toBe(true);
    });

    it('flushLayout — 设置 hbox → 添加 layout-hbox 类', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_HBOX;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-hbox')).toBe(true);
    });

    it('flushLayout — 设置 fit → 添加 layout-fit 类', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_FIT;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-fit')).toBe(true);
    });

    it('flushLayout — 设置 grid → 添加 layout-grid 类', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_GRID;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-grid')).toBe(true);
    });

    it('flushLayout — 设置 center → 添加 layout-center 类', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_CENTER;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-center')).toBe(true);
    });

    it('flushLayout — 切换布局时移除旧类', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_VBOX;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-vbox')).toBe(true);

        instance.layout = LAYOUT_HBOX;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-vbox')).toBe(false);
        expect(instance.el.classList.contains('layout-hbox')).toBe(true);
    });

    it('flushLayout — layout 为 undefined 时移除所有布局类', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_VBOX;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-vbox')).toBe(true);

        instance.layout = undefined;
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-vbox')).toBe(false);
    });

    it('flushLayout — layout 未脏时不处理', () => {
        const instance = new BoxClass() as any;
        instance.layout = LAYOUT_VBOX;
        instance.flushLayout();
        instance.dirtySet.clear();

        // 再次 flush，dirtySet 为空，不应改变
        instance.flushLayout();
        expect(instance.el.classList.contains('layout-vbox')).toBe(true);
    });
});
