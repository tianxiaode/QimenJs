/**
 * Msgbox — msgbox 实例
 *
 * 独立的能力实例（ComposableBase.with 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.with() 组合能力：
 * - TemplateCacheAbility：模板缓存 + 克隆 + nodeMap
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 *
 * 事件通过 OverlayEventBus 发送，编码：overlay:{overlayKey}:{action}
 * 外部可通过 overlayEventBus.overlayOn(overlayKey, action, handler) 监听。
 */

import { ComposableBase } from '@/composable';
import { TemplateCacheAbility } from '@/component-abilities/render/TemplateCacheAbility';
import { FloatingLayerAbility } from '@/overlay/FloatingLayerAbility';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { EventContextBuilder } from '@/context';
import { MSGBOX_ACTIONS, MSGBOX_FEEDBACK_EVENTS } from './imperative-events';
import { MSGBOX_TEMPLATE } from '@/component-core/template-presets';
import { resolveI18nValue } from '@qimenjs/i18n';
import { ZIndexLevel } from '@qimenjs/component';
import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { MsgboxOptions, MsgboxResult, MsgboxType } from './types';

const MsgboxBase = ComposableBase.use([TemplateCacheAbility, FloatingLayerAbility]);

export class Msgbox extends MsgboxBase {
    // ─── TemplateCacheAbility 方法 ───
    declare initTemplateCache: (name: string, template: TplNode) => void;
    declare cloneFromCache: (name: string) => {
        root: HTMLElement;
        nodeMap: Record<string, HTMLElement>;
    };

    // ─── FloatingLayerAbility 方法 ───
    declare _zIndexLevel: number;
    declare acquireZIndex: (level?: number) => number;
    declare releaseZIndex: () => void;
    declare mountToOverlay: (el: HTMLElement) => void;
    declare unmountFromOverlay: (el: HTMLElement) => void;
    declare setViewportPosition: (
        el: HTMLElement,
        position: any,
        offset?: number,
        margin?: number
    ) => void;
    declare playEnterAnimation: (
        el: HTMLElement,
        keyframes: Keyframe[],
        options?: any
    ) => Animation;
    declare playExitAnimation: (el: HTMLElement, keyframes: Keyframe[], options?: any) => Animation;
    declare bindDomEvent: (
        el: HTMLElement,
        semantic: string,
        handler: (e: Event) => void
    ) => () => void;

    el!: HTMLElement;
    maskEl!: HTMLElement;
    nodeMap!: Record<string, HTMLElement>;
    zIndex!: number;
    type!: MsgboxType;
    overlayKey!: string;
    inputEl!: HTMLInputElement | null;
    resolve!: (result: MsgboxResult) => void;
    onClose!: () => void;
    private _resolved = false;

    private readonly bus = OverlayEventBus.getInstance();

    constructor(
        options: MsgboxOptions & { type: MsgboxType; overlayKey: string },
        resolve: (result: MsgboxResult) => void
    ) {
        super();

        const type: MsgboxType = options.type;
        const confirmButtonText = options.confirmButtonText ?? '确定';
        const cancelButtonText = options.cancelButtonText ?? '取消';
        const inputPlaceholder = options.inputPlaceholder ?? '';

        this.type = type;
        this.overlayKey = options.overlayKey;
        this.resolve = resolve;

        // 1. 初始化能力
        this._zIndexLevel = ZIndexLevel.modal;
        this.initTemplateCache('msgbox', { tpl: MSGBOX_TEMPLATE });

        // 2. 从缓存克隆 DOM + 构建 nodeMap
        const { root, nodeMap } = this.cloneFromCache('msgbox');
        this.el = root;
        this.nodeMap = nodeMap;

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
        this.setText('msgbox:text', resolveI18nValue(options.title));
        this.setText('msgbox:content', resolveI18nValue(options.content ?? ''));

        // 6. 根据类型配置按钮区域
        const cancelBtn = this.nodeMap['msgbox:cancel'];
        const confirmBtn = this.nodeMap['msgbox:confirm'];
        const inputEl = this.nodeMap['msgbox:field'] as HTMLInputElement | null;
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

    private setText(key: string, text: string): void {
        const el = this.nodeMap[key];
        if (el) el.textContent = text;
    }

    private _doResolve(result: MsgboxResult): void {
        if (this._resolved) return;
        this._resolved = true;

        const action = result.action === 'confirm' ? MSGBOX_ACTIONS.CONFIRM : MSGBOX_ACTIONS.CANCEL;

        this.bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${this.overlayKey}:${action}`)
                .withType(action)
                .withSource(this.overlayKey)
                .withData({ overlayKey: this.overlayKey, result })
                .build()
        );

        this.resolve(result);
        this.close();
    }

    close(): void {
        if (!this._resolved) {
            this._resolved = true;
            this.resolve({ action: 'cancel', value: '' });
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

            this.bus.overlayEmit(
                EventContextBuilder.create()
                    .withEvent(`overlay:${this.overlayKey}:${MSGBOX_FEEDBACK_EVENTS.CLOSED}`)
                    .withType(MSGBOX_FEEDBACK_EVENTS.CLOSED)
                    .withSource(this.overlayKey)
                    .withData({ overlayKey: this.overlayKey })
                    .build()
            );

            this.dispose();
            this.onClose?.();
        };
    }
}
