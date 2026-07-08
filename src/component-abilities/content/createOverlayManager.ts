/**
 * 浮层管理器工厂方法
 *
 * 根据配置创建浮层 DOM，从模板注册表获取模板，
 * 生成宿主控制方法（open/close/position），管理浮层生命周期。
 *
 * 由 createContentManager 在检测到浮层前缀时自动调用，
 * 也可独立使用。
 *
 * @module createOverlayManager
 */

import { HtmlTemplateRegistrar } from '@qimenjs/registry';
import { nextZIndex, releaseZIndex, ZIndexLevel } from '@/component/z-index';
import { OverlayRoot } from '@/component/OverlayRoot';
import { capitalize } from '@/utils/string/base';
import { positionOverlay, type Placement } from './positionOverlay';

/**
 * 浮层管理器配置
 */
export interface OverlayManagerConfig {
    /** 浮层类型前缀，如 'tips'、'dropdown'、'popover' */
    prefix: string;
    /** 弹出方向，默认 'bottom' */
    placement?: Placement;
    /** 浮层与锚点的间距，单位 px，默认 4 */
    offset?: number;
    /** z-index 层级，默认根据 prefix 从 ZIndexLevel 取 */
    zIndexLevel?: number;
    /** 是否启用自动翻转，默认 true */
    flip?: boolean;
}

/**
 * 浮层管理器返回结果
 */
export interface OverlayManagerResult {
    /** 浮层 DOM 元素 */
    overlayEl: HTMLElement;
    /** 浮层内的 contentMap（key 为 "prefix:name"） */
    contentMap: Map<string, HTMLElement>;
}

/**
 * 前缀到 z-index 层级的默认映射
 */
const PREFIX_ZINDEX_MAP: Record<string, number> = {
    tips: ZIndexLevel.tooltip,
    dropdown: ZIndexLevel.dropdown,
    popover: ZIndexLevel.dropdown,
};

/**
 * 一次性查询容器中所有 data-content 元素，建对照表
 *
 * 与 ContentAbility.buildContentMap 逻辑一致，
 * 此处独立定义避免循环依赖。
 */
function buildContentMap(container: HTMLElement): Map<string, HTMLElement> {
    const map = new Map<string, HTMLElement>();
    const elements = container.querySelectorAll('[data-content]');
    for (const el of elements) {
        const key = (el as HTMLElement).dataset.content!;
        if (key) {
            map.set(key, el as HTMLElement);
        }
    }
    return map;
}

/**
 * 创建浮层管理器
 *
 * @param host - 宿主组件实例
 * @param config - 浮层配置
 * @returns 浮层 DOM 和 contentMap
 */
