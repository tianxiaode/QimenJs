/**
 * withTemplate.ts — 模板预编译工厂
 *
 * 从 TemplateComponent.ts 拆出的 withTemplate 静态工厂方法。
 *
 * 职责：
 * - 类定义时预编译：提取节点数据、生成内容属性、预编译事件模板
 * - 返回带模板的强类，实例化时纯克隆
 */

import type { NodeIndexPath, NodeTemplateMeta, EventMap, InternalEventBinding, NodeMetadata } from './types';
import { precompileTemplate, findByPath, buildEventMapFromTemplates } from './template-compiler';
import type { InternalEventTemplate, ExternalEventTemplate } from './template-compiler';
import { buildContentProperties, translateI18nKey, applyValueToEl } from './content-properties';
import { ComponentManager } from './ComponentManager';
import { mergePropAliases, applyPropAliases } from './abilities/PropAlias';
import { I18N_PREFIX } from '@qimenjs/i18n';

/**
 * 模板预编译工厂方法 — 基础组件路径
 *
 * 接收 HTML 模板字符串，在类定义时预编译提取节点数据，
 * 生成带内容属性和事件模板的强类返回。
 *
 * 模板替换：在已有强类上再次调用 withTemplate，
 * 新类继承旧类的自定义方法（如 onClick），但使用新模板。
 *
 * @param templateHtml - HTML 模板字符串
 * @returns 模板组件强类
 */
export function withTemplate(this: any, templateHtml: string): any {
    // 预编译：创建临时 DOM 解析模板，提取节点数据
    const compiled = precompileTemplate(templateHtml, this.isMultiArea ?? false);

    // 创建模板组件强类
    const TemplateClass = class extends this {
        constructor(props?: Record<string, any>) {
            super(props);

            // withTemplate 强类：构造时自动完成全部初始化
            this._initWithTemplate(props);
        }

        /** 预编译的模板 HTML */
        static readonly _templateHtml: string = templateHtml;

        /** 预编译的节点索引路径 */
        static readonly _indexPath: NodeIndexPath = compiled.indexPath;

        /** 预编译的模板元数据 */
        static readonly _templateMetas: Record<string, NodeTemplateMeta> = compiled.templateMetas;

        /** 预编译的内部事件模板（不含 node 引用） */
        static readonly _internalEventTemplates: InternalEventTemplate[] = compiled.internalEventTemplates;

        /** 预编译的外部事件模板（不含 node 引用） */
        static readonly _externalEventTemplates: ExternalEventTemplate[] = compiled.externalEventTemplates;

        /** 预编译的内容属性名列表 */
        static readonly _contentPropNames: string[] = compiled.contentPropNames;

        /** 模板元素缓存（类级别共享） */
        static _templateCache: HTMLTemplateElement | null = null;

        /**
         * 获取模板缓存，首次调用时创建
         */
        static _getTemplateCache(): HTMLTemplateElement {
            if (!this._templateCache) {
                const tpl = document.createElement('template');
                tpl.innerHTML = this._templateHtml;
                this._templateCache = tpl;
            }
            return this._templateCache;
        }

        /**
         * 克隆模板 DocumentFragment
         */
        static _cloneFragment(): DocumentFragment {
            return this._getTemplateCache().content.cloneNode(true) as DocumentFragment;
        }

        /**
         * 创建新实例（克隆方式）
         */
        static create(props?: Record<string, any>): any {
            const instance = new (this as any)(props);
            return instance;
        }

        // ── withTemplate 自动初始化 ──

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

                // ── 6. 注册到 ComponentManager ──
                if (props?.id) this.id = props.id;
                ComponentManager.getInstance().register(this as any);
            } finally {
                this._initializing = false;
                this.flush();
            }
        }

        // ── 覆写 initElement：纯克隆流程，不依赖 TemplateRegistrar ──

        /**
         * 创建根 DOM 元素 + 克隆预编译模板 + 构建 nodeMap
         */
        _initElementFromTemplate(): void {
            this.el = document.createElement(this.tag);

            const ctor = this.constructor as any;
            const fragment = ctor._cloneFragment();
            this.el.appendChild(fragment);
            this._buildNodeMapFromCompiled();
        }

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
        }
    };

    // 在强类原型上生成内容 getter/setter（只做一次）
    buildContentProperties(TemplateClass, compiled.templateMetas, this.isMultiArea ?? false);

    return TemplateClass;
}
