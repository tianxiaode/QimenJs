/**
 * 渲染注册器
 *
 * 管理渲染 Pipeline 的处理器，复用 RegistrarBase 模式。
 * 支持按渲染阶段和权重获取处理器管道。
 */

import { RegistrarBase } from '@qimenjs/registry';
import { RenderPhase, type RenderProcessor } from './RenderContext';

/**
 * 渲染注册器
 *
 * 管理渲染处理器的注册和获取
 */
export class RenderRegistrar extends RegistrarBase<Map<string, RenderProcessor>> {
    public readonly name = 'render';
    protected storage = new Map<string, RenderProcessor>();

    /**
     * 注册渲染处理器
     *
     * @param processor - 渲染处理器
     */
    register(processor: RenderProcessor): void;
    register(name: string, processor: RenderProcessor): void;
    register(nameOrProcessor: string | RenderProcessor, processor?: RenderProcessor): void {
        this.checkLock();

        const p: RenderProcessor = typeof nameOrProcessor === 'string'
            ? processor!
            : nameOrProcessor;

        this.storage.set(p.name, p);
    }

    /**
     * 注销渲染处理器
     *
     * @param name - 处理器名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
    }

    /**
     * 获取渲染处理器
     *
     * @param name - 处理器名称
     * @returns 渲染处理器
     */
    get(name: string): RenderProcessor | undefined {
        return this.storage.get(name);
    }

    /**
     * 按渲染阶段获取处理器管道
     *
     * 返回按 weight 排序的处理器列表，只包含支持指定阶段的处理器
     *
     * @param phase - 渲染阶段
     * @returns 按 weight 排序的处理器列表
     */
    getPipeline(phase: RenderPhase): RenderProcessor[] {
        const processors: RenderProcessor[] = [];

        this.storage.forEach(processor => {
            if (processor.phases.includes(phase)) {
                processors.push(processor);
            }
        });

        // 按 weight 排序
        processors.sort((a, b) => a.weight - b.weight);

        return processors;
    }

    /**
     * 获取所有已注册的处理器
     */
    getAll(): RenderProcessor[] {
        return [...this.storage.values()];
    }

    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void {
        const data: Record<string, string> = {};
        const processors = [...this.storage.values()].sort((a, b) => a.weight - b.weight);
        processors.forEach(p => {
            data[p.name] = `weight: ${p.weight}, phases: ${p.phases.join(',')}`;
        });
        console.table(data);
    }
}
