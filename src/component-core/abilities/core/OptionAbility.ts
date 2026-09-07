/**
 * OptionAbility — 组件选项能力
 *
 * 负责组件选项（option）变化时的响应式处理：
 * - text / hint / hidden / hiddenMode / disable 等选项变化时自动更新 DOM 或样式
 * - 提供 _cssPrefix getter 获取组件 CSS �@ 前缀
 */

import { HIDDEN_MODE_CSS_MAP, RADIUS_MAP } from '@/component-core/constants';
import { i18nTextRegistry } from '@/component-core/engine';
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { withDefinitions, type AbilityDefinition, type Definitions } from '@/composable';
import { I18N_PREFIX, resolveI18nValue } from '@/i18n';
import type { TemplateDecl } from '@/component-core';

/** 判断是否为 TemplateDecl（模板声明），用于 _renderSlot 三路分发 */
function isTemplateDecl(value: any): value is TemplateDecl {
    return !!value && typeof value === 'object' && ('tag' in value || 'children' in value);
}

/** 组件选项能力，选项变化时自动同步到 DOM / 样式 */
export const OptionAbility: AbilityDefinition = {
    _onStyleOptionChange(value: any, _old: any) {
        if (!value) return; // 无值时不处理
        this.setStyles(value);
    },

    _onAttributeOptionChange(value: any, _old: any) {
        if (!value) return; // 无值时不处理
        this.setAttributes(value);
    },

    _onHiddenOptionChange(_vlaue: any, _old: any) {
        this._applyHidden(); // 更新隐藏状态
    },

    _onHiddenModeOptionChange(_value: any, _old: any) {
        this._applyHidden(); // 更新隐藏状态
    },

    _applyHidden() {
        const hidden = this.hidden;
        const cls = (HIDDEN_MODE_CSS_MAP as any)[this.hiddenMode];
        hidden ? this.addCls(cls) : this.removeCls(cls);
    },

    _onDisableOptionChange(_value: any, _old: any) {
        if (this.disable) {
            this.addCls(`${this._cssPrefix}--disabled`);
            this.addCls('q-disabled');
        } else {
            this.removeCls(`${this._cssPrefix}--disabled`);
            this.removeCls('q-disabled');
        }
    },

    _onRadiusOptionChange(value: any, _old: any) {
        if (!value) {
            this.el?.style.removeProperty('border-radius');
            return;
        }
        const resolved = RADIUS_MAP[value] ?? value;
        this.el?.style.setProperty('border-radius', resolved);
    },

    _onHintOptionChange(value: any, _old: any) {
        if (value) {
            this._setNodeAttr('root', 'title', String(value));
        } else {
            this.el?.removeAttribute('title');
            this._unregisterI18nNode('root', 'title');
        }
    },

    get _cssPrefix(): string {
        return `q-${this.type.toLowerCase()}`;
    },

    _toggleOptionCls(prefix: string, value: string, old: string, nodeName: string = 'root') {
        if (value) this.addCls(prefix + value, nodeName);
        if (old) this.removeCls(prefix + old, nodeName);
    },

    /** 将文本写入指定节点的 textContent，值以 `@` 开头时自动翻译并注册 i18n 刷新依赖 */
    _setNodeText(nodeName: string, text: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        (el as HTMLElement).textContent = resolveI18nValue(text ?? '');
        if (text && text.startsWith(I18N_PREFIX)) {
            this._registerI18nNode(nodeName, 'textContent', text);
        } else {
            this._unregisterI18nNode(nodeName, 'textContent');
        }
    },

    /** 向指定节点设置属性，值以 `@` 开头时自动翻译并注册 i18n 刷新依赖 */
    _setNodeAttr(nodeName: string, key: string, value: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        (el as HTMLElement).setAttribute(key, resolveI18nValue(value));
        if (value && value.startsWith(I18N_PREFIX)) {
            this._registerI18nNode(nodeName, key, value);
        } else {
            this._unregisterI18nNode(nodeName, key);
        }
    },

    _registerI18nNode(nodeName: string, prop: string, text: string): void {
        if (!this.abilityState('OptionAbility:i18nCleanupRegistered')) {
            this.setAbilityState('OptionAbility:i18nCleanupRegistered', true);
            this.onCleanup(() => i18nTextRegistry.unregisterAll(this));
        }
        i18nTextRegistry.register(this, nodeName, prop, text);
    },

    _unregisterI18nNode(nodeName: string, prop: string): void {
        i18nTextRegistry.unregister(this, nodeName, prop);
    },

    /** 将 HTML 写入指定节点的 innerHTML */
    _setNodeHtml(nodeName: string, html: string): void {
        const el = this.getNodeEl(nodeName);
        if (el) (el as HTMLElement).innerHTML = html ?? '';
    },

    /**
     * 渲染内容区（宿主内容类 option 通用，如 Card 的 body/footer）
     *
     * - string：HTML 注入 innerHTML
     * - 组件类：以目标节点作为 container 实例化并自动挂载
     * - TemplateDecl：以临时插槽组件承载（动态派生子类，走完整组件初始化流程），
     *   el 即 decl 根节点，无额外包裹层
     *
     * 生命周期：
     * - 换值：先 dispose 旧组件实例再渲染新内容
     * - 宿主销毁：由 _disposeChildComponents 自动清理（子组件已加入 childComponentList）
     */
    _renderSlot(nodeName: string, value: any): void {
        const self = this as any;
        const slots = self._slotInstances ?? (self._slotInstances = {});

        const prev = slots[nodeName];
        if (prev && typeof prev.dispose === 'function') prev.dispose();
        slots[nodeName] = null;

        const el = this.getNodeEl(nodeName);
        if (!el) return;

        if (typeof value === 'string') {
            this._setNodeHtml(nodeName, value);
        } else if (typeof value === 'function') {
            const inst = new value({ container: el });
            slots[nodeName] = inst;
            this.childComponentList.push(inst);
            this._setRawData(nodeName, inst);
        } else if (isTemplateDecl(value)) {
            const inst = this._createSlotComponent(value, el);
            slots[nodeName] = inst;
            this.childComponentList.push(inst);
            this._setRawData(nodeName, inst);
        }
    },

    _createSlotComponent(decl: TemplateDecl, container: HTMLElement): any {
        const BaseCtor = ComponentRegistrar.getInstance().get('component')!;
        const SlotCls = class SlotComponentFactory extends BaseCtor {
            static type = 'slot';
            get tpl(): TemplateDecl {
                return decl;
            }
        };
        withDefinitions(SlotCls, {} as Definitions);
        return new SlotCls({ container });
    },

    _applyOptions(options?: Record<string, any>) {
        if (!options) return;
        const optionsKeys: Map<string, any> = this.optionsKeys;
        const propertyKeys: Map<string, any> = this.propertyKeys;
        for (const [key, value] of Object.entries(options)) {
            if (key === 'id') continue;
            if (optionsKeys.has(key)) {
                this.setData(key, value);
            } else if (propertyKeys.has(key)) {
                this[key] = value;
            }
        }
    },
} satisfies AbilityDefinition;
