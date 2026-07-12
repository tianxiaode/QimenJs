/**
 * TemplateAbility — 模板组件能力
 *
 * 将 withTemplate 的实例方法提取为能力定义，
 * 通过 ComposableBase.with() 合并到原型上。
 *
 * 职责：
 * - _initWithTemplate：withTemplate 强类自动初始化
 * - _initElementFromTemplate：创建 el + 克隆模板 + buildNodeMap
 * - _buildNodeMapFromCompiled：从预编译数据构建 nodeMap + eventMap
 * - _renderChildComponents：渲染 static children 声明的子组件实体
 *
 * withTemplate 工厂方法（TemplateComponent.withTemplate）在返回强类时，
 * 通过 ComposableBase.with([TemplateAbility]) 将这些方法注入到原型上，
 * 不再在强类内部直接定义。
 *
 * 子组件渲染流程：
 * 1. 模板中用 data-json 声明占位节点，data-json-mode 声明挂载模式
 * 2. static children 声明子组件配置（target 对应 data-content 的 name，component 为强类引用）
 * 3. _renderChildComponents() 遍历 children，创建子组件实例
 * 4. 根据 jsonMode 替换或挂载占位节点，更新 nodeMap 中的 el 引用
 * 5. 后续 bindExternalEvents 绑定到子组件实体的 el 上，事件从宿主的 eventScope 发出
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { NodeIndexPath, NodeTemplateMeta, NodeMetadata } from '../types';
import type { InternalEventTemplate, ExternalEventTemplate } from '../template-compiler';
import { findByPath, buildEventMapFromTemplates } from '../template-compiler';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { mergePropAliases, applyPropAliases } from './PropAlias';

/**
 * 子组件配置
 *
 * 在 static children 中声明，描述模板占位节点对应的子组件。
 * target 对应 data-content 的 name 部分，component 是 withTemplate 生成的强类引用。
 */
export interface ChildComponentConfig {
    /** 目标节点名（对应 data-content 的 name 部分） */
    target: string;
    /** 子组件强类（withTemplate 生成的完整类） */
    component: new (props?: Record<string, any>) => any;
    /** 传递给子组件的 props */
    props?: Record<string, any>;
}

