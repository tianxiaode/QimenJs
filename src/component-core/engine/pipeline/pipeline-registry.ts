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
import { bindListens } from './step-bind-listens';
import { bindChildEvents } from './step-bind-child-events';
import { bindDomEvents } from './step-bind-dom-events';
import { ComponentError } from '@/error';
import { KernelErrorCode } from '@/error/codes';

export const MOUNT_PHASE: Phase = {
    name: 'mount',
    steps: [ensureNodeMap, selfMount, setupNodeProps, onBeforeInit],
};

export const INSTANTIATE_PHASE: Phase = {
    name: 'instantiate',
    steps: [instantiateChildComponents],
};

export const FINALIZE_PHASE: Phase = {
    name: 'finalize',
    steps: [bindListens, bindChildEvents, bindDomEvents, onAfterInit],
};

export const ALL_PHASES: Phase[] = [MOUNT_PHASE, INSTANTIATE_PHASE, FINALIZE_PHASE];

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
