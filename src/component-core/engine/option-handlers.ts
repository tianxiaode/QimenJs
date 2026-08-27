import { IOptionHandler, OPTION_TARGET_TO_KEYS, OptionDecl } from '@qimenjs/composable';
import { HIDDEN_MODE_CSS_MAP } from '@/component-core/constants';
import { OptionHandlerRegistrar } from '@qimenjs/composable';

// ─── 工厂函数1: targetTo 处理器 ─────────────────────────────
// 修复：target 未定义时使用 root 节点
function registerTarget(key: string, fn: (el: HTMLElement, value: any, def: OptionDecl) => void) {
    OptionHandlerRegistrar.getInstance().registerTargetHandler(key, {
        name: key,
        handler(value: any, component: any, definition?: any) {
            const el = definition?.target ? component.getNodeEl(definition.target) : component.el;
            if (!el) return false;
            fn(el as HTMLElement, value, definition!);
            return true;
        },
    });
}

// ─── 工厂函数2: setAttribute 处理器 ──────────────────────────
function createAttributeHandler(attrName: string): IOptionHandler {
    return {
        name: attrName,
        handler: (value: any, component: any) => {
            component.setAttribute('root', attrName, value);
            return true;
        },
    };
}

// ─── 工厂函数3: setStyle 处理器 ─────────────────────────────
function createStyleHandler(styleName: string): IOptionHandler {
    return {
        name: styleName,
        handler: (value: any, component: any) => {
            component.setStyle('root', styleName, value);
            return true;
        },
    };
}

// ─── 注册 targetTo 子处理器 ──────────────────────────────────
registerTarget(OPTION_TARGET_TO_KEYS.value, (el, v) => {
    (el as HTMLInputElement).value = v;
});
registerTarget(OPTION_TARGET_TO_KEYS.href, (el, v) => {
    (el as HTMLAnchorElement).href = v;
});
registerTarget(OPTION_TARGET_TO_KEYS.text, (el, v) => {
    el.textContent = v;
});
registerTarget(OPTION_TARGET_TO_KEYS.html, (el, v) => {
    el.innerHTML = v;
});
registerTarget(OPTION_TARGET_TO_KEYS.src, (el, v) => {
    (el as HTMLImageElement).src = v;
});
registerTarget(OPTION_TARGET_TO_KEYS.title, (el, v) => {
    el.title = v;
});
registerTarget(OPTION_TARGET_TO_KEYS.alt, (el, v) => {
    (el as HTMLImageElement).alt = v;
});

// ─── 普通选项处理器 ──────────────────────────────────────────

/** 属性处理器 — 处理 attribute 选项 */
export const attributeHandler: IOptionHandler = {
    name: 'attributes',
    handler: (value: any, component: any) => {
        component.setAttributes('root', value);
        return true;
    },
};

/** 样式处理器 — 处理 style 选项 */
export const styleHandler: IOptionHandler = {
    name: 'style',
    handler: (value: any, component: any) => {
        component.setStyles('root', value);
        return true;
    },
};

/** 类名处理器 — 处理 cls 选项 */
export const clsHandler: IOptionHandler = {
    name: 'classes',
    handler: (value: any, component: any) => {
        component.addCls('root', value);
        return true;
    },
};

/** 角色处理器 — 处理 role 选项 */
export const roleHandler: IOptionHandler = createAttributeHandler('role');

/** 顺序处理器 — 处理 order 选项 */
export const orderHandler: IOptionHandler = {
    name: 'order',
    handler: (value: any, component: any) => {
        if (value === 0) {
            component.setStyle('root', 'order', undefined);
        } else {
            component.setStyle('root', 'order', value.toString());
        }
        return true;
    },
};

/** 鼠标样式处理器 — 处理 cursor 选项 */
export const cursorHandler: IOptionHandler = createStyleHandler('cursor');

/** 提示处理器 — 处理 hint 选项 */
export const hintHandler: IOptionHandler = createAttributeHandler('title');

/** 隐藏状态处理器 — 处理 hidden 选项 */
export const hiddenHandler: IOptionHandler = {
    name: 'hidden',
    handler: (value: any, component: any) => {
        const hiddenMode = component.hiddenMode;
        const css = (HIDDEN_MODE_CSS_MAP as any)[hiddenMode];
        if (value) {
            component.addCls('root', css);
        } else {
            component.removeCls('root', css);
        }
        return true;
    },
};

/** 禁用状态处理器 — 处理 disabled 选项 */
export const disabledHandler: IOptionHandler = {
    name: 'disabled',
    handler: (value: any, component: any) => {
        const cls = component.disabledCls;
        if (value) {
            component.addCls('root', cls);
        } else {
            component.removeCls('root', cls);
        }
        return true;
    },
};

export const i18nHandler: IOptionHandler = {
    name: 'i18n',
    handler: (value: any, component: any) => {
        for (const [name, val] of Object.entries(value)) {
            component.setI18n(name, { ...(val as any) });
        }
        return true;
    },
};

/** 视口位置处理器 — 处理 viewportPosition 选项 */
export const viewportPositionHandler: IOptionHandler = {
    name: 'viewportPosition',
    handler: (value: any, component: any) => {
        if (!value) return false;
        component.setViewportPosition(value, 0, 16);
        return true;
    },
};

// ─── 注册所有处理器 ──────────────────────────────────────────
const r = OptionHandlerRegistrar.getInstance();
const POSITION_PROPS = [
    'left',
    'top',
    'right',
    'bottom',
    'width',
    'height',
    'position',
    'zIndex',
    'transform',
];
POSITION_PROPS.forEach(prop => {
    r.register(createStyleHandler(prop));
});

r.register(viewportPositionHandler);

r.register(attributeHandler);
r.register(styleHandler);
r.register(clsHandler);
r.register(roleHandler);
r.register(orderHandler);
r.register(cursorHandler);
r.register(hintHandler);
r.register(hiddenHandler);
r.register(disabledHandler);
r.register(i18nHandler);
