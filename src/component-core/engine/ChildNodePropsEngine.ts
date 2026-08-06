/**
 * ChildNodePropsEngine — 子节点内容属性引擎
 *
 * 编译时根据 nodeMetas 中每个命名子节点的 contentMode，
 * 自动生成对应的内容属性 getter/setter 描述符并挂到构造函数原型上。
 *
 * 组件实例可直接 this.title = 'Hello' 更新子节点内容，
 * 无需在 body 中手写 getter/setter。
 *
 * ══════════════════════════════════════════════════════════════
 * contentMode → 内容属性映射
 * ══════════════════════════════════════════════════════════════
 *
 * | contentMode | 生成属性     | DOM 操作              |
 * |-------------|-------------|-----------------------|
 * | html        | text        | el.innerHTML          |
 * | value       | value       | el.value              |
 * | src         | src         | el.src                |
 * | link        | text + href | el.innerHTML + el.href|
 *
 * 通用属性（cls/hidden/style 等）已由 CommonPropsAbility 的
 * setNodeXxx / addCls / removeCls 等方法统一提供，
 * 不再为每个节点自动生成属性描述符。
 *
 * 属性名规则：
 * - 内容属性直接用子节点 name（如 this.title → 更新 title 节点内容）
 * - name 与内置方法冲突时加 _ 后缀（如 this.text_ → 更新 text 节点内容）
 * - 组件子节点用 $name（如 this.$icon → 访问 icon 子组件实例）
 * - i18n 节点的内容 setter 设置 i18nKey，自动翻译后写入 DOM
 */

import type { NodeMetadata } from '../types/compiled-types';
import { capitalize } from '@/utils/string';
import { resolveI18nValue } from '@qimenjs/i18n';
import { CONTENT_MODE_MAP, RESERVED_KEYS } from '../constants/template-constants';

/** 子节点内容属性引擎，编译时根据 contentMode 自动生成内容属性 getter/setter */
export class ChildNodePropsEngine {
    /**
     * 将子节点内容属性描述符安装到组件构造函数的原型上
     *
     * 此方法会遍历所有子节点元数据，为每个命名子节点生成对应的内容属性描述符，
     * 并将其安装到组件构造函数的原型上，使组件实例可以直接通过属性访问器操作子节点内容。
     *
     * @param ctor - 组件构造函数，属性描述符将被安装到其原型上
     * @param nodeMetas - 节点元数据映射表，包含所有命名子节点的配置信息
     * @param i18nNodes - 国际化节点列表，包含需要翻译的节点名称和i18nKey
     *
     * @example
     * ```ts
     * // 在组件类装饰器中调用
     * ChildNodePropsEngine.apply(MyComponent, nodeMetas, i18nNodes);
     *
     * // 之后在组件实例中可直接使用
     * this.title = '新标题';  // 自动更新 title 子节点的 innerHTML
     * this.inputValue = '文本';  // 自动更新 input 子节点的 value
     * ```
     *
     * @remarks
     * - 如果原型上已存在同名属性，则跳过该属性
     * - root 节点不会生成属性描述符
     * - 组件子节点会生成 `$nodeName` 形式的引用属性
     */
    static apply(
        ctor: any,
        nodeMetas: Record<string, NodeMetadata>,
        i18nNodes: Array<{ name: string; field?: string; i18nKey: string }>
    ): void {
        const proto = ctor.prototype;
        const descs = ChildNodePropsEngine.buildDescs(nodeMetas, i18nNodes);

        for (const [key, desc] of Object.entries(descs)) {
            if (Object.prototype.hasOwnProperty.call(proto, key)) continue;
            Object.defineProperty(proto, key, desc);
        }
    }

    /**
     * 构建子节点内容属性描述符集合
     *
     * 根据节点元数据和国际化配置，为每个命名子节点生成对应的属性描述符。
     * 描述符包含 getter 和 setter，用于读写子节点的内容属性。
     *
     * @param nodeMetas - 节点元数据映射表，key 为节点名称，value 为节点配置
     * @param i18nNodes - 国际化节点列表，包含需要翻译的节点信息
     * @returns 属性描述符映射表，key 为属性名，value 为属性描述符
     *
     * @example
     * ```ts
     * const descs = ChildNodePropsEngine.buildDescs(nodeMetas, i18nNodes);
     * // 返回类似：
     * // {
     * //   title: { get() {...}, set(v) {...}, configurable: true, enumerable: true },
     * //   inputValue: { get() {...}, set(v) {...}, configurable: true, enumerable: true },
     * //   $icon: { get() { return this.nodeMap?.icon?.component }, ... }
     * // }
     * ```
     *
     * @remarks
     * - root 节点会被跳过
     * - 组件子节点（有 componentClass）生成 `$nodeName` 引用属性
     * - 内容属性根据 contentMode 推导：html → text, value → value, src → src, link → text + href
     */
    static buildDescs(
        nodeMetas: Record<string, NodeMetadata>,
        i18nNodes: Array<{ name: string; field?: string; i18nKey: string }>
    ): Record<string, PropertyDescriptor> {
        const descs: Record<string, PropertyDescriptor> = {};
        const i18nSet = new Set(i18nNodes.map(n => n.name));

        for (const [nodeName, meta] of Object.entries(nodeMetas)) {
            if (nodeName === 'root') continue;

            if (meta.componentClass) {
                ChildNodePropsEngine._addComponentRefDesc(descs, nodeName);
                continue;
            }

            const mode = meta.contentMode ?? 'html';
            const contentDefs = CONTENT_MODE_MAP[mode];
            const isI18n = i18nSet.has(nodeName);

            if (contentDefs) {
                for (const def of contentDefs) {
                    ChildNodePropsEngine._addContentPropDesc(descs, nodeName, def.nodeProp, isI18n);
                }
            }
        }

        return descs;
    }

