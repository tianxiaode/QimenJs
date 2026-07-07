/**
 * DialogComponent 弹窗组件
 *
 * abilities: [TextAbility, OpenableAbility, OverlayAbility, AnimationAbility]
 * TextAbility 管理标题文本，支持 setText() 动态更新
 */

import { ComponentBase } from '../ComponentBase';
import { TextAbility } from '../abilities/TextAbility';
import { OpenableAbility } from '../abilities/OpenableAbility';
import { OverlayAbility } from '../abilities/OverlayAbility';
import { AnimationAbility } from '../abilities/AnimationAbility';
import { ZIndexLevel, nextZIndex, releaseZIndex } from '../z-index';

export class DialogComponent extends ComponentBase {
    static override readonly abilities = [TextAbility, OpenableAbility, OverlayAbility, AnimationAbility];

    private _zIndex: number = 0;
    private headerEl: HTMLElement | null = null;
    private bodyEl: HTMLElement | null = null;
    private footerEl: HTMLElement | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-dialog';
        this.el.style.display = 'none';

        this.el.innerHTML = `
            <div class="q-dialog__header" data-ref="header">
                <span class="q-dialog__title" data-ref="text"></span>
                <button class="q-dialog__close" data-ref="closeBtn">&times;</button>
            </div>
            <div class="q-dialog__body" data-ref="body"></div>
            <div class="q-dialog__footer" data-ref="footer"></div>
        `;

        this.headerEl = this.el.querySelector('[data-ref="header"]') as HTMLElement;
        this.bodyEl = this.el.querySelector('[data-ref="body"]') as HTMLElement;
        this.footerEl = this.el.querySelector('[data-ref="footer"]') as HTMLElement;

        // 关闭按钮
        const closeBtn = this.el.querySelector('[data-ref="closeBtn"]') as HTMLElement;
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }

    /**
     * 打开弹窗
     */
    open(): void {
        this.setAbilityState('OpenableAbility:isOpen', true);

        // 获取 z-index
        this._zIndex = nextZIndex(ZIndexLevel.modal);
        this.el.style.zIndex = String(this._zIndex);
        this.el.style.display = '';

        // 挂载到 OverlayRoot
        this.openOverlay();

        // 播放打开动画
        if (typeof this.play === 'function') {
            this.play('q-zoom-in', { duration: 200 });
        }
    }

    /**
     * 关闭弹窗
     */
    close(): void {
        // 播放关闭动画
        if (typeof this.play === 'function') {
            this.play('q-fade-out', { duration: 150 }).then(() => {
                this.doClose();
            });
        } else {
            this.doClose();
        }
    }

    private doClose(): void {
        this.setAbilityState('OpenableAbility:isOpen', false);
        this.el.style.display = 'none';

        // 从 OverlayRoot 移除
        this.closeOverlay();

        // 释放 z-index
        releaseZIndex(ZIndexLevel.modal);
    }
}
