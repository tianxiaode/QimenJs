/**
 * createContentManager 内容管理器工厂方法
 *
 * 根据 names 数组管理一组内容项，自动：
 * - 从容器中查找 data-content 标记的元素，或自动创建
 * - 分配唯一 id（string.getId），存入 abilityState 自动销毁
 * - 生成闭包方法绑定到 host（set[Name][Prefix] / get / show / hide / setClass 等）
 * - 单项 default 时生成简化方法（set[Prefix] / get[Prefix] + 属性）
 *
 * 运行时通过 getElementById 查找元素，不固化引用，销毁无泄漏风险。
 *
 * @example
 * ```typescript
 * // IconAbility 内部
 * createContentManager(this, {
 *     prefix: 'icon',
 *     names: ['default'],
 *     mode: 'html',
 *     container: this.el,
 *     itemClass: 'q-button__icon',
 * });
 * // 自动在 host 上生成：setIcon / getIcon / showIcon / hideIcon / setIconClass / removeIconClass / icon 属性
 * ```
 */

import { string } from '@qimenjs/utils';
import type { AbilityDefinition } from '@qimenjs/composable';

/**
 * 内容管理器配置
 */
export interface ContentManagerConfig {
    /** 内容项前缀，如 'icon' | 'text' | 'tab' */
    prefix: string;
    /** 内容项名称列表，如 ['default'] | ['toggle', 'action'] */
    names: string[];
    /** 渲染模式：text 用 textContent，html 用 innerHTML */
    mode: 'text' | 'html';
    /** 宿主元素，从中查找 data-content 子元素 */
    container: HTMLElement;
    /** 可选：自动创建元素时添加的基础类名 */
    itemClass?: string;
    /** 可选：位置权重映射，name → position。与 ToolbarAbility 的 data-position 一致 */
    positions?: Record<string, number>;
}

/**
 * 创建内容管理器
 *
 * @param host - 宿主组件实例
 * @param config - 配置
 */
export function createContentManager(host: any, config: ContentManagerConfig): void {
    const { prefix, names, mode, container } = config;
    const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const isSingle = names.length === 1 && names[0] === 'default';

    // ─── 收集或创建元素，分配唯一 id ───

    const idMap: Record<string, string> = {};

    for (const name of names) {
        const key = `${prefix}:${name}`;
        let el = container.querySelector(`[data-content="${key}"]`) as HTMLElement;

        if (el) {
            // 从模板找到，分配唯一 id
            const id = string.getId(`q-${prefix}`);
            el.id = id;
            idMap[name] = id;
        } else {
            // 不存在，自动创建 span
            const id = string.getId(`q-${prefix}`);
            el = document.createElement('span');
            el.id = id;
            el.setAttribute('data-content', key);
            if (config.itemClass) {
                el.classList.add(config.itemClass);
                el.classList.add(`${config.itemClass}--${name}`);
            }
            container.appendChild(el);
            idMap[name] = id;
        }

        // 设置 data-position（如果提供了 positions 映射）
        if (config.positions && config.positions[name] !== undefined) {
            el.setAttribute('data-position', String(config.positions[name]));
        }
    }

    // 存到 abilityState，dispose 时自动销毁
    host.setAbilityState(`ContentManager:${prefix}:idMap`, idMap);

    // ─── 核心操作（用 getElementById，不固化引用） ───

    const getEl = (name: string): HTMLElement | null => {
        const id = idMap[name];
        if (!id) return null;
        return document.getElementById(id);
    };

    const setValue = (name: string, value: string) => {
        const el = getEl(name);
        if (!el) return host;
        if (mode === 'text') el.textContent = value;
        else el.innerHTML = value;
        host.markDirty?.();
        return host;
    };

    const getValue = (name: string): string => {
        const el = getEl(name);
        if (!el) return '';
        return mode === 'text' ? (el.textContent || '') : el.innerHTML;
    };

    const showItem = (name: string) => {
        const el = getEl(name);
        if (el) el.style.display = '';
        return host;
    };

    const hideItem = (name: string) => {
        const el = getEl(name);
        if (el) el.style.display = 'none';
        return host;
    };

    const addItemClass = (name: string, className: string) => {
        const el = getEl(name);
        if (el) el.classList.add(className);
        return host;
    };

    const removeItemClass = (name: string, className: string) => {
        const el = getEl(name);
        if (el) el.classList.remove(className);
        return host;
    };

    // ─── 生成闭包方法绑定到 host ───

    for (const name of names) {
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
        const suffix = `${capitalName}${capitalPrefix}`;

        host[`set${suffix}`] = (value: string) => setValue(name, value);
        host[`get${suffix}`] = () => getValue(name);
        host[`show${suffix}`] = () => showItem(name);
        host[`hide${suffix}`] = () => hideItem(name);

        if (mode === 'html') {
            host[`set${suffix}Class`] = (className: string) => addItemClass(name, className);
            host[`remove${suffix}Class`] = (className: string) => removeItemClass(name, className);
        }
    }

    // ─── 单项简化：setIcon / setText ───

    if (isSingle) {
        host[`set${capitalPrefix}`] = (value: string) => setValue('default', value);
        host[`get${capitalPrefix}`] = () => getValue('default');
        host[`show${capitalPrefix}`] = () => showItem('default');
        host[`hide${capitalPrefix}`] = () => hideItem('default');

        if (mode === 'html') {
            host[`set${capitalPrefix}Class`] = (className: string) => addItemClass('default', className);
            host[`remove${capitalPrefix}Class`] = (className: string) => removeItemClass('default', className);
        }

        // 便捷属性
        Object.defineProperty(host, prefix, {
            get: () => getValue('default'),
            set: (v: string) => setValue('default', v),
            configurable: true,
            enumerable: true,
        });
    }
}
