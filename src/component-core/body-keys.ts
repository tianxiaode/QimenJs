/**
 * Body 特殊配置键定义
 *
 * 统一管理 body 中需要特殊处理的配置键，供以下场景使用：
 * - content-properties.ts：排除特殊 key，不作为内容属性
 * - TemplateComponent.ts：特殊 key 映射为静态属性
 * - InitAbility.ts：特殊 key 需要自动注册/初始化
 * - 运行时校验：未知特殊 key 发出警告
 */

import type { BodyKeyDef, DomainOverlayKey } from './types/body-keys';

export const BODY_SPECIAL_KEYS: Record<string, BodyKeyDef> = {
    type: {
        category: 'static',
        description: '组件类型，映射为 TemplateClass.type',
    },
    listens: {
        category: 'static',
        description: '事件监听配置，映射为 TemplateClass.listens，bindEventListen 处理',
    },
    bridges: {
        category: 'static',
        description: '事件监听配置（已废弃，映射为 listens）',
        deprecated: true,
        alias: 'listens',
    },
    forwards: {
        category: 'static',
        description: '属性转发配置，映射为 TemplateClass._forwards',
    },
    overlays: {
        category: 'init',
        description:
            '浮层配置，InitAbility._initOverlays 自动注册到 OverlayDispatchCenter 并绑定 trigger',
    },
    tooltip: {
        category: 'init',
        description: '提示框域配置，InitAbility._initTooltipOverlay 自动注册 tooltip 浮层',
    },
    overflowConfig: {
        category: 'init',
        description:
            '溢出域配置，InitAbility._initOverflowOverlay 自动注册溢出浮层（scroll 或 menu）',
    },
    submenu: {
        category: 'init',
        description: '子菜单域配置，InitAbility._initSubmenuOverlay 自动注册子菜单浮层',
    },
    contextMenu: {
        category: 'init',
        description: '右键菜单域配置，InitAbility._initContextMenuOverlay 自动注册右键菜单浮层',
    },
    drags: {
        category: 'init',
        description:
            '拖拽源配置，InitAbility._initDrags 自动绑定 DragProcessor 手势并接入 DragEventBus',
    },
    abilities: {
        category: 'init',
        description: '能力注入，InitAbility.setupAbilities 处理',
    },
    extraFns: {
        category: 'init',
        description: '额外方法绑定，InitAbility.initConfig 中 bind 到实例',
    },
    entity: {
        category: 'init',
        description: '实体管理器类引用，InitAbility.initConfig 中实例化',
    },
    eventBridge: {
        category: 'init',
        description: '事件桥接配置，InitAbility.initConfig 中初始化',
    },
    meta: {
        category: 'init',
        description: '元数据，InitAbility.initConfig 中复制到实例',
    },
};

export const DOMAIN_OVERLAY_KEYS = ['tooltip', 'overflowConfig', 'submenu', 'contextMenu'] as const;

export const BODY_SPECIAL_KEY_SET = new Set(Object.keys(BODY_SPECIAL_KEYS));

export function isBodySpecialKey(key: string): boolean {
    return BODY_SPECIAL_KEY_SET.has(key);
}

export function validateBodyKey(key: string): void {
    const def = BODY_SPECIAL_KEYS[key];
    if (def?.deprecated) {
        console.warn(`[BodyConfig] key "${key}" is deprecated, use "${def.alias}" instead`);
    }
}
