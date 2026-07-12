/**
 * DialogComponent 弹窗组件
 *
 * abilities: [ElementEventAbility, ContentAbility, OpenableAbility, OverlayHostAbility, AnimationAbility]
 * ContentAbility 管理标题文本
 * ElementEventAbility 自动绑定模板中 data-event 声明的事件
 *
 * 事件处理（由 ElementEventAbility 自动绑定）：
 * - onClose — dialog:close 的 click 事件（方法名从 data-content 推导）
 */

import { ComponentBase, OverlayHostAbility } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix, ElementEventAbility } from '@qimenjs/component-abilities';
import { OpenableAbility } from '@qimenjs/component-abilities';
import { AnimationAbility } from '@qimenjs/component-abilities';
import { ZIndexLevel } from '../z-index';
import { DIALOG_TEMPLATE } from '@qimenjs/component-core';

const DialogBase = ComponentBase.withTemplate(DIALOG_TEMPLATE);

export class DialogComponent extends DialogBase {
    static readonly abilities = [ElementEventAbility, ContentAbility, OpenableAbility, OverlayHostAbility, AnimationAbility];

    static readonly contentSlots = {
        [ContentPrefix.TEXT]: ['title'],
    };

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-dialog');
        this.el.style.display = 'none';
    }

    /**
     * dialog:close 的 click 事件处理
     * 由 ElementEventAbility 自动绑定（模板中 data-event="click"）
     * 方法名从 data-content="dialog:close" 推导：单 group → onClose
     */
    onClose(): void {
        this.close();
    }

    /**
     * 打开弹窗
     */
    open(): void {
        this.setAbilityState('OpenableAbility:isOpen', true);

        // z-index
        this.acquireZIndex(ZIndexLevel.modal);
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
        this.releaseZIndex();
    }
}
