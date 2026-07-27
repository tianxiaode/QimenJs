/**
 * pipeline-types.ts — 管线类型定义
 *
 * Step: 纯函数，接收上下文，支持同步/异步返回。
 * Phase: 命名步骤集合，按顺序执行。
 */

import type { InitContext } from '../../types/init-context';

export type InitStep = (ctx: InitContext) => void | Promise<void>;

export interface Phase {
    name: string;
    steps: InitStep[];
}
