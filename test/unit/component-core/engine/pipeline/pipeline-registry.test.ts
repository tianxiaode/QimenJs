jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

import {
    MOUNT_PHASE,
    INSTANTIATE_PHASE,
    FINALIZE_PHASE,
    ALL_PHASES,
    runPhase,
} from '@/component-core/engine/pipeline/pipeline-registry';
import { ComponentError } from '@/error';
import { KernelErrorCode } from '@/error/codes';
import type { Phase } from '@/component-core/engine/pipeline/pipeline-types';

describe('pipeline-registry', () => {
    describe('Phase 定义', () => {
        it('MOUNT_PHASE 包含正确步骤', () => {
            expect(MOUNT_PHASE.name).toBe('mount');
            expect(MOUNT_PHASE.steps.length).toBeGreaterThan(0);
        });

        it('INSTANTIATE_PHASE 包含子组件实例化步骤', () => {
            expect(INSTANTIATE_PHASE.name).toBe('instantiate');
            expect(INSTANTIATE_PHASE.steps.length).toBeGreaterThan(0);
        });

        it('FINALIZE_PHASE 包含收尾步骤', () => {
            expect(FINALIZE_PHASE.name).toBe('finalize');
            expect(FINALIZE_PHASE.steps.length).toBeGreaterThan(0);
            expect(FINALIZE_PHASE.steps[0].name).toBe('applyConfig');
        });

        it('ALL_PHASES 包含三个阶段', () => {
            expect(ALL_PHASES).toHaveLength(3);
        });
    });

    describe('runPhase', () => {
        it('正常执行所有步骤', async () => {
            const step1 = jest.fn().mockResolvedValue(undefined);
            const step2 = jest.fn().mockResolvedValue(undefined);
            const phase: Phase = { name: 'test', steps: [step1, step2] };
            const ctx = {
                instance: {},
                props: {},
                ctor: {},
                nodeMapMgr: null,
                debug: false,
                steps: [],
            };
            await runPhase(phase, ctx as any);
            expect(step1).toHaveBeenCalledWith(ctx);
            expect(step2).toHaveBeenCalledWith(ctx);
        });

        it('步骤抛出 ComponentError 时直接抛出', async () => {
            const originalError = new ComponentError(
                'test error',
                KernelErrorCode.PHASE_EXECUTION_FAILED,
                {}
            );
            const step1 = jest.fn().mockRejectedValue(originalError);
            const phase: Phase = { name: 'test', steps: [step1] };
            const ctx = {
                instance: {},
                props: {},
                ctor: {},
                nodeMapMgr: null,
                debug: false,
                steps: [],
            };
            await expect(runPhase(phase, ctx as any)).rejects.toBe(originalError);
        });

        it('步骤抛出非 ComponentError 时包装为 ComponentError', async () => {
            const originalError = new Error('step failed');
            const step1 = jest.fn().mockRejectedValue(originalError);
            const phase: Phase = { name: 'test', steps: [step1] };
            const ctx = {
                instance: {},
                props: {},
                ctor: {},
                nodeMapMgr: null,
                debug: false,
                steps: [],
            };
            await expect(runPhase(phase, ctx as any)).rejects.toThrow(ComponentError);
            try {
                await runPhase(phase, ctx as any);
            } catch (err) {
                expect(err).toBeInstanceOf(ComponentError);
                expect((err as ComponentError).code).toBe(KernelErrorCode.PHASE_EXECUTION_FAILED);
            }
        });

        it('步骤抛出非 Error 对象时用 String() 转换消息', async () => {
            const step1 = jest.fn().mockRejectedValue('string error');
            const phase: Phase = { name: 'test', steps: [step1] };
            const ctx = {
                instance: {},
                props: {},
                ctor: {},
                nodeMapMgr: null,
                debug: false,
                steps: [],
            };
            await expect(runPhase(phase, ctx as any)).rejects.toThrow(ComponentError);
        });

        it('空步骤的 phase 正常完成', async () => {
            const phase: Phase = { name: 'empty', steps: [] };
            const ctx = {
                instance: {},
                props: {},
                ctor: {},
                nodeMapMgr: null,
                debug: false,
                steps: [],
            };
            await expect(runPhase(phase, ctx as any)).resolves.toBeUndefined();
        });
    });
});