export const TemplateAbility: AbilityDefinition = {
    /**
     * withTemplate 强类自动初始化
     *
     * 构造时自动完成：内容填充、事件绑定、能力初始化、注册。
     *
     * 配置来源（优先级从低到高）：
     * 1. static 属性（children、bridges 等）— 类定义时确定
     * 2. props 参数 — 实例化时传入，可覆盖 static
     */
    _initWithTemplate(props?: Record<string, any>): void {
        this._initializing = true;

        // 合并配置：static 属性为基础，props 可覆盖
        const ctor = this.constructor as any;
        const cfg: Record<string, any> = {
            children: ctor.children ? [...ctor.children] : undefined,
            bridges: ctor.bridges ? [...ctor.bridges] : undefined,
            abilities: ctor.abilities,
            entity: ctor.entity,
            eventBridge: ctor.eventBridge,
            meta: ctor.meta,
            ...props,
        };

        try {
            // ── 1. 创建 el + 克隆模板 + buildNodeMap ──
            this._initElementFromTemplate();

            // ── 2. 配置初始化（abilities、extraFns、entity、eventBridge、meta） ──
            if (cfg.abilities) this.setupAbilities(cfg.abilities);
            if (cfg.extraFns) {
                for (const [key, fn] of Object.entries(cfg.extraFns)) {
                    Object.defineProperty(this, key, {
                        value: (fn as Function).bind(this),
                        writable: true, configurable: true, enumerable: true,
                    });
                }
            }
            if (cfg.entity) {
                const manager = new cfg.entity();
                this.mgr = manager;
                this.onCleanup(() => manager.dispose());
            }
            if (cfg.eventBridge) {
                this.setEventBridge(cfg.eventBridge);
                queueMicrotask(() => {
                    if (typeof this.initEventBridge === 'function') this.initEventBridge();
                });
            }
            if (cfg.meta) this.meta = { ...cfg.meta };

            // ── 3. 内容填充 + i18n ──
            this.initContentFromProps(cfg);
            if (ctor.abilities) {
                const aliasMap = mergePropAliases(ctor.abilities);
                if (Object.keys(aliasMap).length > 0) {
                    applyPropAliases(this, cfg, aliasMap);
                }
            }
            this.initI18nFromTemplate();
            this.setupI18nListener();

            // ── 3.5 渲染子组件（替换/挂载占位节点，更新 nodeMap el 引用） ──
            if (cfg.children) {
                this._renderChildComponents(cfg.children);
            }

            // ── 4. 事件绑定 ──
            this.bindInternalEvents();
            this.bindExternalEvents({ bridges: cfg.bridges } as any);
            if (cfg.stateTriggers) this.bindStateTriggers(cfg.stateTriggers);

            // ── 5. 调用能力的 __init__ 方法 ──
            this.callInitMethods();

            // ── 6. 注册到 ComponentRegistrar ──
            if (props?.id) this.id = props.id;
            ComponentRegistrar.getInstance().registerInstance(this as any);
        } finally {
            this._initializing = false;
            this.flush();
        }
    },

    /**
     * 创建根 DOM 元素 + 克隆预编译模板 + 构建 nodeMap
     */
    _initElementFromTemplate(): void {
        this.el = document.createElement(this.tag);

        const ctor = this.constructor as any;
        const fragment = ctor._cloneFragment();
        this.el.appendChild(fragment);
        this._buildNodeMapFromCompiled();
    },

    /**
     * 从预编译数据构建 nodeMap + eventMap
     */
    _buildNodeMapFromCompiled(): void {
        const ctor = this.constructor as any;
        const indexPath: NodeIndexPath = ctor._indexPath;
        const templateMetas: Record<string, NodeTemplateMeta> = ctor._templateMetas;

        // 构建 nodeMap
        for (const [key, path] of Object.entries(indexPath)) {
            const meta = templateMetas[key];
            if (!meta) continue;

            const el = findByPath(this.el, path);
            if (!el) continue;

            const node: NodeMetadata = {
                el, raw: meta.raw, group: meta.group, name: meta.name,
                delegateTarget: meta.delegateTarget, jsonRef: meta.jsonRef,
                jsonMode: meta.jsonMode, templateRef: meta.templateRef,
                i18nKey: meta.i18nKey,
            };

            if (!this.nodeMap[meta.group]) this.nodeMap[meta.group] = {};
            this.nodeMap[meta.group][meta.name] = node;
        }

        // 用预编译模板构建 eventMap（只填 node 引用，不重复推导）
        const internalTemplates: InternalEventTemplate[] = ctor._internalEventTemplates;
        const externalTemplates: ExternalEventTemplate[] = ctor._externalEventTemplates;
        this.eventMap = buildEventMapFromTemplates(internalTemplates, externalTemplates, this.nodeMap);
    },

    /**
     * 渲染子组件实体
     *
     * 遍历 static children 配置，在 nodeMap 中查找对应的占位节点，
     * 创建子组件实例，根据 jsonMode 替换或挂载占位节点，
     * 并更新 nodeMap 中的 el 引用为子组件实体的 el。
     *
     * 这样后续 bindExternalEvents 绑定到子组件实体的 el 上，
     * 事件从宿主的 eventScope 发出，source 是宿主的 eventKey。
     *
     * @param children - 子组件配置数组
     */
    _renderChildComponents(children: ChildComponentConfig[]): void {
        for (const childConfig of children) {
            const { target, component: ComponentClass, props: childProps } = childConfig;

            // 在 nodeMap 中查找目标节点（遍历所有 group 查找匹配 name 的节点）
            let node: NodeMetadata | undefined;
            for (const group of Object.values(this.nodeMap) as Record<string, NodeMetadata>[]) {
                if (group[target]) {
                    node = group[target];
                    break;
                }
            }

            if (!node) {
                console.warn(`TemplateAbility._renderChildComponents: target "${target}" not found in nodeMap`);
                continue;
            }

            // 创建子组件实例（withTemplate 强类，new 即完整实例）
            const child = new ComponentClass(childProps);

            // 设置父引用
            (child as any).parent = this;

            // 根据 jsonMode 挂载
            const jsonMode = node.jsonMode ?? 'replace';
            if (jsonMode === 'replace') {
                // replace 模式：子组件 el 替换占位节点
                node.el.replaceWith(child.el);
            } else {
                // child 模式：子组件 el 挂载到占位节点内
                node.el.appendChild(child.el);
            }

            // 更新 nodeMap 中的 el 引用为子组件实体的 el
            node.el = child.el;

            // 宿主销毁时自动销毁子组件
            this.onCleanup(() => child.dispose());
        }
    },
};
