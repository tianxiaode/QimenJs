/**
 * Msgbox — msgbox 实例
 *
 * 独立的能力实例（ComposableBase 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.use() 组合能力：
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 * - SystemEventBusAbility：系统事件收发（仅在 eventKey 存在时发送）
 *
 * 模板通过 TemplateManager 编译，节点通过手动映射管理。
 *
 * 事件通过 SystemEventBus 发送，编码：{eventKey}:{action}
 * 仅当 MsgboxOptions.eventKey 已定义时才发送，否则跳过。
 */

import { AbilityDefinition, ComposableBase, InferAbilities } from '@/composable';
import { FloatingLayerAbility } from '@/component-core/overlay';
import { EventContextBuilder } from '@/context';
import { TemplateManager } from '@/component-core/engine/TemplateManager';
import { MSGBOX_ACTIONS, MSGBOX_FEEDBACK_EVENTS } from './imperative-events';
import { MSGBOX_TEMPLATE } from './msgbox-tpl';
import { resolveI18nValue, t } from '@qimenjs/i18n';
import { ZIndexLevel } from '../z-index';
import type { MsgboxOptions, MsgboxResult, MsgboxType } from './types';
import { SystemEventBusAbility } from '@/system-abilities';
import './msgbox.css';

const MSGBOX_ABILITIES = [
    FloatingLayerAbility,
    SystemEventBusAbility,
] as const satisfies readonly AbilityDefinition[];

export interface IMsgbox extends InferAbilities<typeof MSGBOX_ABILITIES> {
    el: HTMLElement;
    maskEl: HTMLElement;
    _nodeEls: Record<string, HTMLElement>;
    zIndex: number;
    type: MsgboxType;
    eventKey?: string;
    inputEl: HTMLInputElement | null;
    callback: (result: MsgboxResult) => void;
    onClose: () => void;
    close(): void;
}

export class Msgbox extends ComposableBase {
    static type = 'Msgbox';

    el!: HTMLElement;
    maskEl!: HTMLElement;
    _nodeEls!: Record<string, HTMLElement>;
    zIndex!: number;
    type!: MsgboxType;
    eventKey?: string;
    inputEl!: HTMLInputElement | null;
    callback!: (result: MsgboxResult) => void;
    onClose!: () => void;
    private _resolved = false;

