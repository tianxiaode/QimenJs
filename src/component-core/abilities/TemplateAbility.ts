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
 * - _renderChildComponents：渲染 data-json 占位节点的子组件实体
 *
 * 子组件渲染流程：
 * 1. 模板中用 data-json 声明占位节点，data-json-mode 声明挂载模式
 * 2. JSON 模式的 json 字段可直接传组件类引用，withTemplate 预编译时提取到 _jsonComponentMap
 * 3. static children 提供差异化配置（props），key 对应 data-content 的 name
 * 4. _renderChildComponents() 遍历 nodeMap 中有 componentClass 的节点，
 *    从 static children 查找对应 props，创建子组件实例
 * 5. 根据 jsonMode 替换或挂载占位节点，记录 parentNode/nodeIndex 用于后续替换
 * 6. 更新 nodeMap 中的 el、component、componentClass 字段
 * 7. 后续 bindExternalEvents 绑定到子组件实体的 el 上，事件从宿主的 eventScope 发出
 *
 * 子组件销毁：
 * - 不使用 onCleanup 注册子组件销毁（无法取消，替换时会累积）
 * - 由 TemplateComponent.dispose 统一调用 _disposeChildComponents 遍历 nodeMap 销毁
 * - 替换组件时只需更新 nodeMap 引用，旧组件手动 dispose
 *
 * 节点替换和递归销毁由 ChildSlotAbility 提供（独立能力，按需组合）
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { NodeIndexPath, NodeTemplateMeta, NodeMetadata } from '../types';
import type { InternalEventTemplate, ExternalEventTemplate } from '../template-compiler';
import { findByPath, buildEventMapFromTemplates } from '../template-compiler';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { mergePropAliases, applyPropAliases } from './PropAlias';

/**
 * 子组件差异化配置
 *
 * 在 static children 中声明，为模板占位节点对应的子组件提供差异化 props。
 * key 对应 data-content 的 name 部分，value 是传给子组件的 props。
 */
export interface ChildComponentConfig {
    /** 目标节点名（对应 data-content 的 name 部分） */
    target: string;
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

            // ── 3.5 渲染子组件（data-json 占位节点 → 组件实体） ──
            this._renderChildComponents(cfg.children);

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
        const jsonComponentMap: Record<string, new (props?: Record<string, any>) => any> = ctor._jsonComponentMap || {};

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

            // 如果有组件类映射，填充 componentClass
            if (meta.jsonRef && jsonComponentMap[meta.name]) {
                node.componentClass = jsonComponentMap[meta.name];
            }

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
     * 遍历 nodeMap 中有 componentClass 的节点（即 data-json 声明的占位节点），
     * 从 static children 查找差异化 props，创建子组件实例，
     * 根据 jsonMode 替换或挂载占位节点，记录 DOM 位置索引，
     * 并更新 nodeMap 中的 el、component、componentClass 字段。
     *
     * 注意：不使用 onCleanup 注册子组件销毁，避免替换时回调累积。
     * 子组件销毁由 _disposeChildComponents 统一处理。
     *
     * @param children - 子组件差异化配置（static children），可选
     */
    _renderChildComponents(children?: ChildComponentConfig[]): void {
        // 构建 target → props 的快速查找表
        const propsMap: Record<string, Record<string, any>> = {};
        if (children) {
            for (const cfg of children) {
                propsMap[cfg.target] = cfg.props || {};
            }
        }

        for (const group of Object.values(this.nodeMap) as Record<string, NodeMetadata>[]) {
            for (const node of Object.values(group) as NodeMetadata[]) {
                if (!node.componentClass) continue;

                const ComponentClass = node.componentClass;
                const childProps = propsMap[node.name];

                // 创建子组件实例（withTemplate 强类，new 即完整实例）
                const child = new ComponentClass(childProps);

                // 设置父引用
                (child as any).parent = this;

                // 根据 jsonMode 挂载，并记录 DOM 位置索引
                const jsonMode = node.jsonMode ?? 'replace';
                if (jsonMode === 'replace') {
                    // replace 模式：记录位置索引，用于后续替换
                    const parentEl = node.el.parentElement;
                    if (parentEl) {
                        node.parentNode = parentEl;
                        node.nodeIndex = Array.from(parentEl.childNodes).indexOf(node.el);
                    }
                    // 子组件 el 替换占位节点
                    node.el.replaceWith(child.el);
                } else {
                    // child 模式：子组件 el 挂载到占位节点内，位置固定
                    node.parentNode = null;
                    node.el.appendChild(child.el);
                }

                // 更新 nodeMap：el 指向子组件实体的 el，component 存实例引用
                node.el = child.el;
                node.component = child;
            }
        }
    },

    /**
     * 遍历 nodeMap 递归销毁子组件
     *
     * 在 TemplateComponent.dispose 中调用，
     * 确保所有 nodeMap 中的子组件被正确清理。
     * 子组件的 dispose 会递归销毁其自身的 nodeMap 子组件。
     *
     * 不使用 onCleanup 注册，避免替换组件时回调累积无法取消。
     */
    _disposeChildComponents(): void {
        for (const group of Object.values(this.nodeMap) as Record<string, NodeMetadata>[]) {
            for (const node of Object.values(group) as NodeMetadata[]) {
                if (node.component && typeof node.component.dispose === 'function') {
                    node.component.dispose();
                    node.component = null;
                }
            }
        }
    },
};
