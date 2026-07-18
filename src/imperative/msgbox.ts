/**
 * Msgbox — msgbox 实例
 *
 * 独立的能力实例（ComposableBase.with 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.with() 组合能力：
 * - TemplateCacheAbility：模板缓存 + 克隆 + nodeMap
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 * - EventAbility：事件作用域（emit 桥接事件，供外部组件监听）
 */

import { ComposableBase } from '@/composable';
import { TemplateCacheAbility } from '@/component-abilities/render/TemplateCacheAbility';
import { FloatingLayerAbility } from '@/overlay/FloatingLayerAbility';
import { EventAbility } from '@/system-abilities/system/EventAbility';
import { EventSourceRegistrar } from '@qimenjs/events';
import { MSGBOX_TEMPLATE } from '@/component-core/template-presets';
import { resolveI18nValue } from '@qimenjs/i18n';
import { ZIndexLevel } from '@qimenjs/component';
import type { MsgboxOptions, MsgboxResult, MsgboxType } from './types';

const MsgboxBase = ComposableBase.with([TemplateCacheAbility, FloatingLayerAbility, EventAbility]);

export class Msgbox extends MsgboxBase {
    /** 根 DOM 元素 */
    el!: HTMLElement;
    /** 遮罩 DOM 元素 */
    maskEl!: HTMLElement;
    /** 节点缓存（data-content key → HTMLElement） */
    nodeMap!: Record<string, HTMLElement>;
    /** z-index 值 */
    zIndex!: number;
    /** msgbox 类型 */
    type!: MsgboxType;
    /** 输入框元素（prompt 模式） */
    inputEl!: HTMLInputElement | null;
    /** Promise resolve 回调 */
    resolve!: (result: MsgboxResult) => void;

    constructor(
        options: MsgboxOptions & { type: MsgboxType },
        resolve: (result: MsgboxResult) => void
    ) {
        super();

        const type: MsgboxType = options.type;
        const confirmButtonText = options.confirmButtonText ?? '确定';
        const cancelButtonText = options.cancelButtonText ?? '取消';
        const inputPlaceholder = options.inputPlaceholder ?? '';

        this.type = type;
        this.resolve = resolve;

        // 1. 初始化能力
        this._zIndexLevel = ZIndexLevel.modal;
        this.initTemplateCache('msgbox', MSGBOX_TEMPLATE);

        // 注册 eventKey（在 eventScope 首次创建前设置）
        if (options.eventKey) {
            this.eventKey = options.eventKey;
            EventSourceRegistrar.getInstance().register(options.eventKey, this);
        }

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

        // 11. 绑定按钮事件（使用 bindDomEvent 跨平台适配）
        if (confirmBtn) {
            const unbind = this.bindDomEvent(confirmBtn, 'tap', () => {
                const value = type === 'prompt' && this.inputEl ? this.inputEl.value : '';
                this.emit('confirm', { action: 'confirm', value }, { source: this.eventKey });
                this.resolve({ action: 'confirm', value });
            });
            this.onCleanup(unbind);
        }

        if (cancelBtn) {
            const unbind = this.bindDomEvent(cancelBtn, 'tap', () => {
                this.emit('cancel', { action: 'cancel', value: '' }, { source: this.eventKey });
                this.resolve({ action: 'cancel', value: '' });
            });
            this.onCleanup(unbind);
        }
    }

    private setText(key: string, text: string): void {
        const el = this.nodeMap[key];
        if (el) el.textContent = text;
    }

    /**
     * 关闭 msgbox（播放退出动画后销毁）
     */
    close(): void {
        const animation = this.playExitAnimation(this.el, [
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
        ]);

        this.playExitAnimation(this.maskEl, [{ opacity: 1 }, { opacity: 0 }]);

        animation.onfinish = () => {
            this.unmountFromOverlay(this.el);
            this.unmountFromOverlay(this.maskEl);
            this.releaseZIndex();
            this.dispose();
        };
    }
}
