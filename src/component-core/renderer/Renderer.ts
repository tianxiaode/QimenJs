/**
 * Renderer — 渲染流程
 *
 * 使用 ComponentBase.initialize() 统一初始化组件，
 * Renderer 只负责：创建实例、调用 initialize、挂载 DOM、递归渲染。
 *
 * 流程：
 * 1. 创建实例
 * 2. component.initialize(layout) — 统一初始化（配置/内容/事件/生命周期）
 * 3. 条件/循环/响应式
 * 4. 挂载 DOM
 * 5. 递归渲染 children + data-json 子组件
 */

import type { LayoutNode } from '../../layout/LayoutNode';
import type { ComposableBase } from '../ComposableBase';
import { ComponentBase } from '../ComponentBase';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { TemplateRegistrar } from '@qimenjs/template';

/** 渲染器配置 */
export interface RendererConfig {
    componentRegistrar: ComponentRegistrar;
    templateRegistrar: TemplateRegistrar;
}

export class Renderer {
    private componentRegistrar: ComponentRegistrar;
    private templateRegistrar: TemplateRegistrar;

    constructor(config: RendererConfig) {
        this.componentRegistrar = config.componentRegistrar;
        this.templateRegistrar = config.templateRegistrar;
    }

    /**
     * 渲染入口
     */
    render(layout: LayoutNode, parentEl?: HTMLElement): ComposableBase {
        // ── 1. 创建实例 ──
        const component = this.createInstance(layout);

        // ── 2. 统一初始化（配置/内容/事件/生命周期） ──
        if (component instanceof ComponentBase) {
            component.initialize(layout);
        }

        // ── 3. 条件/循环/响应式 ──
        this.applyConditional(component, layout);

        // ── 4. 挂载 DOM ──
        if (parentEl && component.el) {
            parentEl.appendChild(component.el);
        }

        // ── 5. 递归渲染 children ──
        if (layout.children) {
            for (const child of layout.children) {
                this.render(child, component.el);
            }
        }

        // ── 5b. 渲染 data-json 子组件 ──
        if (component instanceof ComponentBase) {
            this.renderJsonSlots(component);
        }

        return component;
    }

    // ─── 创建实例 ──────────────────────────────────────

    private createInstance(layout: LayoutNode): ComposableBase {
        const ComponentClass = this.componentRegistrar.get(layout.type);
        if (!ComponentClass) {
            throw new Error(`Component type "${layout.type}" not registered`);
        }

        return new ComponentClass();
    }

    // ─── 条件/循环/响应式 ──────────────────────────────

    private applyConditional(component: ComposableBase, layout: LayoutNode): void {
        // visible
        if (layout.visible !== undefined) {
            if (typeof layout.visible === 'boolean') {
                if (!layout.visible && typeof (component as any).hide === 'function') {
                    (component as any).hide();
                }
            }
            // string 表达式 — TODO: 运行时求值
        }

        // repeat — TODO: 循环渲染
        // responsive — TODO: 响应式配置
    }

    // ─── 渲染 data-json 子组件 ──────────────────────────

    /**
     * 扫描 nodeMap 中有 jsonRef 的节点，从注册表取 JSON 定义，递归渲染子组件
     */
    private renderJsonSlots(component: ComponentBase): void {
        for (const [, entries] of Object.entries(component.nodeMap)) {
            for (const [, node] of Object.entries(entries)) {
                if (!node.jsonRef) continue;

                let layout: LayoutNode;
                try {
                    layout = this.templateRegistrar.getJson(node.jsonRef);
                } catch {
                    console.warn(`Renderer: JSON definition "${node.jsonRef}" not found, skipping`);
                    continue;
                }

                const childComponent = this.render(layout);

                if (node.jsonMode === 'child') {
                    node.el.appendChild(childComponent.el);
                } else {
                    const parent = node.el.parentNode;
                    if (parent) {
                        parent.replaceChild(childComponent.el, node.el);
                        node.el = childComponent.el as HTMLElement;
                    }
                }
            }
        }
    }
}
