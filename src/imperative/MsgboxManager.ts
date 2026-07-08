/**
 * MsgboxManager — msgbox 实例管理器
 *
 * 单例模式，管理 msgbox DOM 创建、遮罩、按钮事件、动画、Promise resolve、销毁。
 */

import { HtmlTemplateRegistrar } from '@qimenjs/registry';
import { resolveI18nValue } from '@qimenjs/i18n';
import { OverlayRoot } from '@qimenjs/component';
import { ZIndexLevel, nextZIndex, releaseZIndex } from '@qimenjs/component';
import type { MsgboxOptions, MsgboxResult, MsgboxType } from './types';

/** 进入动画时长 ms */
const ENTER_DURATION = 200;

/** 退出动画时长 ms */
const EXIT_DURATION = 150;

// ─── MsgboxInstance ─────────────────────────────────────────

interface MsgboxInstance {
    id: number;
    overlayEl: HTMLElement;
    maskEl: HTMLElement;
    zIndex: number;
    resolve: (result: MsgboxResult) => void;
    type: MsgboxType;
    /** 事件清理回调 */
    cleanup: () => void;
}

// ─── MsgboxManager ──────────────────────────────────────────

export class MsgboxManager {
    private static instance: MsgboxManager;

    private instances = new Set<MsgboxInstance>();
    private nextId = 0;

    private constructor() {}

    static getInstance(): MsgboxManager {
        if (!MsgboxManager.instance) {
            MsgboxManager.instance = new MsgboxManager();
        }
        return MsgboxManager.instance;
    }

    /**
     * 创建 msgbox 实例
     */
    create(options: MsgboxOptions & { type: MsgboxType }): Promise<MsgboxResult> {
        const type: MsgboxType = options.type;
        const confirmButtonText = options.confirmButtonText ?? '确定';
        const cancelButtonText = options.cancelButtonText ?? '取消';
        const inputPlaceholder = options.inputPlaceholder ?? '';

        // 1. 获取模板
        const template = HtmlTemplateRegistrar.getInstance().get('Msgbox');

        // 2. 创建遮罩 DOM
        const maskEl = document.createElement('div');
        maskEl.classList.add('q-msgbox-mask');
        maskEl.style.position = 'fixed';
        maskEl.style.inset = '0';
        maskEl.style.background = 'rgba(0,0,0,0.5)';

        // 3. 创建 msgbox DOM 容器
        const overlayEl = document.createElement('div');
        overlayEl.innerHTML = template;
        overlayEl.classList.add('q-msgbox');
        overlayEl.style.position = 'fixed';
        overlayEl.style.top = '50%';
        overlayEl.style.left = '50%';
        overlayEl.style.transform = 'translate(-50%, -50%)';
        overlayEl.style.pointerEvents = 'auto';

        // 4. 设置内容（支持 i18n: 前缀）
        const titleEl = overlayEl.querySelector('[data-ref="title"]') as HTMLElement | null;
        if (titleEl) {
            titleEl.textContent = resolveI18nValue(options.title);
        }

        const contentEl = overlayEl.querySelector('[data-ref="content"]') as HTMLElement | null;
        if (contentEl) {
            contentEl.textContent = resolveI18nValue(options.content ?? '');
        }

        // 5. 根据类型配置按钮区域
        const cancelBtn = overlayEl.querySelector('[data-ref="cancelBtn"]') as HTMLElement | null;
        const confirmBtn = overlayEl.querySelector('[data-ref="confirmBtn"]') as HTMLElement | null;
        const inputEl = overlayEl.querySelector('[data-ref="input"]') as HTMLInputElement | null;

        if (type === 'alert') {
            // alert: 仅显示确认按钮
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        if (type === 'prompt') {
            // prompt: 显示输入框
            if (inputEl) {
                inputEl.style.display = '';
                inputEl.placeholder = inputPlaceholder;
            }
        }

        // 设置按钮文本（支持 i18n: 前缀）
        if (confirmBtn) confirmBtn.textContent = resolveI18nValue(confirmButtonText);
        if (cancelBtn) cancelBtn.textContent = resolveI18nValue(cancelButtonText);

        // 6. z-index
        const zIndex = nextZIndex(ZIndexLevel.modal);
        overlayEl.style.zIndex = String(zIndex);
        maskEl.style.zIndex = String(zIndex);

        // 7. 挂载到 OverlayRoot
        const root = OverlayRoot.getInstance().getRoot();
        root.appendChild(maskEl);
        root.appendChild(overlayEl);

        // 8. 播放进入动画
        overlayEl.animate(
            [
                { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            ],
            { duration: ENTER_DURATION, easing: 'ease-out' },
        );

        // 9. 创建 Promise
        let resolveFn!: (result: MsgboxResult) => void;
        const promise = new Promise<MsgboxResult>((resolve) => {
            resolveFn = resolve;
        });

        // 10. 创建实例
        const id = this.nextId++;
        const instance: MsgboxInstance = {
            id,
            overlayEl,
            maskEl,
            zIndex,
            resolve: resolveFn,
            type,
            cleanup: () => {},
        };

        // 11. 绑定按钮事件
        const cleanupFns: Array<() => void> = [];

        if (confirmBtn) {
            const handler = () => {
                const value = type === 'prompt' && inputEl ? inputEl.value : '';
                this.close(instance, 'confirm', value);
            };
            confirmBtn.addEventListener('click', handler);
            cleanupFns.push(() => confirmBtn.removeEventListener('click', handler));
        }

        if (cancelBtn) {
            const handler = () => {
                this.close(instance, 'cancel', '');
            };
            cancelBtn.addEventListener('click', handler);
            cleanupFns.push(() => cancelBtn.removeEventListener('click', handler));
        }

        instance.cleanup = () => {
            for (const fn of cleanupFns) fn();
            cleanupFns.length = 0;
        };

        this.instances.add(instance);

        return promise;
    }

    /**
     * 关闭 msgbox 实例
     */
    private close(instance: MsgboxInstance, action: 'confirm' | 'cancel', value: string): void {
        const { overlayEl, maskEl, resolve, cleanup } = instance;

        // 播放退出动画
        const animation = overlayEl.animate(
            [
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            ],
            { duration: EXIT_DURATION, easing: 'ease-in' },
        );

        // 遮罩淡出
        maskEl.animate(
            [
                { opacity: 1 },
                { opacity: 0 },
            ],
            { duration: EXIT_DURATION, easing: 'ease-in' },
        );

        animation.onfinish = () => {
            // 从 OverlayRoot 移除
            if (overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
            if (maskEl.parentNode) maskEl.parentNode.removeChild(maskEl);

            // 释放 z-index
            releaseZIndex(ZIndexLevel.modal);

            // 移除事件监听
            cleanup();

            // 从集合中移除
            this.instances.delete(instance);

            // 释放 DOM 引用
            overlayEl.innerHTML = '';

            // resolve Promise
            resolve({ action, value });
        };
    }
}