    constructor(
        options: MsgboxOptions & { type: MsgboxType },
        callback: (result: MsgboxResult) => void
    ) {
        super();

        const type: MsgboxType = options.type;
        const confirmButtonText = options.confirmButtonText ?? t('msgbox.confirm');
        const cancelButtonText = options.cancelButtonText ?? t('msgbox.cancel');
        const inputPlaceholder = options.inputPlaceholder ?? '';

        this.type = type;
        this.eventKey = options.eventKey;
        this.callback = callback;

        // 1. 初始化能力
        this._zIndexLevel = ZIndexLevel.modal;

        // 2. 通过 TemplateManager 编译模板 + 构建 DOM
        const tplCache = TemplateManager.get(MSGBOX_TEMPLATE);
        const fragment = tplCache.templateCache!.content.cloneNode(true) as DocumentFragment;
        this.el = (fragment.firstElementChild as HTMLElement) ?? document.createElement('div');
        this._nodeEls = { root: this.el };
        for (const name of tplCache.names) {
            if (name === 'root') continue;
            const path = tplCache.indexs[name];
            if (!path) continue;
            let current: Element = this.el;
            for (const idx of path) {
                if (!current.children[idx]) break;
                current = current.children[idx];
            }
            this._nodeEls[name] = current as HTMLElement;
        }

        // 3. 创建遮罩
        this.maskEl = document.createElement('div');
        this.maskEl.classList.add('q-msgbox-mask');
        this.maskEl.style.position = 'fixed';
        this.maskEl.style.inset = '0';
        this.maskEl.style.background = 'rgba(0,0,0,0.5)';

        // 4. 设置样式
        this.el.classList.add('q-msgbox');
        this.el.style.pointerEvents = 'auto';

        // 5. 设置内容
        this._setText('msgbox:text', resolveI18nValue(options.title));
        this._setText('msgbox:content', resolveI18nValue(options.content ?? ''));

        // 6. 根据类型配置按钮区域
        const cancelBtn = this._nodeEls['msgbox:cancel'];
        const confirmBtn = this._nodeEls['msgbox:confirm'];
        const inputEl = this._nodeEls['msgbox:field'] as HTMLInputElement | undefined;
        this.inputEl = inputEl ?? null;

        if (type === 'alert') {
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        if (type === 'prompt') {
            if (inputEl) {
                inputEl.style.display = '';
                inputEl.placeholder = inputPlaceholder;
            }
        }

        if (confirmBtn) confirmBtn.textContent = resolveI18nValue(confirmButtonText);
        if (cancelBtn) cancelBtn.textContent = resolveI18nValue(cancelButtonText);

        // 7. z-index
        this.zIndex = this.acquireZIndex();
        this.el.style.zIndex = String(this.zIndex);
        this.maskEl.style.zIndex = String(this.zIndex);

        // 8. 居中定位
        this.setViewportPosition(this.el, 'center');

        // 9. 挂载到 OverlayRoot
        this.mountToOverlay(this.maskEl);
        this.mountToOverlay(this.el);

        // 10. 播放进入动画
        this.playEnterAnimation(this.el, [
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ]);

        // 11. 绑定按钮事件
        if (confirmBtn) {
            this.bindDomEvent(confirmBtn, 'tap', () => {
                this._doResolve({
                    action: 'confirm',
                    value: type === 'prompt' && this.inputEl ? this.inputEl.value : '',
                });
            });
        }

        if (cancelBtn) {
            this.bindDomEvent(cancelBtn, 'tap', () => {
                this._doResolve({ action: 'cancel', value: '' });
            });
        }

        // 12. 遮罩点击关闭（alert 类型）
        if (type === 'alert') {
            this.bindDomEvent(this.maskEl, 'tap', () => {
                this._doResolve({ action: 'cancel', value: '' });
            });
        }
    }

    _setText(key: string, text: string): void {
        const el = this._nodeEls[key];
        if (el) el.textContent = text;
    }

    _emitEvent(action: string, data: Record<string, any>): void {
        if (!this.eventKey) return;
        const event = `${this.eventKey}:${action}`;
        this.systemEmit(
            event,
            EventContextBuilder.create()
                .withEvent(event)
                .withType(action)
                .withSource(this.eventKey)
                .withData(data)
                .build()
        );
    }

    _doResolve(result: MsgboxResult): void {
        if (this._resolved) return;
        this._resolved = true;

        const action = result.action === 'confirm' ? MSGBOX_ACTIONS.CONFIRM : MSGBOX_ACTIONS.CANCEL;
        this._emitEvent(action, { eventKey: this.eventKey, result });

        this.callback(result);
        this.close();
    }

    close(): void {
        if (!this._resolved) {
            this._resolved = true;
            this.callback({ action: 'cancel', value: '' });
        }

        const animation = this.playExitAnimation(this.el, [
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
        ]);

        this.playExitAnimation(this.maskEl, [{ opacity: 1 }, { opacity: 0 }]);

        animation.onfinish = () => {
            this.unmountFromOverlay(this.el);
            this.unmountFromOverlay(this.maskEl);
            this.releaseZIndex();

            this._emitEvent(MSGBOX_FEEDBACK_EVENTS.CLOSED, { eventKey: this.eventKey });

            this._nodeEls = {};
            this.dispose();
            this.onClose?.();
        };
    }
}

Msgbox.use(MSGBOX_ABILITIES);

export interface Msgbox extends IMsgbox {}