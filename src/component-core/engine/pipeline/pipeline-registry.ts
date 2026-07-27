/**
 * pipeline-registry.ts — 管线集合定义 + 执行器
 *
 * 声明式定义四个 Phase，runPhase 遍历执行步骤。
 * 步骤抛错时包装为 ComponentError 重新抛出。
 */

import type { Phase } from './pipeline-types';
import type { InitContext } from '../../types/init-context';
import { ensureNodeMap } from './step-ensure-node-map';
import { onInitState, onBeforeInit, onAfterInit } from './step-override-queue';
import { setupNodeProps } from './step-setup-node-props';
import { ComponentError } from '@/error';
import { KernelErrorCode } from '@/error/codes';

export const MOUNT_PHASE: Phase = {
    name: 'mount',
    steps: [ensureNodeMap, setupNodeProps, onInitState, onBeforeInit],
};

export const FILL_PHASE: Phase = {
    name: 'fill',
    steps: [],
};

export const INSTANTIATE_PHASE: Phase = {
    name: 'instantiate',
    steps: [],
};

export const FINALIZE_PHASE: Phase = {
    name: 'finalize',
    steps: [onAfterInit],
};

export const ALL_PHASES: Phase[] = [MOUNT_PHASE, FILL_PHASE, INSTANTIATE_PHASE, FINALIZE_PHASE];

export function runPhase(phase: Phase, ctx: InitContext): void {
    for (const step of phase.steps) {
        try {
            step(ctx);
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
