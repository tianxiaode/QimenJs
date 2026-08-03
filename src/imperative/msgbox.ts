/**
 * Msgbox — msgbox 实例
 *
 * 独立的能力实例（ComposableBase.with 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.with() 组合能力：
 * - TemplateCacheAbility：模板缓存 + 克隆 + nodeMap
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 * - SystemEventBusAbility：系统事件收发（仅在 eventKey 存在时发送）
 *
 * 事件通过 SystemEventBus 发送，编码：{eventKey}:{action}
 * 仅当 MsgboxOptions.eventKey 已定义时才发送，否则跳过。
 */

import { ComposableBase } from '@/composable';
import { TemplateCacheAbility } from '@/component-abilities';
import { FloatingLayerAbility } from '@/overlay';
import { EventContextBuilder } from '@/context';
import { MSGBOX_ACTIONS, MSGBOX_FEEDBACK_EVENTS } from './imperative-events';
import { MSGBOX_TEMPLATE } from './msgbox-tpl';
import { resolveI18nValue, t } from '@qimenjs/i18n';
import { ZIndexLevel } from '@qimenjs/component';
import type { MsgboxOptions, MsgboxResult, MsgboxType } from './types';
import { DomEventsAbility, SystemEventBusAbility } from '@/system-abilities';

export class Msgbox extends ComposableBase {
    el!: HTMLElement;
    maskEl!: HTMLElement;
    nodeMap!: Record<string, HTMLElement>;
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
        const self = this as any;

        const type: MsgboxType = options.type;
        const confirmButtonText = options.confirmButtonText ?? t('msgbox.confirm');
        const cancelButtonText = options.cancelButtonText ?? t('msgbox.cancel');
        const inputPlaceholder = options.inputPlaceholder ?? '';

        self.type = type;
        self.eventKey = options.eventKey;
        self.callback = callback;

        // 1. 初始化能力
        self._zIndexLevel = ZIndexLevel.modal;
        self.initTemplateCache('msgbox', { tpl: MSGBOX_TEMPLATE });

        // 2. 从缓存克隆 DOM + 构建 nodeMap
        const { root, nodeMap } = self.cloneFromCache('msgbox');
        self.el = root;
        self.nodeMap = nodeMap;

        // 3. 创建遮罩
        self.maskEl = document.createElement('div');
        self.maskEl.classList.add('q-msgbox-mask');
        self.maskEl.style.position = 'fixed';
        self.maskEl.style.inset = '0';
        self.maskEl.style.background = 'rgba(0,0,0,0.5)';

        // 4. 设置样式
        self.el.classList.add('q-msgbox');
        self.el.style.pointerEvents = 'auto';

        // 5. 设置内容
        self.setText('msgbox:text', resolveI18nValue(options.title));
        self.setText('msgbox:content', resolveI18nValue(options.content ?? ''));

        // 6. 根据类型配置按钮区域
        const cancelBtn = self.nodeMap['msgbox:cancel'];
        const confirmBtn = self.nodeMap['msgbox:confirm'];
        const inputEl = self.nodeMap['msgbox:field'] as HTMLInputElement | null;
        self.inputEl = inputEl ?? null;

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
        self.zIndex = self.acquireZIndex();
        self.el.style.zIndex = String(self.zIndex);
        self.maskEl.style.zIndex = String(self.zIndex);

        // 8. 居中定位
        self.setViewportPosition(self.el, 'center');

        // 9. 挂载到 OverlayRoot
        self.mountToOverlay(self.maskEl);
        self.mountToOverlay(self.el);

        // 10. 播放进入动画
        self.playEnterAnimation(self.el, [
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ]);

        // 11. 绑定按钮事件
        if (confirmBtn) {
            self.bindDomEvent(confirmBtn, 'tap', () => {
                self._doResolve({
                    action: 'confirm',
                    value: type === 'prompt' && self.inputEl ? self.inputEl.value : '',
                });
            });
        }

        if (cancelBtn) {
            self.bindDomEvent(cancelBtn, 'tap', () => {
                self._doResolve({ action: 'cancel', value: '' });
            });
        }

        // 12. 遮罩点击关闭（alert 类型）
        if (type === 'alert') {
            self.bindDomEvent(self.maskEl, 'tap', () => {
                self._doResolve({ action: 'cancel', value: '' });
            });
        }
    }

    private setText(key: string, text: string): void {
        const el = (this as any).nodeMap[key];
        if (el) el.textContent = text;
    }

    private _emitEvent(action: string, data: Record<string, any>): void {
        if (!this.eventKey) return;
        const self = this as any;
        const event = `${this.eventKey}:${action}`;
        self.systemEmit(
            event,
            EventContextBuilder.create()
                .withEvent(event)
                .withType(action)
                .withSource(this.eventKey)
                .withData(data)
                .build()
        );
    }

    private _doResolve(result: MsgboxResult): void {
        if (this._resolved) return;
        this._resolved = true;

        const action = result.action === 'confirm' ? MSGBOX_ACTIONS.CONFIRM : MSGBOX_ACTIONS.CANCEL;
        this._emitEvent(action, { eventKey: this.eventKey, result });

        (this as any).callback(result);
        this.close();
    }

    close(): void {
        const self = this as any;

        if (!this._resolved) {
            this._resolved = true;
            self.callback({ action: 'cancel', value: '' });
        }

        const animation = self.playExitAnimation(self.el, [
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
        ]);

        self.playExitAnimation(self.maskEl, [{ opacity: 1 }, { opacity: 0 }]);

        animation.onfinish = () => {
            self.unmountFromOverlay(self.el);
            self.unmountFromOverlay(self.maskEl);
            self.releaseZIndex();

            this._emitEvent(MSGBOX_FEEDBACK_EVENTS.CLOSED, { eventKey: this.eventKey });

            self.dispose();
            self.onClose?.();
        };
    }
}

Msgbox.use([TemplateCacheAbility, FloatingLayerAbility, DomEventsAbility, SystemEventBusAbility]);
export type MsgboxInstance = InstanceType<typeof Msgbox>;
