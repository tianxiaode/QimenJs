/**
 * DialogComponent 弹窗组件
 *
 * abilities: [ContentAbility, OpenableAbility, OverlayAbility, AnimationAbility]
 * ContentAbility 管理标题文本
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix } from '@qimenjs/component-abilities';
import { OpenableAbility } from '@qimenjs/component-abilities';
import { OverlayAbility } from '@qimenjs/component-abilities';
import { AnimationAbility } from '@qimenjs/component-abilities';
import { ZIndexLevel, nextZIndex, releaseZIndex } from '../z-index';

export class DialogComponent extends ComponentBase {
    static readonly abilities = [ContentAbility, OpenableAbility, OverlayAbility, AnimationAbility];

    static readonly contentSlots = {
        [ContentPrefix.TEXT]: ['title'],
    };

    private _zIndex: number = 0;
    private headerEl: HTMLElement | null = null;
    private bodyEl: HTMLElement | null = null;
    private footerEl: HTMLElement | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-dialog');
        this.el.style.display = 'none';

        this.headerEl = this.el.querySelector('[data-content="dialog:header"]') as HTMLElement;
        this.bodyEl = this.el.querySelector('[data-content="dialog:body"]') as HTMLElement;
        this.footerEl = this.el.querySelector('[data-content="dialog:footer"]') as HTMLElement;

        // 关闭按钮
        const closeBtn = this.el.querySelector('[data-content="dialog:close"]') as HTMLElement;
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
