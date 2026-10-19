import type { TemplateDecl } from '@qimenjs/component-core';

/** 容器 item 定义：HTML 字符串 | 模板 | 组件类 | 组件配置对象 */
export type ContainerItemDef =
    | string
    | TemplateDecl
    | (new (...args: any[]) => any)
    | Record<string, any>;

/** 纯 DOM item 的轻量包装（不走组件初始化链，同步渲染） */
export interface ContainerItemWrapper {
    el: HTMLElement;
    order: number;
    name?: string;
    action?: string;
    type?: string;
    dispose?: () => void;
}

export type ContainerItem = ContainerItemWrapper | any;
