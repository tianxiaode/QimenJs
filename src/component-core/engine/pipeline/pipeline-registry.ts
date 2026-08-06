/**
 * pipeline-registry.ts — 管线集合定义 + 执行器
 *
 * 声明式定义四个 Phase，runPhase 遍历执行步骤（支持异步）。
 * 步骤抛错时包装为 ComponentError 重新抛出。
 */

import type { Phase } from './pipeline-types';
import type { InitContext } from '../../types/init-context';
import { ensureNodeMap } from './step-ensure-node-map';
import { selfMount } from './step-self-mount';
import { onBeforeInit } from './step-on-before-init';
import { onAfterInit } from './step-on-after-init';
import { setupNodeProps } from './step-setup-node-props';
import { instantiateChildComponents } from './step-instantiate-child-components';
import { applyConfig } from './step-apply-config';
import { bindListens } from './step-bind-listens';
import { bindChildEvents } from './step-bind-child-events';
import { bindDomEvents } from './step-bind-dom-events';
import { bindPermission } from './step-bind-permission';
import { ComponentError } from '@/error';
import { KernelErrorCode } from '@/error';

/** 挂载阶段，执行节点映射构建、自身挂载、节点属性设置与初始化前钩子 */
export const MOUNT_PHASE: Phase = {
    name: 'mount',
    steps: [ensureNodeMap, selfMount, setupNodeProps, onBeforeInit],
};

/** 实例化阶段，执行子组件实例化 */
export const INSTANTIATE_PHASE: Phase = {
    name: 'instantiate',
    steps: [instantiateChildComponents],
};

/** 收尾阶段，执行 props 应用、事件绑定、权限绑定与初始化后钩子 */
export const FINALIZE_PHASE: Phase = {
    name: 'finalize',
    steps: [applyConfig, bindListens, bindChildEvents, bindDomEvents, bindPermission, onAfterInit],
};

/** 所有管线阶段，按顺序执行 mount → instantiate → finalize */
export const ALL_PHASES: Phase[] = [MOUNT_PHASE, INSTANTIATE_PHASE, FINALIZE_PHASE];

export async function runPhase(phase: Phase, ctx: InitContext): Promise<void> {
    for (const step of phase.steps) {
        const label = `${phase.name}:${step.name}`;
        try {
            await step(ctx);
            ctx.steps.push(label);
        } catch (err) {
            ctx.steps.push(`${label}(FAIL)`);
            if (err instanceof ComponentError) throw err;
            throw new ComponentError(
                `Phase "${phase.name}" step "${step.name}" failed: ${err instanceof Error ? err.message : String(err)}`,
                KernelErrorCode.PHASE_EXECUTION_FAILED,
                { phase: phase.name, step: step.name, completedSteps: ctx.steps, cause: err }
            );
        }
    }
}
