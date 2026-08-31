import { AbilityDefinition, TARGET_TO_OPTION_MAP } from '@/composable';

/**
 * 节点属性操作（直接操作 DOM）
 *
 * 读取方法返回单个值；设置方法为对象模式，nodeName 后置，默认 'root'
 */
export const AttributeAbility: AbilityDefinition = {
    getAttribute(attributeName: string, nodeName: string = 'root'): any {
        return this.getNodeEl(nodeName)?.getAttribute(attributeName);
    },

    getStyle(styleName: string, nodeName: string = 'root'): string {
        return this.getNodeEl(nodeName)?.style?.[styleName] || '';
    },

    setAttributes(attributes: Record<string, any>, nodeName: string = 'root'): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        for (const [key, value] of Object.entries(attributes ?? {})) {
            el.setAttribute(key, value);
        }
    },

    removeAttributes(attributes: string[], nodeName: string = 'root'): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        for (const attr of attributes) {
            el.removeAttribute(attr);
        }
    },

    setStyles(styles: Record<string, string>, nodeName: string = 'root'): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        const style = el.style as any;
        for (const [key, value] of Object.entries(styles)) {
            style[key] = value;
        }
    },

    removeStyles(styles: string[], nodeName: string = 'root'): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        const style = el.style as any;
        for (const key of styles) {
            style[key] = '';
        }
    },

    getCls(nodeName: string = 'root'): DOMTokenList {
        return this.getNodeEl(nodeName).classList;
    },

    _toClsTokens(cls: string | string[]): string[] {
        const tokens = Array.isArray(cls) ? cls : cls.split(/\s+/);
        return tokens.filter(Boolean);
    },

    hasCls(cls: string | string[], nodeName: string = 'root'): boolean {
        const clsList = this.getCls(nodeName);
        return this._toClsTokens(cls).every((token: string) => clsList.contains(token));
    },

    addCls(cls: string | string[], nodeName: string = 'root'): void {
        this.getCls(nodeName).add(...this._toClsTokens(cls));
    },

    removeCls(cls: string | string[], nodeName: string = 'root'): void {
        this.getCls(nodeName).remove(...this._toClsTokens(cls));
    },

    toggleCls(cls: string | string[], nodeName: string = 'root', force?: boolean): void {
        const clsList = this.getCls(nodeName);
        for (const token of this._toClsTokens(cls)) {
            clsList.toggle(token, force);
        }
    },

    /**
     * 获取组件根元素在视口中的位置和尺寸
     *
     * 等价于 `this.el.getBoundingClientRect()`，用于位置计算。
     */
    getRect(): DOMRect {
        return this.el!.getBoundingClientRect();
    },

    _applyContentToElement(target: string, text: string, to: string): void {
        const el = this.getNodeEl(target);
        const toMap = TARGET_TO_OPTION_MAP as any;
        if (to && to in toMap) {
            el[toMap[to]] = text;
        }
    },
} satisfies AbilityDefinition;
