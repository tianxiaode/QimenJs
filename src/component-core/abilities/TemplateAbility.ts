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
 *
 * withTemplate 工厂方法（TemplateComponent.withTemplate）在返回强类时，
 * 通过 ComposableBase.with([TemplateAbility]) 将这些方法注入到原型上，
 * 不再在强类内部直接定义。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { NodeIndexPath, NodeTemplateMeta, NodeMetadata } from '../types';
import type { InternalEventTemplate, ExternalEventTemplate } from '../template-compiler';
import { findByPath, buildEventMapFromTemplates } from '../template-compiler';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { mergePropAliases, applyPropAliases } from './PropAlias';

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
};
