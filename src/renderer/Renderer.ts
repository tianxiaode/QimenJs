/**
 * 渲染器
 *
 * 负责将 Layout 定义渲染为 DOM 组件。
 * 内部通过 RenderRegistrar 获取处理器管道，通过 Pipeline 执行渲染流程。
 *
 * @example
 * ```typescript
 * const renderer = Renderer.getInstance();
 * const result = await renderer.render(layout, { container: '#app' });
 * ```
 */

import type { LayoutNode } from '@qimenjs/layout';
import { pipeline, type PipelineResult, type Processor } from '@qimenjs/pipeline';
import {
    RenderPhase,
    RenderContext,
    createRenderContext,
    type RenderProcessor,
} from './RenderContext';
import { RenderRegistrar } from './RenderRegistrar';

// 导入内置处理器
import { createProcessor } from './processors/create';
import { templateProcessor } from './processors/template';
import { injectProcessor } from './processors/inject';
import { bindSchemaProcessor } from './processors/bind-schema';
import { bindHandlerProcessor } from './processors/bind-handler';
import { bindDatasourceProcessor } from './processors/bind-datasource';
import { bindEntityHooksProcessor } from './processors/bind-entity-hooks';
import { bindChildrenProcessor } from './processors/bind-children';
import { bindSlotsProcessor } from './processors/bind-slots';
import { bindRepeatProcessor } from './processors/bind-repeat';
import { bindI18nProcessor } from './processors/bind-i18n';
import { mountProcessor } from './processors/mount';

/**
 * 内置处理器列表
 */
const BUILTIN_PROCESSORS: RenderProcessor[] = [
    createProcessor,
    templateProcessor,
    injectProcessor,
    bindSchemaProcessor,
    bindHandlerProcessor,
    bindDatasourceProcessor,
    bindEntityHooksProcessor,
    bindChildrenProcessor,
    bindSlotsProcessor,
    bindRepeatProcessor,
    bindI18nProcessor,
    mountProcessor,
];

/**
 * 渲染器
 *
 * 单例模式，提供 render/update/destroy/renderChildren 方法
 */
export class Renderer {
    private static instance: Renderer;

    /** 渲染注册器 */
    private readonly registrar: RenderRegistrar;

    /** 是否已注册内置处理器 */
    private initialized = false;

    private constructor() {
        this.registrar = RenderRegistrar.getInstance();
    }

    /**
     * 获取单例实例
     */
    static getInstance(): Renderer {
        if (!Renderer.instance) {
            Renderer.instance = new Renderer();
        }
        return Renderer.instance;
    }

    /**
     * 初始化内置处理器
     */
    private ensureInitialized(): void {
        if (this.initialized) return;

        for (const processor of BUILTIN_PROCESSORS) {
            this.registrar.register(processor);
        }

        this.initialized = true;
    }

    /**
     * 渲染 Layout 节点
     *
     * @param node - Layout 节点定义
     * @param context - 可选的渲染上下文
     * @returns 渲染结果
     */
    async render(
        node: LayoutNode,
        context?: Partial<RenderContext>
    ): Promise<PipelineResult<RenderContext>> {
        this.ensureInitialized();

        const ctx = createRenderContext({
            ...context,
            node,
            phase: RenderPhase.INIT,
        });

        return this.renderNode(ctx);
    }

    /**
     * 渲染节点（内部方法，供处理器和 Renderer 共用）
     *
     * @param ctx - 渲染上下文
     * @returns 渲染结果
     */
    async renderNode(ctx: RenderContext): Promise<PipelineResult<RenderContext>> {
        const renderProcessors = this.registrar.getPipeline(ctx.phase);

        // 将 RenderProcessor 适配为 Pipeline 的 Processor
        const processors: Processor<RenderContext>[] = renderProcessors.map(rp => ({
            name: rp.name,
            weight: rp.weight,
            description: rp.description,
            execute: (context: RenderContext) => rp.execute(context),
        }));

        // 使用 Pipeline 执行处理器
        const result = await pipeline.execute(ctx, processors, {
            pipelineName: 'Renderer',
        });

        return result;
    }

    /**
     * 更新已渲染组件
     *
     * @param component - 组件实例
     * @param node - 新的 Layout 节点定义
     * @param context - 可选的渲染上下文
     * @returns 渲染结果
     */
    async update(
        component: any,
        node: LayoutNode,
        context?: Partial<RenderContext>
    ): Promise<PipelineResult<RenderContext>> {
        this.ensureInitialized();

        const ctx = createRenderContext({
            ...context,
            node,
            phase: RenderPhase.UPDATE,
            component,
        });

        return this.renderNode(ctx);
    }

    /**
     * 销毁组件
     *
     * @param component - 组件实例
     * @returns 渲染结果
     */
    async destroy(component: any): Promise<PipelineResult<RenderContext>> {
        this.ensureInitialized();

        const ctx = createRenderContext({
            node: { type: component.type || 'unknown' },
            phase: RenderPhase.DESTROY,
            component,
        });

        // 执行销毁阶段处理器
        const renderProcessors = this.registrar.getPipeline(RenderPhase.DESTROY);
        const processors: Processor<RenderContext>[] = renderProcessors.map(rp => ({
            name: rp.name,
            weight: rp.weight,
            description: rp.description,
            execute: (context: RenderContext) => rp.execute(context),
        }));

        const result = await pipeline.execute(ctx, processors, {
            pipelineName: 'Renderer-destroy',
        });

        // 调用组件的 dispose 方法
        if (component && typeof component.dispose === 'function') {
            component.dispose();
        }

        return result;
    }

    /**
     * 递归渲染子节点
     *
     * @param nodes - Layout 节点数组
     * @param context - 渲染上下文
     * @returns 组件实例数组
     */
    async renderChildren(
        nodes: LayoutNode[],
        context: Partial<RenderContext>
    ): Promise<any[]> {
        const children: any[] = [];

        for (const node of nodes) {
            const result = await this.render(node, context);
            if (result.context?.component) {
                children.push(result.context.component);
            }
        }

        return children;
    }

    /**
     * 注册自定义渲染处理器
     *
     * @param processor - 渲染处理器
     */
    registerProcessor(processor: RenderProcessor): void {
        this.registrar.register(processor);
    }
}
