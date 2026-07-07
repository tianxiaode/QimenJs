/**
 * PlaceholderAbility 占位符能力
 *
 * 在 flex 布局中占据剩余空间，将后续元素推到容器末尾。
 * 类似 CSS flex: 1 的效果，但作为能力可以动态控制。
 *
 * 组件通过 static placeholders 声明占位符列表，支持三种形式：
 * - 字符串：`static placeholders = ['spacer']` → 无 order
 * - 元组：`static placeholders = [['spacer', 50]]` → 带 order
 * - 对象：`static placeholders = [{ name: 'spacer', order: 50 }]` → 完整
 *
 * 只生成 show/hide 方法，不生成 set/get 方法（占位符没有内容）。
 *
 * @example
 * ```typescript
 * // 标题栏：图标 + 标题 + 占位符 + 关闭按钮
 * class HeaderComponent extends ComponentBase {
 *     static abilities = [IconAbility, TextAbility, PlaceholderAbility, ...];
 *     static icons = [['default', 10], ['close', 90]];
 *     static texts = [['default', 20]];
 *     static placeholders = [['spacer', 50]];
 * }
 *
 * // 使用
 * header.showSpacer();
 * header.hideSpacer();
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { string } from '@qimenjs/utils';
import { normalizeContentDecls, extractContentMeta } from '../content';
import type { ContentItemDecl, ContentItemConfig } from '../content';

export const PlaceholderAbility: AbilityDefinition = {
    /**
     * 从 props 初始化占位符
     */
    __initProps(props: Record<string, any>): void {
        const rawPlaceholders: ContentItemDecl[] = (this.constructor as any).placeholders || [];
        if (rawPlaceholders.length === 0) return;

        const configs = normalizeContentDecls(rawPlaceholders);
        const { names, positions } = extractContentMeta(configs);

        const capitalPrefix = 'Placeholder';
        const isSingle = configs.length === 1 && configs[0].name === 'default';

        // ─── 收集或创建占位符元素 ───

        const idMap: Record<string, string> = {};

        for (const cfg of configs) {
            const { name } = cfg;
            const key = `placeholder:${name}`;
            let el = this.el.querySelector(`[data-content="${key}"]`) as HTMLElement;

            if (el) {
                const id = string.getId('q-placeholder');
                el.id = id;
                idMap[name] = id;
            } else {
                const id = string.getId('q-placeholder');
                el = document.createElement('span');
                el.id = id;
                el.setAttribute('data-content', key);
                this.el.appendChild(el);
                idMap[name] = id;
            }

            // 设置 flex 和 position
            el.style.flex = '1';
            if (positions[name] !== undefined) {
                el.setAttribute('data-position', String(positions[name]));
            }
        }

        this.setAbilityState('ContentManager:placeholder:idMap', idMap);

        // ─── 核心操作 ───

        const getEl = (name: string): HTMLElement | null => {
            const id = idMap[name];
            if (!id) return null;
            return document.getElementById(id);
        };

        const showItem = (name: string) => {
            const el = getEl(name);
            if (el) el.style.display = '';
            return this;
        };

        const hideItem = (name: string) => {
            const el = getEl(name);
            if (el) el.style.display = 'none';
            return this;
        };

        // ─── 生成闭包方法（只有 show/hide） ───

        for (const cfg of configs) {
            const capitalName = cfg.name.charAt(0).toUpperCase() + cfg.name.slice(1);
            const suffix = `${capitalName}${capitalPrefix}`;

            this[`show${suffix}`] = () => showItem(cfg.name);
            this[`hide${suffix}`] = () => hideItem(cfg.name);
        }

        // ─── 单项简化 ───

        if (isSingle) {
            this[`show${capitalPrefix}`] = () => showItem('default');
            this[`hide${capitalPrefix}`] = () => hideItem('default');
        }
    },
};