    /**
     * 添加内容属性描述符
     *
     * 为单个节点添加内容属性描述符，包括属性名计算和 getter/setter 生成。
     * 根据是否为 i18n 节点，生成不同的 setter 行为。
     *
     * @param descs - 描述符集合，新描述符将被添加到此对象
     * @param nodeName - 节点名称，用于生成属性名
     * @param nodeProp - 节点属性名（如 text、value、src）
     * @param isI18n - 是否为国际化节点
     *
     * @example
     * ```ts
     * // 普通节点
     * _addContentPropDesc(descs, 'title', 'text', false);
     * // 生成: descs.title = { get() { return this._getNodeProp('title', 'text'); }, ... }
     *
     * // i18n 节点
     * _addContentPropDesc(descs, 'title', 'text', true);
     * // 生成: descs.title = { get() { return this.nodeMap?.title?.i18nKey; }, set(v) { ... } }
     * ```
     *
     * @remarks
     * - 属性名生成规则：
     *   - text/value/src：直接用节点名，冲突时加 `_` 后缀
     *   - 其他属性：节点名 + 属性名首字母大写（如 titleHref）
     * - i18n 节点的 setter 会自动翻译并更新 DOM
     */
    private static _addContentPropDesc(
        descs: Record<string, PropertyDescriptor>,
        nodeName: string,
        nodeProp: string,
        isI18n: boolean
    ): void {
        let key: string;

        if (nodeProp === 'text' || nodeProp === 'value' || nodeProp === 'src') {
            key = RESERVED_KEYS.has(nodeName) ? `${nodeName}_` : nodeName;
        } else {
            key = `${nodeName}${capitalize(nodeProp)}`;
        }

        if (descs[key]) return;

        if (isI18n) {
            descs[key] = {
                get(this: any) {
                    return this.nodeMap?.[nodeName]?.i18nKey;
                },
                set(this: any, v: any) {
                    const node = this.nodeMap?.[nodeName];
                    if (!node) return;
                    node.i18nKey = v;
                    this._markNodeDirty(nodeName, { [nodeProp]: resolveI18nValue(`i18n:${v}`) });
                },
                configurable: true,
                enumerable: true,
            };
        } else {
            descs[key] = {
                get(this: any) {
                    return this._getNodeProp(nodeName, nodeProp);
                },
                set(this: any, v: any) {
                    this._markNodeDirty(nodeName, { [nodeProp]: v });
                },
                configurable: true,
                enumerable: true,
            };
        }
    }

    /**
     * 添加组件引用属性描述符
     *
     * 为组件类型的子节点生成 `$nodeName` 形式的引用属性，
     * 用于在父组件中访问子组件实例。
     *
     * @param descs - 描述符集合，新描述符将被添加到此对象
     * @param nodeName - 子节点名称
     *
     * @example
     * ```ts
     * // 模板中定义了 icon 子组件
     * // { name: 'icon', type: IconComponent }
     *
     * _addComponentRefDesc(descs, 'icon');
     * // 生成: descs.$icon = { get() { return this.nodeMap?.icon?.component; }, ... }
     *
     * // 在组件中使用
     * this.$icon.play();  // 调用 icon 子组件的 play 方法
     * ```
     *
     * @remarks
     * - 属性名格式：`$` + 节点名
     * - 只生成 getter，不支持 setter
     * - 如果描述符已存在，则跳过
     */
    private static _addComponentRefDesc(
        descs: Record<string, PropertyDescriptor>,
        nodeName: string
    ): void {
        const key = `$${nodeName}`;

        if (descs[key]) return;

        descs[key] = {
            get(this: any) {
                return this.nodeMap?.[nodeName]?.component;
            },
            configurable: true,
            enumerable: true,
        };
    }
}
