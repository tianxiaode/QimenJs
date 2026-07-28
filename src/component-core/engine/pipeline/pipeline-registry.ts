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
import { onInitState } from './step-on-init-state';
import { onBeforeInit } from './step-on-before-init';
import { onAfterInit } from './step-on-after-init';
import { setupNodeProps } from './step-setup-node-props';
import { instantiateChildComponents } from './step-instantiate-child-components';
import { bindDelegatedEvents } from './step-bind-delegated-events';
import { ComponentError } from '@/error';
import { KernelErrorCode } from '@/error/codes';

export const MOUNT_PHASE: Phase = {
    name: 'mount',
    steps: [ensureNodeMap, selfMount, setupNodeProps, onInitState, onBeforeInit],
};

export const FILL_PHASE: Phase = {
    name: 'fill',
    steps: [],
};

export const INSTANTIATE_PHASE: Phase = {
    name: 'instantiate',
    steps: [instantiateChildComponents],
};

export const FINALIZE_PHASE: Phase = {
    name: 'finalize',
    steps: [bindDelegatedEvents, onAfterInit],
};

export const ALL_PHASES: Phase[] = [MOUNT_PHASE, FILL_PHASE, INSTANTIATE_PHASE, FINALIZE_PHASE];

export async function runPhase(phase: Phase, ctx: InitContext): Promise<void> {
    for (const step of phase.steps) {
        try {
            await step(ctx);
        } catch (err) {
            if (err instanceof ComponentError) throw err;
            throw new ComponentError(
                `Phase "${phase.name}" step "${step.name}" failed: ${err instanceof Error ? err.message : String(err)}`,
                KernelErrorCode.PHASE_EXECUTION_FAILED,
                { phase: phase.name, step: step.name, cause: err }
            );
        }
    }
}
