/**
 * Position 相关能力 单元测试
 *
 * 覆盖：PositionPxAbility、PositionRawAbility、PositionBoolAbility、PositionDirectAbility
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
import { PositionPxAbility } from '@/component-core/abilities/PositionPxAbility';
import { PositionRawAbility } from '@/component-core/abilities/PositionRawAbility';
import { PositionBoolAbility } from '@/component-core/abilities/PositionBoolAbility';
import { PositionDirectAbility } from '@/component-core/abilities/PositionDirectAbility';

// ============================================
// PositionPxAbility
// ============================================

describe('PositionPxAbility', () => {
    const TPL = '<div class="box"><span data-content="box:label"></span></div>';
    const BoxClass = TemplateComponent.withTemplate(TPL).with(PositionPxAbility);

    it('x/y getter 默认值为 0', () => {
        const instance = new BoxClass() as any;
        expect(instance.x).toBe(0);
        expect(instance.y).toBe(0);
    });

    it('x/y setter 调用 setProp', () => {
        const instance = new BoxClass() as any;
        instance.x = 100;
        instance.y = 200;
        expect(instance.x).toBe(100);
        expect(instance.y).toBe(200);
    });

    it('其他属性 getter 默认值为 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.top).toBeUndefined();
        expect(instance.width).toBeUndefined();
    });

    it('flushPositionPx 将脏属性写入 el.style', () => {
        const instance = new BoxClass() as any;
        instance.x = 50;
        instance.y = 100;
        instance.width = 200;
        instance.flushPositionPx();

        expect(instance.el.style.left).toBe('50px');
        expect(instance.el.style.top).toBe('100px');
        expect(instance.el.style.width).toBe('200px');
    });

    it('flushPositionPx 跳过 undefined 的属性', () => {
        const instance = new BoxClass() as any;
        instance.x = 10;
        // top 未设置
        instance.flushPositionPx();

        expect(instance.el.style.left).toBe('10px');
        expect(instance.el.style.top).toBe('');
    });

    it('flushPositionPx 跳过非脏属性', () => {
        const instance = new BoxClass() as any;
        instance.x = 10;
        instance.flushPositionPx();
        expect(instance.el.style.left).toBe('10px');

        // 清空脏集后，再 flush 不应改变
        instance.dirtySet.clear();
        instance.flushPositionPx();
        // style 保持不变
        expect(instance.el.style.left).toBe('10px');
    });

    it('top/left/bottom/right setter + flush', () => {
        const instance = new BoxClass() as any;
        instance.top = 10;
        instance.left = 20;
        instance.bottom = 30;
        instance.right = 40;
        instance.flushPositionPx();

        expect(instance.el.style.top).toBe('10px');
        expect(instance.el.style.left).toBe('20px');
        expect(instance.el.style.bottom).toBe('30px');
        expect(instance.el.style.right).toBe('40px');
    });

    it('height setter + flush', () => {
        const instance = new BoxClass() as any;
        instance.height = 300;
        instance.flushPositionPx();
        expect(instance.el.style.height).toBe('300px');
    });

    it('minWidth/maxWidth/minHeight/maxHeight setter + flush', () => {
        const instance = new BoxClass() as any;
        instance.minWidth = 50;
        instance.maxWidth = 500;
        instance.minHeight = 30;
        instance.maxHeight = 400;
        instance.flushPositionPx();

        expect(instance.el.style.minWidth).toBe('50px');
        expect(instance.el.style.maxWidth).toBe('500px');
        expect(instance.el.style.minHeight).toBe('30px');
        expect(instance.el.style.maxHeight).toBe('400px');
    });

    it('top/left/bottom/right getter 返回 props 值', () => {
        const instance = new BoxClass() as any;
        instance.top = 10;
        instance.left = 20;
        instance.bottom = 30;
        instance.right = 40;
        expect(instance.top).toBe(10);
        expect(instance.left).toBe(20);
        expect(instance.bottom).toBe(30);
        expect(instance.right).toBe(40);
    });

    it('width/height getter 返回 props 值', () => {
        const instance = new BoxClass() as any;
        instance.width = 200;
        instance.height = 300;
        expect(instance.width).toBe(200);
        expect(instance.height).toBe(300);
    });

    it('minWidth/maxWidth/minHeight/maxHeight getter 返回 props 值', () => {
        const instance = new BoxClass() as any;
        instance.minWidth = 50;
        instance.maxWidth = 500;
        instance.minHeight = 30;
        instance.maxHeight = 400;
        expect(instance.minWidth).toBe(50);
        expect(instance.maxWidth).toBe(500);
        expect(instance.minHeight).toBe(30);
        expect(instance.maxHeight).toBe(400);
    });
});

// ============================================
// PositionRawAbility
// ============================================

describe('PositionRawAbility', () => {
    const TPL = '<div class="box"><span data-content="box:label"></span></div>';
    const BoxClass = TemplateComponent.withTemplate(TPL).with(PositionRawAbility);

    it('margin/padding/shadow getter 默认 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.margin).toBeUndefined();
        expect(instance.padding).toBeUndefined();
        expect(instance.shadow).toBeUndefined();
    });

    it('zIndex getter 默认 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.zIndex).toBeUndefined();
    });

    it('flushPositionRaw 写入 margin/padding', () => {
        const instance = new BoxClass() as any;
        instance.margin = '10px';
        instance.padding = '5px 10px';
        instance.flushPositionRaw();

        expect(instance.el.style.margin).toBe('10px');
        expect(instance.el.style.padding).toBe('5px 10px');
    });

    it('flushPositionRaw shadow 映射到 boxShadow', () => {
        const instance = new BoxClass() as any;
        instance.shadow = '0 2px 4px rgba(0,0,0,0.1)';
        instance.flushPositionRaw();

        expect(instance.el.style.boxShadow).toBe('0 2px 4px rgba(0,0,0,0.1)');
    });

    it('flushPositionRaw zIndex 转为字符串', () => {
        const instance = new BoxClass() as any;
        instance.zIndex = 100;
        instance.flushPositionRaw();

        expect(instance.el.style.zIndex).toBe('100');
    });
});

// ============================================
// PositionBoolAbility
// ============================================

describe('PositionBoolAbility', () => {
    const TPL = '<div class="box"><span data-content="box:label"></span></div>';
    const BoxClass = TemplateComponent.withTemplate(TPL).with(PositionBoolAbility);

    it('scrollable/center/alwaysOnTop/fullscreen getter 默认 false', () => {
        const instance = new BoxClass() as any;
        expect(instance.scrollable).toBe(false);
        expect(instance.center).toBe(false);
        expect(instance.alwaysOnTop).toBe(false);
        expect(instance.fullscreen).toBe(false);
    });

    it('scrollable=true → overflow=auto', () => {
        const instance = new BoxClass() as any;
        instance.scrollable = true;
        instance.flushPositionBool();
        expect(instance.el.style.overflow).toBe('auto');
    });

    it('scrollable=false → overflow=hidden', () => {
        const instance = new BoxClass() as any;
        instance.scrollable = false;
        instance.flushPositionBool();
        expect(instance.el.style.overflow).toBe('hidden');
    });

    it('center=true → flex 居中', () => {
        const instance = new BoxClass() as any;
        instance.center = true;
        instance.flushPositionBool();
        expect(instance.el.style.display).toBe('flex');
        expect(instance.el.style.alignItems).toBe('center');
        expect(instance.el.style.justifyContent).toBe('center');
    });

    it('alwaysOnTop=true → zIndex=9999', () => {
        const instance = new BoxClass() as any;
        instance.alwaysOnTop = true;
        instance.flushPositionBool();
        expect(instance.el.style.zIndex).toBe('9999');
    });

    it('fullscreen=true → fixed 全屏', () => {
        const instance = new BoxClass() as any;
        instance.fullscreen = true;
        instance.flushPositionBool();
        expect(instance.el.style.position).toBe('fixed');
        expect(instance.el.style.inset).toBe('0');
        expect(instance.el.style.width).toBe('100%');
        expect(instance.el.style.height).toBe('100%');
    });
});

// ============================================
// PositionDirectAbility
// ============================================

describe('PositionDirectAbility', () => {
    const TPL = '<div class="box"><span data-content="box:label"></span></div>';
    const BoxClass = TemplateComponent.withTemplate(TPL).with(PositionDirectAbility);

    it('hideMode 默认 display', () => {
        const instance = new BoxClass() as any;
        expect(instance.hideMode).toBe('display');
    });

    it('visible 默认 true', () => {
        const instance = new BoxClass() as any;
        expect(instance.visible).toBe(true);
    });

    it('visible=false + hideMode=display → display=none', () => {
        const instance = new BoxClass() as any;
        instance.visible = false;
        expect(instance.el.style.display).toBe('none');
    });

    it('visible=true + hideMode=display → display=""', () => {
        const instance = new BoxClass() as any;
        instance.visible = false;
        instance.visible = true;
        expect(instance.el.style.display).toBe('');
    });

    it('visible=false + hideMode=visibility → visibility=hidden', () => {
        const instance = new BoxClass() as any;
        instance.hideMode = 'visibility';
        instance.visible = false;
        expect(instance.el.style.visibility).toBe('hidden');
    });

    it('visible=true + hideMode=visibility → visibility=visible', () => {
        const instance = new BoxClass() as any;
        instance.hideMode = 'visibility';
        instance.visible = false;
        instance.visible = true;
        expect(instance.el.style.visibility).toBe('visible');
    });

    it('visible=false + hideMode=opacity → opacity=0', () => {
        const instance = new BoxClass() as any;
        instance.hideMode = 'opacity';
        instance.visible = false;
        expect(instance.el.style.opacity).toBe('0');
    });

    it('visible=true + hideMode=opacity → opacity=1', () => {
        const instance = new BoxClass() as any;
        instance.hideMode = 'opacity';
        instance.visible = false;
        instance.visible = true;
        expect(instance.el.style.opacity).toBe('1');
    });

    it('visible 传入 string 时只存 props 不操作 DOM', () => {
        const instance = new BoxClass() as any;
        instance.visible = '{{someExpr}}';
        expect(instance.props.visible).toBe('{{someExpr}}');
        // 不应改变 display
        expect(instance.el.style.display).toBe('');
    });

    it('focused=true → el.focus()', () => {
        const instance = new BoxClass() as any;
        const focusSpy = jest.spyOn(instance.el, 'focus');
        instance.focused = true;
        expect(focusSpy).toHaveBeenCalled();
        focusSpy.mockRestore();
    });

    it('focused=false → 不调用 el.focus()', () => {
        const instance = new BoxClass() as any;
        const focusSpy = jest.spyOn(instance.el, 'focus');
        instance.focused = false;
        expect(focusSpy).not.toHaveBeenCalled();
        focusSpy.mockRestore();
    });

    it('tabIndex 设置值 → el.tabIndex', () => {
        const instance = new BoxClass() as any;
        instance.tabIndex = 3;
        expect(instance.el.tabIndex).toBe(3);
    });

    it('tabIndex=undefined → 不设 DOM', () => {
        const instance = new BoxClass() as any;
        instance.tabIndex = 3;
        instance.tabIndex = undefined;
        // tabIndex 仍为 3（DOM 不回退）
        expect(instance.el.tabIndex).toBe(3);
    });
});
