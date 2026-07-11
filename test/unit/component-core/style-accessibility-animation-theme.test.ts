/**
 * StyleAbility / AccessibilityAbility / AnimationAbility / ThemeAbility 单元测试
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
import { StyleAbility } from '@/component-core/abilities/StyleAbility';
import { AccessibilityAbility } from '@/component-core/abilities/AccessibilityAbility';
import { AnimationAbility } from '@/component-core/abilities/AnimationAbility';
import { ThemeAbility } from '@/component-core/abilities/ThemeAbility';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';

// ============================================
// StyleAbility
// ============================================

describe('StyleAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(StyleAbility);

    it('className getter 默认空字符串', () => {
        const instance = new BoxClass() as any;
        expect(instance.className).toBe('');
    });

    it('style getter 默认 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.style).toBeUndefined();
    });

    it('flushStyle — className 写入 el.className', () => {
        const instance = new BoxClass() as any;
        instance.className = 'my-class active';
        instance.flushStyle();
        expect(instance.el.className).toBe('my-class active');
    });

    it('flushStyle — style 为字符串 → cssText', () => {
        const instance = new BoxClass() as any;
        instance.style = 'color: red; font-size: 14px';
        instance.flushStyle();
        expect(instance.el.style.cssText).toContain('color: red');
        expect(instance.el.style.cssText).toContain('font-size: 14px');
    });

    it('flushStyle — style 为对象 → Object.assign', () => {
        const instance = new BoxClass() as any;
        instance.style = { color: 'blue', fontSize: '16px' };
        instance.flushStyle();
        expect(instance.el.style.color).toBe('blue');
        expect(instance.el.style.fontSize).toBe('16px');
    });
});

// ============================================
// AccessibilityAbility
// ============================================

describe('AccessibilityAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(AccessibilityAbility);

    it('getAria / setAria 读写', () => {
        const instance = new BoxClass() as any;
        instance.setAria('role', 'button');
        expect(instance.getAria('role')).toBe('button');
    });

    it('setAriaBatch 批量设置', () => {
        const instance = new BoxClass() as any;
        instance.setAriaBatch({ role: 'dialog', ariaLabel: 'My Dialog', ariaHidden: 'true' });
        expect(instance.getAria('role')).toBe('dialog');
        expect(instance.getAria('ariaLabel')).toBe('My Dialog');
        expect(instance.getAria('ariaHidden')).toBe('true');
    });

    it('flushAccessibility — 有值 → setAttribute', () => {
        const instance = new BoxClass() as any;
        instance.setAria('role', 'button');
        instance.setAria('ariaLabel', 'Submit');
        instance.flushAccessibility();

        expect(instance.el.getAttribute('role')).toBe('button');
        expect(instance.el.getAttribute('aria-label')).toBe('Submit');
    });

    it('flushAccessibility — null/undefined → removeAttribute', () => {
        const instance = new BoxClass() as any;
        instance.setAria('role', 'button');
        instance.flushAccessibility();
        expect(instance.el.getAttribute('role')).toBe('button');

        instance.setAria('role', null);
        instance.flushAccessibility();
        expect(instance.el.getAttribute('role')).toBeNull();
    });

    it('camelCase → kebab-case 映射', () => {
        const instance = new BoxClass() as any;
        instance.setAria('ariaDescribedBy', 'desc1');
        instance.flushAccessibility();
        expect(instance.el.getAttribute('aria-describedby')).toBe('desc1');
    });
});

// ============================================
// AnimationAbility
// ============================================

describe('AnimationAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(AnimationAbility);

    // jsdom 没有 el.animate，需要手动 mock
    function mockAnimate(el: HTMLElement) {
        (el as any).animate = jest.fn().mockReturnValue({
            finished: Promise.resolve(),
        });
    }

    it('getAnimation animationEnabled 默认 true', () => {
        const instance = new BoxClass() as any;
        expect(instance.getAnimation('animationEnabled')).toBe(true);
    });

    it('getAnimation 其他 key 默认 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.getAnimation('enterAnimation')).toBeUndefined();
    });

    it('setAnimation 设置值', () => {
        const instance = new BoxClass() as any;
        instance.setAnimation('enterAnimation', 'fadeIn');
        expect(instance.getAnimation('enterAnimation')).toBe('fadeIn');
    });

    it('playEnter — 无动画名 → 不调用 animate', () => {
        const instance = new BoxClass() as any;
        mockAnimate(instance.el);
        instance.playEnter();
        expect(instance.el.animate).not.toHaveBeenCalled();
    });

    it('playEnter — animationEnabled=false → 不调用 animate', () => {
        const instance = new BoxClass() as any;
        mockAnimate(instance.el);
        instance.setAnimation('enterAnimation', 'fadeIn');
        instance.setAnimation('animationEnabled', false);
        instance.playEnter();
        expect(instance.el.animate).not.toHaveBeenCalled();
    });

    it('playEnter — 有效动画名 → 调用 el.animate', () => {
        const instance = new BoxClass() as any;
        mockAnimate(instance.el);
        instance.setAnimation('enterAnimation', 'fadeIn');
        instance.playEnter();
        expect(instance.el.animate).toHaveBeenCalledWith(
            [{ opacity: 0 }, { opacity: 1 }],
            expect.objectContaining({ duration: 300, easing: 'ease', fill: 'forwards' }),
        );
    });

    it('playEnter — 自定义 options', () => {
        const instance = new BoxClass() as any;
        mockAnimate(instance.el);
        instance.setAnimation('enterAnimation', 'slideInUp');
        instance.setAnimation('enterAnimationOptions', { duration: 500, easing: 'ease-in' });
        instance.playEnter();
        expect(instance.el.animate).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({ duration: 500, easing: 'ease-in' }),
        );
    });

    it('playEnter — 未知动画名 → 不调用 animate', () => {
        const instance = new BoxClass() as any;
        mockAnimate(instance.el);
        instance.setAnimation('enterAnimation', 'unknownAnim');
        instance.playEnter();
        expect(instance.el.animate).not.toHaveBeenCalled();
    });

    it('playLeave — 返回 Promise', async () => {
        const instance = new BoxClass() as any;
        mockAnimate(instance.el);
        instance.setAnimation('leaveAnimation', 'fadeOut');

        const result = instance.playLeave();
        expect(result).toBeInstanceOf(Promise);
        await result;
        expect(instance.el.animate).toHaveBeenCalled();
    });

    it('playLeave — 无动画名 → 返回 resolved Promise', async () => {
        const instance = new BoxClass() as any;
        mockAnimate(instance.el);
        await instance.playLeave();
        expect(instance.el.animate).not.toHaveBeenCalled();
    });
});

// ============================================
// ThemeAbility
// ============================================

describe('ThemeAbility', () => {
    it('_initTheme — themeAware 为 false → 不注册监听', () => {
        const BoxClass = TemplateComponent.withTemplate(TPL).with(ThemeAbility) as any;
        BoxClass.themeAware = false;

        const instance = new BoxClass() as any;
        // 不应抛异常
        expect(instance).toBeDefined();
    });

    it('_initTheme — themeAware 为 true → 注册监听', () => {
        const { globalEventBus } = require('@qimenjs/events');
        const onSpy = jest.spyOn(globalEventBus, 'on').mockReturnValue(jest.fn());

        const BoxClass = TemplateComponent.withTemplate(TPL).with(ThemeAbility) as any;
        BoxClass.themeAware = true;

        const instance = new BoxClass() as any;
        expect(onSpy).toHaveBeenCalled();
        onSpy.mockRestore();
    });
});
