/**
 * 渲染上下文与渲染相关类型定义
 *
 * RenderContext 贯穿整个渲染流程，所有 Pipeline 步骤共享同一个上下文对象。
 */

import type { LayoutNode } from '@qimenjs/layout';
import type { ComponentBase } from '../component/ComponentBase';
import type { Schema } from '@qimenjs/schema';

/**
 * 渲染阶段枚举
 */
export enum RenderPhase {
    /** 初始化渲染 */
    INIT = 'init',
    /** 更新渲染 */
    UPDATE = 'update',
    /** 销毁渲染 */
    DESTROY = 'destroy',
}

/**
 * 渲染处理器权重常量
 *
 * 权重值决定处理器执行顺序，值越小越先执行
 */
export const RenderWeight = {
    CREATE: 100,
    TEMPLATE: 200,
    INJECT: 300,
    BIND_SCHEMA: 400,
    BIND_HANDLER: 500,
    BIND_DATASOURCE: 600,
    BIND_ENTITY_HOOKS: 650,
    BIND_CHILDREN: 700,
    BIND_SLOTS: 800,
    BIND_REPEAT: 900,
    BIND_I18N: 950,
    MOUNT: 1000,
} as const;

/**
 * 渲染处理器接口
 */
export interface RenderProcessor {
    /** 处理器名称 */
    name: string;
    /** 执行权重（值越小越先执行） */
    weight: number;
    /** 适用的渲染阶段 */
    phases: RenderPhase[];
    /** 处理器描述 */
    description?: string;
    /** 执行处理 */
    execute(ctx: RenderContext): Promise<void>;
}

/**
 * IDataSource 接口
 *
 * VirtualListAbility 的内部数据协议，仅服务于 getRange 按需取数据需求
 */
export interface IDataSource {
    /** 总记录数 */
    total: number;
    /** 当前数据 */
    data: any[];
    /** 按范围获取数据 */
    getRange(start: number, count: number): any[];
    /** 刷新数据 */
    refresh(): Promise<void>;
    /** 数据变更通知（可选，优先走 stateTriggers） */
    onDataChange?(handler: () => void): () => void;
}

/**
 * 翻译绑定
 *
 * Renderer 维护的翻译绑定表条目，语言切换时自动更新对应组件属性
 */
export interface TranslationBinding {
    /** 绑定的组件实例（WeakRef 防止阻止 GC） */
    component: WeakRef<ComponentBase>;
    /** 绑定的组件属性名 */
    prop: string;
    /** 翻译 key */
    key: string;
    /** 翻译参数 */
    params?: Record<string, any>;
}

/**
 * 渲染上下文
 *
 * 贯穿整个渲染流程，所有 Pipeline 步骤共享同一个上下文对象
 */
export interface RenderContext {
    /** 渲染阶段 */
    phase: RenderPhase;

    /** 当前 Layout 节点 */
    node: LayoutNode;

    /** Schema 实例 */
    schema?: Schema;

    /** 数据源映射 */
    dataSources?: Record<string, IDataSource>;

    /** 事件处理器映射 */
    handlers: Record<string, Function>;

    /** 父组件 */
    parent?: ComponentBase;

    /** 目标容器 */
    container?: HTMLElement | string;

    // ---- 以下由 Pipeline 步骤填充 ----

    /** 创建的组件实例 */
    component?: ComponentBase;

    /** 克隆的 DOM 片段 */
    fragment?: DocumentFragment;

    /** 渲染的子组件列表 */
    childComponents?: ComponentBase[];

    /** 翻译绑定表 */
    translationBindings?: TranslationBinding[];
}

/**
 * 创建渲染上下文
 *
 * @param options - 上下文选项
 * @returns 完整的渲染上下文
 */
export function createRenderContext(options: Partial<RenderContext> & { node: LayoutNode }): RenderContext {
    return {
        phase: options.phase ?? RenderPhase.INIT,
        node: options.node,
        schema: options.schema,
        dataSources: options.dataSources,
        handlers: options.handlers ?? {},
        parent: options.parent,
        container: options.container,
        component: options.component,
        fragment: options.fragment,
        childComponents: options.childComponents ?? [],
        translationBindings: options.translationBindings ?? [],
    };
}
