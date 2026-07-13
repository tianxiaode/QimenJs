/**
 * LoadingAbility 单元测试
 *
 * 覆盖：initLoading、showLoading、hideLoading、setLoadingVisible、setLoadingText、能力状态管理
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
import { OverlayMaskAbility } from '@/component-abilities/render/OverlayMaskAbility';
import { LoadingAbility } from '@/component-abilities/render/LoadingAbility';

const TPL = '<div class="host"></div>';

describe('LoadingAbility', () => {
    const HostClass = TemplateComponent.withTemplate(TPL).with(OverlayMaskAbility).with(LoadingAbility);

    // ============================================
    // initLoading
    // ============================================

    describe('initLoading', () => {
        it('创建加载容器并挂载到遮罩内', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            const loading = instance._loadingEl;
            expect(loading).toBeInstanceOf(HTMLElement);
            expect(loading.className).toBe('q-loading');
            expect(instance._maskEl.contains(loading)).toBe(true);
        });

        it('默认包含 spinner SVG', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            const spinner = instance._loadingEl.querySelector('.q-loading-spinner');
            expect(spinner).not.toBeNull();
            const svg = instance._loadingEl.querySelector('.q-loading-svg');
            expect(svg).not.toBeNull();
        });

        it('自定义 spinnerHtml', () => {
            const instance = new HostClass() as any;
            instance.initLoading({ spinnerHtml: '<div class="custom-spinner">X</div>' });
            const custom = instance._loadingEl.querySelector('.custom-spinner');
            expect(custom).not.toBeNull();
            expect(custom.textContent).toBe('X');
        });

        it('loadingText 创建文字元素', () => {
            const instance = new HostClass() as any;
            instance.initLoading({ loadingText: '加载中...' });
            const textEl = instance._loadingEl.querySelector('.q-loading-text');
            expect(textEl).not.toBeNull();
            expect(textEl.textContent).toBe('加载中...');
        });

        it('无 loadingText 时不创建文字元素', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            const textEl = instance._loadingEl.querySelector('.q-loading-text');
            expect(textEl).toBeNull();
        });

        it('默认遮罩背景色为白色半透明', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            expect(instance._maskEl.style.backgroundColor).toBe('rgba(255, 255, 255, 0.7)');
        });

        it('自定义遮罩背景色', () => {
            const instance = new HostClass() as any;
            instance.initLoading({ maskColor: 'rgba(0,0,0,0.3)' });
            expect(instance._maskEl.style.backgroundColor).toBe('rgba(0, 0, 0, 0.3)');
        });

        it('fullscreen 传递给遮罩', () => {
            const instance = new HostClass() as any;
            instance.initLoading({ fullscreen: true });
            expect(instance._maskEl.style.position).toBe('fixed');
        });

        it('默认隐藏加载状态', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            expect(instance._loadingVisible).toBe(false);
            expect(instance._maskEl.style.display).toBe('none');
        });
    });

    // ============================================
    // showLoading / hideLoading
    // ============================================

    describe('showLoading / hideLoading', () => {
        it('showLoading 显示遮罩和加载状态', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            instance.showLoading();
            expect(instance._loadingVisible).toBe(true);
            expect(instance._maskVisible).toBe(true);
            expect(instance._maskEl.style.display).toBe('');
        });

        it('hideLoading 隐藏遮罩和加载状态', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            instance.showLoading();
            instance.hideLoading();
            expect(instance._loadingVisible).toBe(false);
            expect(instance._maskVisible).toBe(false);
            expect(instance._maskEl.style.display).toBe('none');
        });
    });

    // ============================================
    // setLoadingVisible
    // ============================================

    describe('setLoadingVisible', () => {
        it('true 时显示加载', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            instance.setLoadingVisible(true);
            expect(instance._loadingVisible).toBe(true);
        });

        it('false 时隐藏加载', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            instance.showLoading();
            instance.setLoadingVisible(false);
            expect(instance._loadingVisible).toBe(false);
        });
    });

    // ============================================
    // setLoadingText
    // ============================================

    describe('setLoadingText', () => {
        it('更新已有文字', () => {
            const instance = new HostClass() as any;
            instance.initLoading({ loadingText: '加载中' });
            instance.setLoadingText('提交中');
            const textEl = instance._loadingEl.querySelector('.q-loading-text');
            expect(textEl.textContent).toBe('提交中');
        });

        it('无文字元素时自动创建', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            expect(instance._loadingEl.querySelector('.q-loading-text')).toBeNull();
            instance.setLoadingText('处理中');
            const textEl = instance._loadingEl.querySelector('.q-loading-text');
            expect(textEl).not.toBeNull();
            expect(textEl.textContent).toBe('处理中');
        });

        it('未初始化时不报错', () => {
            const instance = new HostClass() as any;
            expect(() => instance.setLoadingText('test')).not.toThrow();
        });
    });

    // ============================================
    // 能力状态管理
    // ============================================

    describe('能力状态', () => {
        it('_loadingEl 初始为 null', () => {
            const instance = new HostClass() as any;
            expect(instance._loadingEl).toBeFalsy();
        });

        it('_loadingVisible 初始为 falsy', () => {
            const instance = new HostClass() as any;
            expect(instance._loadingVisible).toBeFalsy();
        });

        it('initLoading 后 _loadingEl 有值', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            expect(instance._loadingEl).not.toBeNull();
        });
    });

    // ============================================
    // 清理
    // ============================================

    describe('清理', () => {
        it('dispose 后加载 DOM 被移除', () => {
            const instance = new HostClass() as any;
            instance.initLoading();
            const loading = instance._loadingEl;
            instance.dispose();
            expect(loading.parentNode).toBeNull();
        });
    });
});