export function createOverlayManager(
    host: any,
    config: OverlayManagerConfig,
): OverlayManagerResult | null {
    const { prefix } = config;
    const capitalPrefix = capitalize(prefix);
    const placement: Placement = config.placement ?? 'bottom';
    const offset: number = config.offset ?? 4;
    const zIndexLevel: number = config.zIndexLevel ?? PREFIX_ZINDEX_MAP[prefix] ?? ZIndexLevel.dropdown;
    const flip: boolean = config.flip ?? true;

    // ─── 1. 从模板注册表获取模板 ───

    const templateId = capitalPrefix;
    const registrar = HtmlTemplateRegistrar.getInstance();
    const template = registrar.get(templateId);

    if (!template) {
        if (host.logger) {
            host.logger.warn(`OverlayManager: template "${templateId}" not found in registry`, {
                prefix, component: host.constructor?.name,
            });
        }
        return null;
    }

    // ─── 2. 创建浮层 DOM ───

    const overlayEl = document.createElement('div');
    overlayEl.innerHTML = template;
    overlayEl.classList.add(`q-${prefix}`);
    overlayEl.style.position = 'absolute';
    overlayEl.style.display = 'none';
    overlayEl.style.pointerEvents = 'auto';

    // ─── 3. 扫描浮层内的 data-content 元素 ───

    const contentMap = buildContentMap(overlayEl);

    // ─── 4. 状态管理 ───

    host.setAbilityState(`OverlayManager:${prefix}:isOpen`, false);
    host.setAbilityState(`OverlayManager:${prefix}:placement`, placement);
    host.setAbilityState(`OverlayManager:${prefix}:zIndexLevel`, zIndexLevel);

    // ─── 5. 定位更新回调 ───

    let rafId: number | null = null;

    const onReposition = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            const currentPlacement = host.abilityState(`OverlayManager:${prefix}:placement`, () => placement);
            if (host.el && overlayEl) {
                positionOverlay(overlayEl, host.el, currentPlacement, offset, flip);
            }
        });
    };

    // ─── 6. 生成控制方法 ───

    const generatedProps: string[] = [];

    // open 方法
    const openOverlay = () => {
        const isOpen: boolean = host.abilityState(`OverlayManager:${prefix}:isOpen`, () => false);
        const currentPlacement = host.abilityState(`OverlayManager:${prefix}:placement`, () => placement);

        // 获取 z-index
        const zIdx = nextZIndex(zIndexLevel);
        overlayEl.style.zIndex = String(zIdx);
        host.setAbilityState(`OverlayManager:${prefix}:zIndex`, zIdx);

        // 计算定位
        if (host.el) {
            positionOverlay(overlayEl, host.el, currentPlacement, offset, flip);
        }

        // 挂载到 OverlayRoot
        const root = OverlayRoot.getInstance().getRoot();
        root.appendChild(overlayEl);

        overlayEl.style.display = '';

        // 注册 resize/scroll 监听（仅首次打开时）
        if (!isOpen) {
            window.addEventListener('resize', onReposition);
            window.addEventListener('scroll', onReposition, true);
        }

        host.setAbilityState(`OverlayManager:${prefix}:isOpen`, true);
    };

    // close 方法
    const closeOverlay = () => {
        const isOpen: boolean = host.abilityState(`OverlayManager:${prefix}:isOpen`, () => false);
        if (!isOpen) return;

        overlayEl.style.display = 'none';

        // 从 OverlayRoot 移除
        if (overlayEl.parentNode) {
            overlayEl.parentNode.removeChild(overlayEl);
        }

        // 释放 z-index
        releaseZIndex(zIndexLevel);

        // 移除 resize/scroll 监听
        window.removeEventListener('resize', onReposition);
        window.removeEventListener('scroll', onReposition, true);

        // 取消待执行的 rAF
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        host.setAbilityState(`OverlayManager:${prefix}:isOpen`, false);
    };

    // position 方法
    const positionOverlayMethod = () => {
        const currentPlacement = host.abilityState(`OverlayManager:${prefix}:placement`, () => placement);
        if (host.el && overlayEl) {
            positionOverlay(overlayEl, host.el, currentPlacement, offset, flip);
        }
    };

    // 绑定方法到 host
    host[`open${capitalPrefix}`] = openOverlay;
    host[`close${capitalPrefix}`] = closeOverlay;
    host[`position${capitalPrefix}`] = positionOverlayMethod;

    generatedProps.push(`open${capitalPrefix}`, `close${capitalPrefix}`, `position${capitalPrefix}`);

    // placement getter/setter
    const placementPropName = `${prefix}Placement`;
    Object.defineProperty(host, placementPropName, {
        get: () => host.abilityState(`OverlayManager:${prefix}:placement`, () => placement),
        set: (v: Placement) => {
            host.setAbilityState(`OverlayManager:${prefix}:placement`, v);
        },
        configurable: true,
        enumerable: true,
    });

    generatedProps.push(placementPropName);

    // ─── 7. 注册 onCleanup 清理回调 ───

    host.onCleanup(() => {
        // 检查是否仍打开
        const isOpen: boolean = host.abilityState(`OverlayManager:${prefix}:isOpen`, () => false);

        // 从 OverlayRoot 移除（若仍打开）
        if (overlayEl.parentNode) {
            overlayEl.parentNode.removeChild(overlayEl);
        }

        // 释放 z-index（若仍打开）
        if (isOpen) {
            releaseZIndex(zIndexLevel);
        }

        // 移除 resize/scroll 监听
        window.removeEventListener('resize', onReposition);
        window.removeEventListener('scroll', onReposition, true);

        // 取消待执行的 rAF
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        // 释放 DOM 引用
        // overlayEl 的闭包引用在函数结束后不可达，但显式清理更安全
        // 注意：不能直接赋值 overlayEl = null，因为闭包中其他函数仍引用它
        // 通过清空 innerHTML 释放子元素引用
        overlayEl.innerHTML = '';

        // delete 宿主上的属性和方法
        for (const prop of generatedProps) {
            delete host[prop];
        }
    });

    // ─── 8. 返回结果 ───

    return { overlayEl, contentMap };
}
