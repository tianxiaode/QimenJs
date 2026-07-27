/**
 * pipeline-types.ts — 管线类型定义
 *
 * Step: 纯函数，接收上下文，返回 void。
 * Phase: 命名步骤集合，按顺序执行。
 * StepResult: 步骤执行结果，用于控制管线流转。
 */

import type { InitContext } from '../../types/init-context';

export type InitStep = (ctx: InitContext) => void;

export interface Phase {
    name: string;
    steps: InitStep[];
}
