import { IOptionHandler } from '../types';
import { OPTION_TARGET_TO_KEYS, OptionDecl } from '@qimenjs/composable';
import { HIDDEN_MODE_CSS_MAP } from '@/component-core/constants';

/**
 * target-to 映射处理器
 *
 * 处理 definition.target 和 definition.to 的映射逻辑
 *
 * @type IOptionHandler
 */
export const targetToHandler: IOptionHandler = {
    name: 'target-to',
    handler(value: any, component: any, definition?: OptionDecl): boolean {
        const target = definition!.target;
        const to = definition!.to;
        const el = component.getNodeEl(target);
        if (!el) return false;

        if (to === OPTION_TARGET_TO_KEYS.value) {
            el.value = value;
            return true;
        }

        if (to === OPTION_TARGET_TO_KEYS.href) {
            el.href = value;
            return true;
        }

        if (to === OPTION_TARGET_TO_KEYS.text) {
            el.textContent = value;
            return true;
        }

        if (to === OPTION_TARGET_TO_KEYS.html) {
            el.innerHTML = value;
            return true;
        }

        if (to === OPTION_TARGET_TO_KEYS.src) {
            el.src = value;
            return true;
        }

        if (to === OPTION_TARGET_TO_KEYS.title) {
            el.title = value;
            return true;
        }

        if (to === OPTION_TARGET_TO_KEYS.alt) {
            el.alt = value;
        }

        return false;
    },
};

/**
 * 属性处理器
 *
 * 处理 attribute 选项
 *
 * @type ISimpleOptionHandler
 */
export const attributeHandler: IOptionHandler = {
    name: 'attribute',
    handler: (value: any, component: any) => {
        component.setAttributes('root', value);
        return true;
    },
};

/**
 * 样式处理器
 *
 * 处理 style 选项
 *
 * @type ISimpleOptionHandler
 */
export const styleHandler: IOptionHandler = {
    name: 'style',
    handler: (value: any, component: any) => {
        component.setStyles('root', value);
        return true;
    },
};

/**
 * 类名处理器
 *
 * 处理 cls 选项
 *
 * @type ISimpleOptionHandler
 */
export const clsHandler: IOptionHandler = {
    name: 'cls',
    handler: (value: any, component: any) => {
        component.addCls('root', value);
        return true;
    },
};

/**
 * 角色处理器
 *
 * 处理 role 选项
 *
 * @type ISimpleOptionHandler
 */
export const roleHandler: IOptionHandler = {
    name: 'role',

    handler: (value: any, component: any) => {
        component.setAttribute('root', 'role', value);
        return true;
    },
};

/**
 * 顺序处理器
 *
 * 处理 order 选项
 *
 * @type ISimpleOptionHandler
 */
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

/**
 * 鼠标样式处理器
 *
 * 处理 cursor 选项
 *
 * @type ISimpleOptionHandler
 */
export const cursorHandler: IOptionHandler = {
    name: 'cursor',

    handler: (value: any, component: any) => {
        component.setStyle('root', 'cursor', value);
        return true;
    },
};

/**
 * 提示处理器
 *
 * 处理 hint 选项
 *
 * @type ISimpleOptionHandler
 */
export const hintHandler: IOptionHandler = {
    name: 'hint',

    handler: (value: any, component: any) => {
        component.setAttribute('root', 'title', value);
        return true;
    },
};

/**
 * 隐藏状态处理器
 *
 * 处理 hidden 选项
 *
 * @type ISimpleOptionHandler
 */
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

/**
 * 禁用状态处理器
 *
 * 处理 disabled 选项
 *
 * @type ISimpleOptionHandler
 */
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
