import { AbilityDefinition } from '@/composable';

/**
 * 节点属性操作（走脏追踪）
 *
 * 所有属性变更都通过 _markNodeDirty 触发脏追踪
 */
export const AttributeAbility: AbilityDefinition = {
    getAttribute(nodeName: string, attributeName: string): any {
        return this._getNodeAttribute(nodeName, attributeName);
    },

    setAttribute(nodeName: string, attributeName: string, value: any): void {
        this._markNodeAttributeDirty(nodeName, { [attributeName]: value });
    },

    setAttributes(nodeName: string, attributes: Record<string, any>): void {
        this._markNodeAttributeDirty(nodeName, attributes);
    },

    removeAttribute(nodeName: string, attribute: string): void {
        this._markNodeAttributeDirty(nodeName, { [attribute]: null });
    },

    removeAttributes(nodeName: string, attributes: string[]): void {
        const removes = attributes.reduce((acc, attr) => {
            acc[attr] = null;
            return acc;
        }, {} as any);
        this._markNodeAttributeDirty(nodeName, removes);
    },

    getStyle(nodeName: string, styleName: string): string {
        return this._getNodeStyle(nodeName, styleName) || '';
    },

    setStyle(nodeName: string, styleName: string, value: string): void {
        this._markNodeStyleDirty(nodeName, { [styleName]: value });
    },

    setStyles(nodeName: string, styles: Record<string, string>): void {
        this._markNodeStyleDirty(nodeName, styles);
    },

    removeStyle(nodeName: string, style: string): void {
        this._markNodeStyleDirty(nodeName, { [style]: null });
    },

    removeStyles(nodeName: string, styles: string[]): void {
        const removes = styles.reduce((acc, style) => {
            acc[style] = null;
            return acc;
        }, {} as any);
        this._markNodeStyleDirty(nodeName, removes);
    },

    getCls(nodeName: string): DOMTokenList {
        return this.getNodeEl(nodeName).classList;
    },

    hasCls(nodeName: string, cls: string): boolean {
        return this.getNodeEl(nodeName).classList.contains(cls) || false;
    },

    addCls(nodeName: string, cls: string): void {
        const clsList = this.getCls(nodeName);
        clsList.add(cls);
    },

    removeCls(nodeName: string, cls: string): void {
        const clsList = this.getCls(nodeName);
        clsList.remove(cls);
    },

    toggleCls(nodeName: string, cls: string, force?: boolean): void {
        const clsList = this.getCls(nodeName);
        clsList.toggle(cls, force);
    },

    /**
     * 标记节点为脏（自动分类）
     */
    _markNodeAttributeDirty(nodeName: string, attributes: Record<string, any>): void {
        let dirtyAttributes = this._dirtyAttributes;
        if (!dirtyAttributes) {
            dirtyAttributes = { [nodeName]: {} };
            this._dirtyAttributes = dirtyAttributes;
        }
        for (const [key, value] of Object.entries(attributes)) {
            dirtyAttributes[nodeName][key] = value;
        }
        this.debounce('attributeAbility:_flushNodes', this._flushNodes, 100);
    },

    _markNodeStyleDirty(nodeName: string, styles: Record<string, any>): void {
        let dirtyStyles = this._dirtyStyles;
        if (!dirtyStyles) {
            dirtyStyles = { [nodeName]: {} };
            this._dirtyStyles = dirtyStyles;
        }
        for (const [key, value] of Object.entries(styles)) {
            dirtyStyles[nodeName][key] = value;
        }
        this.debounce('attributeAbility:_flushNodes', this._flushNodes, 100);
    },

    _getNodeAttribute(nodeName: string, attrubuteName: string): Record<string, any> {
        const dirtyAttributes = this.dirtyAttributes;
        if (
            dirtyAttributes &&
            dirtyAttributes[nodeName] &&
            dirtyAttributes[nodeName][attrubuteName] !== undefined
        ) {
            return dirtyAttributes[nodeName][attrubuteName];
        }
        return this.getNodeEl(nodeName)?.getAttribute(attrubuteName);
    },

    _getNodeStyle(nodeName: string, styleName: string): Record<string, any> {
        const dirtyStyles = this.dirtyStyles;
        if (
            dirtyStyles &&
            dirtyStyles[nodeName] &&
            dirtyStyles[nodeName][styleName] !== undefined
        ) {
            return dirtyStyles[nodeName][styleName];
        }
        return this.getNodeEl(nodeName)?.getStyle(styleName);
    },

    _flushNodeAttribute(nodeName: string, el: HTMLElement): void {
        const dirtyAttributes = this.dirtyAttributes;
        if (dirtyAttributes && dirtyAttributes[nodeName]) {
            for (const [key, value] of Object.entries(dirtyAttributes[nodeName])) {
                el.setAttribute(key, value as string);
            }
            delete dirtyAttributes[nodeName];
        }
    },

    _flushNodeStyle(nodeName: string, el: HTMLElement): void {
        const dirtyStyles = this.dirtyStyles;
        if (dirtyStyles && dirtyStyles[nodeName]) {
            const style = el.style as any;
            if (!style) return;
            for (const [key, value] of Object.entries(dirtyStyles[nodeName])) {
                style[key] = value;
            }
            delete dirtyStyles[nodeName];
        }
    },

    _flushNodes() {
        const names = this.getNodeNames();
        for (const name of names) {
            const el = this.getNodeEl(name);
            if (!el) return;
            this._flushNodeAttribute(name, el);
            this._flushNodeStyle(name, el);
        }
    },
} satisfies AbilityDefinition;
